/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {describe, it, beforeAll, afterAll, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';

import {reset, close} from './db.js';
import app, {transformEmailData, transformEmailDataFull} from '../src/app.js';

let server;
let request;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  await reset();
});

afterAll(async () => {
  await close();
  await server.close();
});

describe('Invalid URL', () => {
  it('Errors on GET invalid URL', async () => {
    await request.get('/api/v0/so-not-a-real-end-point').expect(404);
  });
});

describe('GET /api/v0/mail', () => {
  it('Returns mailboxes with emails without content', async () => {
    const res = await request.get('/api/v0/mail').expect(200);
    const mailboxes = res.body;
    expect(Array.isArray(mailboxes)).toBe(true);
    expect(mailboxes.length).toBeGreaterThan(0);
    mailboxes.forEach((mailbox) => {
      expect(mailbox).toHaveProperty('name');
      expect(mailbox).toHaveProperty('mail');
      expect(Array.isArray(mailbox.mail)).toBe(true);
      mailbox.mail.forEach((email) => {
        expect(email).toHaveProperty('id');
        expect(email).toHaveProperty('to-name');
        expect(email).toHaveProperty('to-email');
        expect(email).toHaveProperty('from-name');
        expect(email).toHaveProperty('from-email');
        expect(email).toHaveProperty('subject');
        expect(email).toHaveProperty('received');
        expect(email).not.toHaveProperty('content');
      });
    });
  });

  it('Returns a specific mailbox when parameter is provided', async () => {
    const res = await request.get('/api/v0/mail?mailbox=inbox').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('inbox');
  });

  it('Returns 404 for a non-existent mailbox', async () => {
    await request.get('/api/v0/mail?mailbox=nonexistent').expect(404);
  });
});

describe('GET /api/v0/mail/:id', () => {
  let emailId;
  beforeAll(async () => {
    // Get an existing email id from the "sent" mailbox
    const res = await request.get('/api/v0/mail?mailbox=sent').expect(200);
    if (res.body.length > 0 && res.body[0].mail.length > 0) {
      emailId = res.body[0].mail[0].id;
    }
  });

  it('Returns a specific email with content (flattened)', async () => {
    const res = await request.get(`/api/v0/mail/${emailId}`).expect(200);
    const email = res.body;
    expect(email).toHaveProperty('id', emailId);
    expect(email).toHaveProperty('to-name');
    expect(email).toHaveProperty('to-email');
    expect(email).toHaveProperty('from-name');
    expect(email).toHaveProperty('from-email');
    expect(email).toHaveProperty('subject');
    expect(email).toHaveProperty('received');
    expect(email).toHaveProperty('content');
  });

  it('Returns 404 for non-existent email id', async () => {
    await request.get(
        '/api/v0/mail/00000000-0000-0000-0000-000000000000',
    ).expect(404);
  });
});

describe('POST /api/v0/mail', () => {
  it('Creates a new email and returns it flattened', async () => {
    const payload = {
      'to-name': 'Test Recipient',
      'to-email': 'test@example.com',
      'subject': 'Test Subject',
      'content': 'Test content',
    };
    const res = await request.post('/api/v0/mail').send(payload).expect(200);
    const email = res.body;
    expect(email).toHaveProperty('id');
    expect(email).toHaveProperty('to-name', payload['to-name']);
    expect(email).toHaveProperty('to-email', payload['to-email']);
    expect(email).toHaveProperty('from-name', 'CSE186 Student');
    expect(email).toHaveProperty('from-email', 'CSE186student@ucsc.edu');
    expect(email).toHaveProperty('subject', payload.subject);
    expect(email).toHaveProperty('received');
    expect(email).toHaveProperty('content', payload.content);
  });
});

describe('PUT /api/v0/mail/:id', () => {
  let emailIdToMove;
  beforeAll(async () => {
    const payload = {
      'to-name': 'Move Test',
      'to-email': 'move@example.com',
      'subject': 'Move Subject',
      'content': 'Move content',
    };
    const res = await request.post('/api/v0/mail').send(payload).expect(200);
    emailIdToMove = res.body.id;
  });

  it('Returns 400 when mailbox query parameter is missing', async () => {
    await request.put(`/api/v0/mail/${emailIdToMove}`).expect(400);
  });

  it('Returns 404 for non-existent email id on PUT', async () => {
    await request.put(
        '/api/v0/mail/00000000-0000-0000-0000-000000000000?mailbox=archive',
    ).expect(404);
  });

  it('409 when moving email to sent if not already in sent', async () => {
    const res = await request.get('/api/v0/mail?mailbox=inbox').expect(200);
    if (res.body.length > 0 && res.body[0].mail.length > 0) {
      const emailId = res.body[0].mail[0].id;
      await request.put(`/api/v0/mail/${emailId}?mailbox=sent`).expect(409);
    }
  });

  it('Updates email to a new mailbox (creation branch)', async () => {
    // Generate a unique mailbox name so that it doesn't exist
    const uniqueMailbox = `archive-${Date.now()}`;
    const payload = {
      'to-name': 'Unique Move Test',
      'to-email': 'uniquemove@example.com',
      'subject': 'Unique Move Subject',
      'content': 'Unique move content',
    };
    const postRes = await request.post(
        '/api/v0/mail').send(payload).expect(200);
    const emailId = postRes.body.id;
    await request.put(
        `/api/v0/mail/${emailId}?mailbox=${uniqueMailbox}`).expect(204);
    const getRes = await request.get(
        `/api/v0/mail?mailbox=${uniqueMailbox}`).expect(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBe(1);
    const mailbox = getRes.body[0];
    expect(mailbox.name).toBe(uniqueMailbox);
    const emailIds = mailbox.mail.map((email) => email.id);
    expect(emailIds).toContain(emailId);
  });

  it('Updates email to an existing mailbox', async () => {
    const payload = {
      'to-name': 'Move Test Existing',
      'to-email': 'movetestexisting@example.com',
      'subject': 'Move Existing Mailbox',
      'content': 'Content for move existing mailbox',
    };
    const postRes = await request.post(
        '/api/v0/mail').send(payload).expect(200);
    const emailId = postRes.body.id;
    await request.put(`/api/v0/mail/${emailId}?mailbox=inbox`).expect(204);
    const getRes = await request.get('/api/v0/mail?mailbox=inbox').expect(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBe(1);
    const mailbox = getRes.body[0];
    expect(mailbox.name).toBe('inbox');
    const emailIds = mailbox.mail.map((email) => email.id);
    expect(emailIds).toContain(emailId);
  });
});

describe('transformEmailData', () => {
  it('flattens nested email data correctly (with to/from objects)', () => {
    const row = {
      id: 'abc123',
      data: {
        to: {name: 'Alice', email: 'alice@example.com'},
        from: {name: 'Bob', email: 'bob@example.com'},
        subject: 'Nested Test',
        received: '2023-01-01T00:00:00Z',
        content: 'This content should be removed',
      },
    };
    const result = transformEmailData(row);
    expect(result).toEqual({
      'id': 'abc123',
      'to-name': 'Alice',
      'to-email': 'alice@example.com',
      'from-name': 'Bob',
      'from-email': 'bob@example.com',
      'subject': 'Nested Test',
      'received': '2023-01-01T00:00:00Z',
    });
  });

  it('falls back to flat keys if nested keys are missing', () => {
    const row = {
      id: 'def456',
      data: {
        'to-name': 'Charlie',
        'to-email': 'charlie@example.com',
        'from-name': 'Dana',
        'from-email': 'dana@example.com',
        'subject': 'Flat Keys Test',
        'received': '2023-01-02T00:00:00Z',
      },
    };
    const result = transformEmailData(row);
    expect(result).toEqual({
      'id': 'def456',
      'to-name': 'Charlie',
      'to-email': 'charlie@example.com',
      'from-name': 'Dana',
      'from-email': 'dana@example.com',
      'subject': 'Flat Keys Test',
      'received': '2023-01-02T00:00:00Z',
    });
  });

  it('uses default for missing email fields', () => {
    const row = {
      id: 'ghi789',
      data: {
        subject: 'Missing Emails',
        received: '2023-01-03T00:00:00Z',
      },
    };
    const result = transformEmailData(row);
    expect(result).toEqual({
      'id': 'ghi789',
      'to-name': '',
      'to-email': 'unknown@example.com',
      'from-name': '',
      'from-email': '',
      'subject': 'Missing Emails',
      'received': '2023-01-03T00:00:00Z',
    });
  });
});

describe('transformEmailDataFull', () => {
  it('flattens nested email data including content', () => {
    const row = {
      id: 'abc321',
      data: {
        to: {name: 'Eve', email: 'eve@example.com'},
        from: {name: 'Frank', email: 'frank@example.com'},
        subject: 'Full Test',
        received: '2023-02-01T00:00:00Z',
        content: 'This is the full content',
      },
    };
    const result = transformEmailDataFull(row);
    expect(result).toEqual({
      'id': 'abc321',
      'to-name': 'Eve',
      'to-email': 'eve@example.com',
      'from-name': 'Frank',
      'from-email': 'frank@example.com',
      'subject': 'Full Test',
      'received': '2023-02-01T00:00:00Z',
      'content': 'This is the full content',
    });
  });

  it('falls back to flat keys and defaults including content', () => {
    const row = {
      id: 'def654',
      data: {
        'to-name': 'Grace',
        'to-email': 'grace@example.com',
        'from-name': 'Heidi',
        'from-email': 'heidi@example.com',
        'subject': 'Flat Full Test',
        'received': '2023-02-02T00:00:00Z',
        'content': 'Flat full content',
      },
    };
    const result = transformEmailDataFull(row);
    expect(result).toEqual({
      'id': 'def654',
      'to-name': 'Grace',
      'to-email': 'grace@example.com',
      'from-name': 'Heidi',
      'from-email': 'heidi@example.com',
      'subject': 'Flat Full Test',
      'received': '2023-02-02T00:00:00Z',
      'content': 'Flat full content',
    });
  });

  it('uses default for missing email fields but includes content', () => {
    const row = {
      id: 'ghi987',
      data: {
        subject: 'Missing Full Fields',
        received: '2023-02-03T00:00:00Z',
        content: 'Content with missing fields',
      },
    };
    const result = transformEmailDataFull(row);
    expect(result).toEqual({
      'id': 'ghi987',
      'to-name': '',
      'to-email': 'unknown@example.com',
      'from-name': '',
      'from-email': '',
      'subject': 'Missing Full Fields',
      'received': '2023-02-03T00:00:00Z',
      'content': 'Content with missing fields',
    });
  });
});
