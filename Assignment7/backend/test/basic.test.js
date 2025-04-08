import {describe, it, beforeAll, afterAll, afterEach,
  expect, vi} from 'vitest';
import supertest from 'supertest';
import http from 'http';
import app from '../src/app.js';
import {Pool} from 'pg';
import fs from 'fs';

let server;
let request;

beforeAll(() => {
  vi.spyOn(fs, 'readFileSync').mockReturnValue('openapi: "3.0.0"');
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
});

afterAll(async () => {
  await server.close();
});

describe('GET /api/v0/mailbox', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return mailbox names', async () => {
    vi.spyOn(Pool.prototype, 'query').mockResolvedValue({
      rows: [{name: 'inbox'}, {name: 'drafts'}],
    });
    const response = await request.get('/api/v0/mailbox');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(['inbox', 'drafts']);
  });

  it('should handle a database error', async () => {
    const error = new Error('DB error');
    vi.spyOn(Pool.prototype, 'query').mockRejectedValue(error);
    const response = await request.get('/api/v0/mailbox');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({error: 'DB error'});
  });
});

describe('GET /api/v0/mail', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
      'should return 400 if mailbox query parameter is missing',
      async () => {
        const response = await request.get('/api/v0/mail');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: 'mailbox query parameter is required',
        });
      },
  );

  it('should return 404 if the mailbox is not found', async () => {
    vi.spyOn(Pool.prototype, 'query').mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });
    const response = await request.get('/api/v0/mail')
        .query({mailbox: 'nonexistent'});
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: 'Mailbox not found'});
  });

  it('should return emails for a valid mailbox', async () => {
    vi.spyOn(Pool.prototype, 'query')
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{id: 1}],
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            subject: 'Test Email',
            from: {name: 'Alice', address: 'alice@example.com'},
            to: {name: 'Bob', address: 'bob@example.com'},
            received: '2020-01-01T00:00:00Z',
          }],
        });
    const response = await request.get('/api/v0/mail')
        .query({mailbox: 'existing'});
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      id: 1,
      subject: 'Test Email',
      from: {name: 'Alice', address: 'alice@example.com'},
      to: {name: 'Bob', address: 'bob@example.com'},
      received: '2020-01-01T00:00:00Z',
    }]);
  });

  it('should handle an error during GET /mail', async () => {
    vi.spyOn(Pool.prototype, 'query').mockRejectedValue(
        new Error('Query failed'),
    );
    const response = await request.get('/api/v0/mail')
        .query({mailbox: 'any'});
    expect(response.status).toBe(500);
    expect(response.body).toEqual({error: 'Query failed'});
  });
});

describe('PUT /api/v0/mail/:id', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
      'should return 400 if mailbox query parameter is missing',
      async () => {
        const response = await request.put('/api/v0/mail/1');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: 'mailbox query parameter is required',
        });
      },
  );

  it(
      'should return 403 if trying to move email to "sent"',
      async () => {
        const response = await request.put('/api/v0/mail/1')
            .query({mailbox: 'sent'});
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          error: 'Cannot move email to sent mailbox',
        });
      },
  );

  it('should return 404 if the email is not found', async () => {
    vi.spyOn(Pool.prototype, 'query').mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });
    const response = await request.put('/api/v0/mail/999')
        .query({mailbox: 'inbox'});
    expect(response.status).toBe(404);
    expect(response.body).toEqual({error: 'Email not found'});
  });

  it(
      'should return 404 if the target mailbox is not found',
      async () => {
        vi.spyOn(Pool.prototype, 'query')
            .mockResolvedValueOnce({
              rowCount: 1,
              rows: [{id: 1}],
            })
            .mockResolvedValueOnce({
              rowCount: 0,
              rows: [],
            });
        const response = await request.put('/api/v0/mail/1')
            .query({mailbox: 'nonexistent'});
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Mailbox not found'});
      },
  );

  it(
      'should successfully move an email and return 204',
      async () => {
        vi.spyOn(Pool.prototype, 'query')
            .mockResolvedValueOnce({
              rowCount: 1,
              rows: [{id: 1}],
            })
            .mockResolvedValueOnce({
              rowCount: 1,
              rows: [{id: 2}],
            })
            .mockResolvedValueOnce({});
        const response = await request.put('/api/v0/mail/1')
            .query({mailbox: 'inbox'});
        expect(response.status).toBe(204);
      },
  );

  it('should handle an error during PUT /mail/:id', async () => {
    vi.spyOn(Pool.prototype, 'query').mockRejectedValue(
        new Error('Update failed'),
    );
    const response = await request.put('/api/v0/mail/1')
        .query({mailbox: 'inbox'});
    expect(response.status).toBe(500);
    expect(response.body).toEqual({error: 'Update failed'});
  });
});

describe('Invalid URL', () => {
  it('should return 404 for an unknown route', async () => {
    const response = await request.get('/api/v0/unknown');
    expect(response.status).toBe(404);
  });
});

describe('Swagger Docs', () => {
  it('should serve Swagger docs at /api/v0/docs', async () => {
    const response = await request.get('/api/v0/docs');
    expect(response.status).toBe(301);
    expect(response.header['content-type']).toContain('text/html');
  });
});
