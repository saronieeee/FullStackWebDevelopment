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

import {describe, it, beforeAll, afterAll, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';
import app from '../src/app.js';

let server;
let request;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
});

afterAll(() => {
  server.close();
});

describe('GET /api/v0/mail with "from" query', () => {
  it('grouped mail containing emails from a sender', async () => {
    const fromQuery = 'cse186 student';
    const response = await request
        .get(`/api/v0/mail?from=${encodeURIComponent(fromQuery)}`)
        .expect(200);
    const groups = response.body;
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((group) => {
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('mail');
      expect(Array.isArray(group.mail)).toBe(true);
      group.mail.forEach((email) => {
        expect(email['from-name'].toLowerCase()).toContain('cse186 student');
        expect(email['from-email']).toBe('CSE186student@ucsc.edu');
        expect(email).not.toHaveProperty('content');
      });
    });
  });
});
