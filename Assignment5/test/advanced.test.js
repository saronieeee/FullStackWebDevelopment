/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {it, beforeAll, beforeEach,
  afterEach, afterAll, describe, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';
import {fileURLToPath} from 'url';

import fs from 'fs/promises';
import path from 'path';
import app from '../src/app.js';

let server;
let request;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
});

afterAll(async () => {
  await server.close();
});

it('Errors on invalid URL', async () => {
  await request.get('/api/v0/entirely-invalid-path')
      .expect(404);
});

it('Serves API Docs', async () => {
  await request.get('/api/v0/docs/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
});


/* Add additional tests below here */

// Original API endpoint tests
describe('API Endpoints', () => {
  it('Errors on invalid URL', async () => {
    await request.get('/api/v0/entirely-invalid-path')
        .expect(404);
  });

  it('Serves API Docs', async () => {
    await request.get('/api/v0/docs/')
        .expect(200)
        .expect('Content-Type', /text\/html/);
  });

  describe('GET /mail', () => {
    it('returns all mailboxes when no mailbox specified', async () => {
      const response = await request.get('/api/v0/mail')
          .expect(200)
          .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('returns specific mailbox when mailbox specified', async () => {
      const response = await request.get('/api/v0/mail?mailbox=inbox')
          .expect(200);

      expect(response.body[0].name).toBe('inbox');
    });

    it('returns 404 for non-existent mailbox', async () => {
      await request.get('/api/v0/mail?mailbox=nonexistent')
          .expect(404);
    });
  });

  describe('GET /mail/{id}', () => {
    let knownEmailId;

    beforeAll(async () => {
      const response = await request.get('/api/v0/mail?mailbox=inbox');
      knownEmailId = response.body[0].mail[0].id;
    });

    it('returns email when found', async () => {
      const response = await request.get(`/api/v0/mail/${knownEmailId}`)
          .expect(200);

      expect(response.body.id).toBe(knownEmailId);
    });

    it('returns 404 for non-existent email', async () => {
      await request.get('/api/v0/mail/00000000-0000-0000-0000-000000000000')
          .expect(404);
    });
  });

  describe('POST /mail', () => {
    it('creates new email', async () => {
      const newEmail = {
        'to-name': 'Test Recipient',
        'to-email': 'test@example.com',
        'subject': 'Test Subject',
        'content': 'Test Content',
      };

      const response = await request.post('/api/v0/mail')
          .send(newEmail)
          .expect(200);

      expect(response.body.id).toBeDefined();
    });

    it('returns 400 for invalid email', async () => {
      const invalidEmail = {
        'to-name': 'Test',
      };

      await request.post('/api/v0/mail')
          .send(invalidEmail)
          .expect(400);
    });
  });

  describe('PUT /mail/{id}', () => {
    let emailIdToMove;

    beforeAll(async () => {
      const response = await request.get('/api/v0/mail?mailbox=inbox');
      emailIdToMove = response.body[0].mail[0].id;
    });

    it('moves email to existing mailbox', async () => {
      await request.put(`/api/v0/mail/${emailIdToMove}?mailbox=trash`)
          .expect(204);
    });

    it('returns 404 for non-existent email', async () => {
      await request.put(
          '/api/v0/mail/00000000-0000-0000-0000-000000000000?mailbox=trash')
          .expect(404);
    });

    it('returns 400 for missing mailbox parameter', async () => {
      await request.put(`/api/v0/mail/${emailIdToMove}`)
          .expect(400);
    });
  });
});

describe('Error Handling', () => {
  // Test invalid UUID format (lines 118-119, 123-124)
  it('returns 400 for invalid UUID format', async () => {
    await request.get('/api/v0/mail/invalid-uuid-format')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });
  });

  // Test invalid email format (lines 158-159)
  it('returns 400 for invalid email format in POST request', async () => {
    const invalidEmail = {
      'to-name': 'Test Recipient',
      'to-email': 'not-an-email', // Invalid email format
      'subject': 'Test Subject',
      'content': 'Test Content',
    };

    await request.post('/api/v0/mail')
        .send(invalidEmail)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });
  });

  // Test missing required fields (lines 172-173)
  it('returns 400 for missing required fields in POST request', async () => {
    const incompleteEmail = {
      'to-name': 'Test Recipient',
      // Missing to-email, subject, and content
    };

    await request.post('/api/v0/mail')
        .send(incompleteEmail)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });
  });

  // Test moving email to sent mailbox (lines 183-184)
  it('returns 409 when attempting to move email to sent mailbox', async () => {
    // First, get an email ID from inbox
    const inboxResponse = await request.get('/api/v0/mail?mailbox=inbox');
    const emailId = inboxResponse.body[0].mail[0].id;

    await request.put(`/api/v0/mail/${emailId}?mailbox=sent`)
        .expect(409)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body.error).toBe('Cannot move to sent mailbox');
        });
  });

  it('creates new mailbox when moving email to na mailbox', async () => {
    // First, get an email ID from inbox
    const inboxResponse = await request.get('/api/v0/mail?mailbox=inbox');
    const emailId = inboxResponse.body[0].mail[0].id;

    // Move email to a new mailbox
    const newMailboxName = 'new-custom-mailbox';
    await request.put(`/api/v0/mail/${emailId}?mailbox=${newMailboxName}`)
        .expect(204);

    // Verify the email was moved to the new mailbox
    const response = await request.get(`/api/v0/mail?mailbox=${newMailboxName}`)
        .expect(200)
        .expect('Content-Type', /json/);

    expect(response.body[0].name).toBe(newMailboxName);
    expect(response.body[0].mail).toHaveLength(1);
    expect(response.body[0].mail[0].id).toBe(emailId);
  });
});

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
