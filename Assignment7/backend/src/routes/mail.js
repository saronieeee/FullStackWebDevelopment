import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}` +
      `@localhost:5432/${process.env.POSTGRES_DB}`,
});

const router = new express.Router();

// GET /api/v0/mailbox
// Returns all mailbox names as an array of strings.
router.get('/mailbox', async (req, res, next) => {
  try {
    const result = await pool.query(
        'SELECT id, data->>\'name\' AS name FROM mailbox',
    );
    const mailboxes = result.rows.map((row) => row.name);
    res.json(mailboxes);
  } catch (error) {
    next(error);
  }
});


// GET /api/v0/mail?mailbox={mailbox}
// Returns emails in the specified mailbox (omitting the "content" field).
router.get('/mail', async (req, res, next) => {
  const mailboxName = req.query.mailbox;
  if (!mailboxName) {
    return res
        .status(400)
        .json({error: 'mailbox query parameter is required'});
  }
  try {
    // Retrieve the mailbox id by extracting the name from the JSON column.
    const mailboxResult = await pool.query(
        'SELECT id FROM mailbox WHERE data->>\'name\' = $1',
        [mailboxName],
    );
    if (mailboxResult.rowCount === 0) {
      return res.status(404).json({error: 'Mailbox not found'});
    }
    const mailboxId = mailboxResult.rows[0].id;
    // Query emails for that mailbox, using the correct foreign key column.
    const mailResult = await pool.query(
        `SELECT 
           id, 
           data->>'subject' AS subject, 
           json_build_object(
             'name', data->'from'->>'name',
             'address', data->'from'->>'email'
           ) AS "from",
           json_build_object(
             'name', data->'to'->>'name',
             'address', data->'to'->>'email'
           ) AS "to",
           data->>'received' AS received
         FROM mail 
         WHERE mailbox = $1 
         ORDER BY (data->>'received')::timestamp DESC`,
        [mailboxId],
    );
    res.json(mailResult.rows);
  } catch (error) {
    next(error);
  }
});


// PUT /api/v0/mail/{id}?mailbox={mailbox}
// Moves an email to the specified mailbox.
router.put('/mail/:id', async (req, res, next) => {
  const emailId = req.params.id;
  const newMailboxName = req.query.mailbox;

  if (!newMailboxName) {
    return res.status(400).json({error: 'mailbox query parameter is required'});
  }
  if (newMailboxName.toLowerCase() === 'sent') {
    return res.status(403).json({error: 'Cannot move email to sent mailbox'});
  }

  try {
    // 1. Verify that the email exists.
    const emailResult = await pool.query(
        'SELECT * FROM mail WHERE id = $1',
        [emailId],
    );
    if (emailResult.rowCount === 0) {
      return res.status(404).json({error: 'Email not found'});
    }

    // 2. Look up the mailbox id using the same logic as in GET /mail
    const mailboxResult = await pool.query(
        'SELECT id FROM mailbox WHERE data->>\'name\' ILIKE $1',
        [newMailboxName],
    );
    if (mailboxResult.rowCount === 0) {
      return res.status(404).json({error: 'Mailbox not found'});
    }
    const newMailboxId = mailboxResult.rows[0].id;

    // 3. Update the mail record with the new mailbox id.
    await pool.query(
        'UPDATE mail SET mailbox = $1 WHERE id = $2',
        [newMailboxId, emailId],
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
