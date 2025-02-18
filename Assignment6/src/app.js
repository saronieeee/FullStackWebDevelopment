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

import express from 'express';
import pkg from 'pg';
const {Pool} = pkg;
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'node:path';
import OpenApiValidator from 'express-openapi-validator';
import {fileURLToPath} from 'node:url';

class Database {
  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'dev',
      user: 'postgres',
      password: 'postgres',
    });
  }
}

const db = new Database();
const pool = db.pool;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiSpec = path.join(__dirname, '../api/openapi.yaml');
const specDocument = yaml.load(fs.readFileSync(apiSpec, 'utf8'));

app.use('/api/v0/docs', swaggerUi.serve, swaggerUi.setup(specDocument));
app.use(
    OpenApiValidator.middleware({
      apiSpec: apiSpec,
      validateRequests: true,
      validateResponses: true,
    }),
);

/**
 * Transforms a database row's email data into a flattened object.
 *
 * The seed data is stored in a nested format, for example:
 * {
 * "to": { "name": "Recipient", "email": "r@example.com" },
 * "from": { "name": "Sender", "email": "s@example.com" },
 * "subject": "...",
 * "content": "...",
 * "received": "...",
 * "sent": "..."
 * }
 *
 * The API expects a flat object with keys:
 * "to-name", "to-email", "from-name", "from-email", etc.
 * @param {object} row - The database row containing a "data" property.
 * @returns {object} A flattened email object with properties: id,
 *   to-name, to-email, from-name, from-email, subject, and received.
 */
function transformEmailData(row) {
  const data = row.data;
  return {
    'id': row.id,
    'to-name': (data.to && data.to.name) ||
      data['to-name'] || '',
    'to-email': (data.to && data.to.email) ||
      data['to-email'] || 'unknown@example.com',
    'from-name': (data.from && data.from.name) ||
      data['from-name'] || '',
    'from-email': (data.from && data.from.email) ||
      data['from-email'] || '',
    'subject': data.subject,
    'received': data.received,
  };
}

/**
 * Transforms a database row's email data into a flattened object
 * including the "content" field.
 *
 * See transformEmailData for a description of the expected input and output.
 * @param {object} row - The database row containing a "data" property.
 * @returns {object} A flattened email object with properties: id,
 *   to-name, to-email, from-name, from-email, subject, received, and content.
 */
function transformEmailDataFull(row) {
  const data = row.data;
  return {
    'id': row.id,
    'to-name': (data.to && data.to.name) ||
      data['to-name'] || '',
    'to-email': (data.to && data.to.email) ||
      data['to-email'] || 'unknown@example.com',
    'from-name': (data.from && data.from.name) ||
      data['from-name'] || '',
    'from-email': (data.from && data.from.email) ||
      data['from-email'] || '',
    'subject': data.subject,
    'received': data.received,
    'content': data.content,
  };
}

app.get('/api/v0/mail', async (req, res, next) => {
  const {mailbox, from} = req.query;
  if (from) {
    const sql =
      'SELECT b.data->>\'name\' AS mailbox_name, m.id, ' +
      'm.data - \'content\' AS data FROM mail m ' +
      'JOIN mailbox b ON m.mailbox = b.id ' +
      'WHERE (m.data->\'from\'->>\'name\' ILIKE \'%\' || $1 || \'%\' ' +
      'OR m.data->\'from\'->>\'email\' ILIKE \'%\' || $1 || \'%\')';
    const result = await pool.query(sql, [from]);
    const groups = {};
    result.rows.forEach((row) => {
      const name = row.mailbox_name;
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(transformEmailData(row));
    });
    const response = Object.entries(groups).map(([name, mail]) => ({
      name,
      mail,
    }));
    return res.json(response);
  } else if (mailbox) {
    const sqlMail =
      'SELECT id, data->>\'name\' AS name FROM mailbox ' +
      'WHERE data->>\'name\' = $1';
    const mailboxResult = await pool.query(sqlMail, [mailbox]);
    if (mailboxResult.rowCount === 0) {
      return res.status(404).json({error: 'Mailbox not found'});
    }
    const mailboxData = mailboxResult.rows[0];
    const sqlEmails =
      'SELECT id, data - \'content\' AS data FROM mail ' +
      'WHERE mailbox = $1';
    const emailsResult = await pool.query(sqlEmails, [mailboxData.id]);
    const emails = emailsResult.rows.map(transformEmailData);
    return res.json([{name: mailboxData.name, mail: emails}]);
  } else {
    const sqlMailboxes =
      'SELECT id, data->>\'name\' AS name FROM mailbox';
    const mailboxesResult = await pool.query(sqlMailboxes);
    const mailboxes = mailboxesResult.rows;
    const results = [];
    for (const mb of mailboxes) {
      const sqlEmails =
        'SELECT id, data - \'content\' AS data FROM mail ' +
        'WHERE mailbox = $1';
      const emailsResult = await pool.query(sqlEmails, [mb.id]);
      const emails = emailsResult.rows.map(transformEmailData);
      results.push({name: mb.name, mail: emails});
    }
    return res.json(results);
  }
});

app.get('/api/v0/mail/:id', async (req, res, next) => {
  const {id} = req.params;
  const result = await pool.query(
      'SELECT id, data FROM mail WHERE id = $1',
      [id],
  );
  if (result.rowCount === 0) {
    return res.status(404).json({error: 'Email not found'});
  }
  const email = result.rows[0];
  return res.json(transformEmailDataFull(email));
});

app.post('/api/v0/mail', async (req, res, next) => {
  const {'to-name': toName, 'to-email': toEmail, subject, content} =
    req.body;
  const mailboxResult = await pool.query(
      'SELECT id FROM mailbox WHERE data->>\'name\' = \'sent\'',
      [],
  );

  const sentMailboxId = mailboxResult.rows[0].id;
  const timestamp = new Date().toISOString();
  const emailData = {
    to: {name: toName, email: toEmail},
    from: {name: 'CSE186 Student', email: 'CSE186student@ucsc.edu'},
    subject: subject,
    content: content,
    received: timestamp,
    sent: timestamp,
  };
  const insertResult = await pool.query(
      'INSERT INTO mail (mailbox, data) VALUES ($1, $2) ' +
      'RETURNING id',
      [sentMailboxId, emailData],
  );
  const newId = insertResult.rows[0].id;
  return res.json(
      transformEmailDataFull({id: newId, data: emailData}),
  );
});

app.put('/api/v0/mail/:id', async (req, res, next) => {
  const {id} = req.params;
  const targetMailbox = req.query.mailbox;
  const emailResult = await pool.query(
      'SELECT m.id, m.mailbox, m.data, b.data->>\'name\' AS mailbox_name ' +
      'FROM mail m JOIN mailbox b ON m.mailbox = b.id ' +
      'WHERE m.id = $1',
      [id],
  );
  if (emailResult.rowCount === 0) {
    return res.status(404)
        .json({error: 'Email not found'});
  }
  const email = emailResult.rows[0];
  if (targetMailbox === 'sent' && email.mailbox_name !== 'sent') {
    return res.status(409)
        .json({error: 'Cannot move email to sent mailbox'});
  }
  const mailboxResult = await pool.query(
      'SELECT id FROM mailbox WHERE data->>\'name\' = $1',
      [targetMailbox],
  );
  let targetMailboxId;
  if (mailboxResult.rowCount === 0) {
    const createMailboxResult = await pool.query(
        'INSERT INTO mailbox (data) VALUES ' +
        '(jsonb_build_object(\'name\', $1::text)) RETURNING id',
        [targetMailbox],
    );
    targetMailboxId = createMailboxResult.rows[0].id;
  } else {
    targetMailboxId = mailboxResult.rows[0].id;
  }
  await pool.query(
      'UPDATE mail SET mailbox = $1 WHERE id = $2',
      [targetMailboxId, id],
  );
  return res.status(204).send();
});

export default app;
app.locals.pool = Pool;
export {transformEmailData, transformEmailDataFull};
