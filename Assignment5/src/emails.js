import express from 'express';
import {v4 as createUuid} from 'uuid';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email Service Implementation
class EmailService {
  constructor() {
    this.mailboxes = new Map();
    this.loadMailboxes();
  }

  loadMailboxes() {
    // Load the default mailboxes from JSON files
    const mailboxFiles = ['inbox.json', 'sent.json', 'trash.json'];

    mailboxFiles.forEach((file) => {
      const mailboxName = path.basename(file, '.json');
      const filePath = path.join(__dirname, '..', 'data', file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.mailboxes.set(mailboxName, jsonData);
    });
  }

  getAllMailboxes() {
    const result = [];
    for (const [name, emails] of this.mailboxes) {
      result.push({
        name,
        mail: emails.map((email) => {
          // Create new object without content property
          return {
            'id': email.id,
            'to-name': email['to-name'],
            'to-email': email['to-email'],
            'from-name': email['from-name'],
            'from-email': email['from-email'],
            'subject': email.subject,
            'received': email.received,
          };
        }),
      });
    }
    return result;
  }

  getMailbox(mailboxName) {
    const mailbox = this.mailboxes.get(mailboxName);
    if (!mailbox) {
      throw new Error('Mailbox not found');
    }
    return [{
      name: mailboxName,
      mail: mailbox.map((email) => {
        // Create new object without content property
        return {
          'id': email.id,
          'to-name': email['to-name'],
          'to-email': email['to-email'],
          'from-name': email['from-name'],
          'from-email': email['from-email'],
          'subject': email.subject,
          'received': email.received,
        };
      }),
    }];
  }

  getEmail(id) {
    for (const emails of this.mailboxes.values()) {
      const email = emails.find((e) => e.id === id);
      if (email) {
        return email;
      }
    }
    throw new Error('Email not found');
  }

  createEmail(newEmail) {
    const sentEmail = {
      'id': createUuid(),
      ...newEmail,
      'from-name': 'CSE186 Student',
      'from-email': 'cse186-student@ucsc.edu',
      'received': new Date().toISOString(),
    };

    const sentMailbox = this.mailboxes.get('sent');
    sentMailbox.push(sentEmail);
    return sentEmail;
  }

  moveEmail(id, targetMailbox) {
    let sourceMailbox = null;
    let emailToMove = null;
    let emailIndex = -1;

    // Find the email
    for (const [boxName, emails] of this.mailboxes) {
      emailIndex = emails.findIndex((e) => e.id === id);
      if (emailIndex !== -1) {
        sourceMailbox = boxName;
        emailToMove = emails[emailIndex];
        break;
      }
    }

    if (!emailToMove) {
      throw new Error('Email not found');
    }

    // Check if trying to move to sent mailbox
    if (targetMailbox === 'sent' && sourceMailbox !== 'sent') {
      throw new Error('Cannot move to sent mailbox');
    }

    // Create new mailbox if it doesn't exist
    if (!this.mailboxes.has(targetMailbox)) {
      this.mailboxes.set(targetMailbox, []);
    }

    // Remove from source mailbox
    this.mailboxes.get(sourceMailbox).splice(emailIndex, 1);

    // Add to target mailbox
    this.mailboxes.get(targetMailbox).push(emailToMove);
  }
}

// Create a single instance of the email service
const service = new EmailService();

// Route Handlers
const router = new express.Router();

// Export both the service and the router
export const emailService = service;

// Get all mail or mail from a specific mailbox
router.get('/mail', (req, res, next) => {
  try {
    const {mailbox} = req.query;
    if (mailbox) {
      const result = service.getMailbox(mailbox);
      res.json(result);
    } else {
      const result = service.getAllMailboxes();
      res.json(result);
    }
  } catch (error) {
    if (error.message === 'Mailbox not found') {
      res.status(404).json({error: 'Mailbox not found'});
    }
  }
});

// Get a specific email by ID
router.get('/mail/:id', (req, res, next) => {
  try {
    const email = service.getEmail(req.params.id);
    res.json(email);
  } catch (error) {
    if (error.message === 'Email not found') {
      res.status(404).json({error: 'Email not found'});
    }
  }
});

// Create a new email
router.post('/mail', (req, res, next) => {
  const newEmail = service.createEmail(req.body);
  res.json(newEmail);
});

// Move an email to a different mailbox
router.put('/mail/:id', (req, res, next) => {
  try {
    const {mailbox} = req.query;

    service.moveEmail(req.params.id, mailbox);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Email not found') {
      res.status(404).json({error: 'Email not found'});
    } else if (error.message === 'Cannot move to sent mailbox') {
      res.status(409).json({error: 'Cannot move to sent mailbox'});
    }
  }
});

export const emails = service;
export default router;
