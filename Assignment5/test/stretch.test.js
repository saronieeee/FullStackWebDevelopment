/* Your tets for the Stretch Requirement go in here */

import {it, beforeEach,
  afterEach, describe, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';
import {fileURLToPath} from 'url';

import fs from 'fs/promises';
import path from 'path';
import app from '../src/app.js';


describe('Email Service Persistence', () => {
  let server;
  let request;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const testDataDir = path.join(__dirname, '..', 'data');

  // Helper to get the content of a mailbox file
  const readMailboxFile = async (mailboxName) => {
    const filePath = path.join(testDataDir, `${mailboxName}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  };

  beforeEach(async () => {
    // Create a fresh server instance for each test
    server = http.createServer(app);
    server.listen();
    request = supertest(server);

    // First, clean up any leftover files from previous tests
    const currentFiles = await fs.readdir(testDataDir);
    for (const file of currentFiles) {
      if (file.endsWith('.json') &&
          !['inbox.json', 'sent.json', 'trash.json'].includes(file)) {
        await fs.unlink(path.join(testDataDir, file));
      }
    }
  });

  afterEach(async () => {
    await server.close();

    // Get list of original files that had backups
    const files = await fs.readdir(testDataDir);

    // Then remove any new mailbox files and leftover backup files
    for (const file of files) {
      const filePath = path.join(testDataDir, file);
      if (file.endsWith('.json') &&
          !['inbox.json', 'sent.json', 'trash.json'].includes(file)) {
        await fs.unlink(filePath);
      }
    }
  });

  it('persists new emails to disk', async () => {
    // Create a new email
    const newEmail = {
      'to-name': 'Test Recipient',
      'to-email': 'test@example.com',
      'subject': 'Persistence Test',
      'content': 'This email should be saved to disk',
    };

    const response = await request.post('/api/v0/mail')
        .send(newEmail)
        .expect(200);

    // Verify the email exists in the sent mailbox file
    const sentMailbox = await readMailboxFile('sent');
    const savedEmail = sentMailbox.find((e) => e.id === response.body.id);
    expect(savedEmail).toBeDefined();
    expect(savedEmail['to-name']).toBe(newEmail['to-name']);
  });

  it('persists email moves to disk', async () => {
    // Get an email from inbox
    const inboxResponse = await request.get('/api/v0/mail?mailbox=inbox');
    const emailId = inboxResponse.body[0].mail[0].id;

    // Move it to a new custom mailbox
    const newMailboxName = 'custom-test-box';
    await request.put(`/api/v0/mail/${emailId}?mailbox=${newMailboxName}`)
        .expect(204);

    // Verify the email exists in the new mailbox file
    const customMailbox = await readMailboxFile(newMailboxName);
    expect(customMailbox).toHaveLength(1);
    expect(customMailbox[0].id).toBe(emailId);

    // Verify the email is removed from inbox file
    const inboxMailbox = await readMailboxFile('inbox');
    expect(inboxMailbox.find((e) => e.id === emailId)).toBeUndefined();
  });

  it('maintains persistence across server restarts', async () => {
    // Create a new mailbox and move an email to it
    const inboxResponse = await request.get('/api/v0/mail?mailbox=inbox');
    const emailId = inboxResponse.body[0].mail[0].id;

    const newMailboxName = 'restart-test-box';
    await request.put(`/api/v0/mail/${emailId}?mailbox=${newMailboxName}`)
        .expect(204);

    // Close the server
    await server.close();

    // Start a new server instance
    server = http.createServer(app);
    server.listen();
    request = supertest(server);

    // Verify the email is still in the new mailbox
    const response = await request.get(`/api/v0/mail?mailbox=${newMailboxName}`)
        .expect(200);

    expect(response.body[0].mail).toHaveLength(1);
    expect(response.body[0].mail[0].id).toBe(emailId);
  });

  it('returns 400 when mailbox is missing in move request', async () => {
    // Get an email ID to attempt to move
    const inboxResponse = await request.get('/api/v0/mail?mailbox=inbox');
    const emailId = inboxResponse.body[0].mail[0].id;

    // Attempt to move without specifying mailbox parameter
    const response = await request.put(`/api/v0/mail/${emailId}`)
        .expect(400)
        .expect('Content-Type', /json/);

    expect(response.body.error).toBe(
        'request/query must have required property \'mailbox\'');
  });
});
