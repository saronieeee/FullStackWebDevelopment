/*
* Channel routes for the Diligent messaging app
*/
import express from 'express';
import db from '../db/db.js';
import {authenticateJWT} from './auth.js';

const router = express.Router();

/**
 * Get channels for a specific workspace
 */
router.get('/workspaces/:workspaceId/channels', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;

    // First, verify that the user is a member of this workspace
    const workspaceMemberCheck = await db.query(
      `SELECT 1 FROM workspace_members 
       WHERE workspace_id = $1 AND member_id = $2`,
      [workspaceId, userId]
    );

    if (workspaceMemberCheck.rows.length === 0) {
      return res.status(403).json({
        code: 403,
        message: 'You are not a member of this workspace',
      });
    }

    // Fetch channels for the workspace
    const result = await db.query(
      `SELECT c.id, c.name, c.channel_data
       FROM channels c
       WHERE c.workspace_id = $1
       ORDER BY c.name ASC`,
      [workspaceId]
    );

    res.status(200).json({
      channels: result.rows,
    });
  } catch (err) {
    console.error('Error in channels route:', err);
    next(err);
  }
});

/**
 * Get messages for a specific channel
 */
router.get('/channels/:channelId/messages', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const channelId = req.params.channelId;

    // First, get the workspace for this channel
    const channelResult = await db.query(
      `SELECT workspace_id FROM channels WHERE id = $1`,
      [channelId]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Channel not found',
      });
    }

    const workspaceId = channelResult.rows[0].workspace_id;

    // Verify that the user is a member of the workspace
    const workspaceMemberCheck = await db.query(
      `SELECT 1 FROM workspace_members 
       WHERE workspace_id = $1 AND member_id = $2`,
      [workspaceId, userId]
    );

    if (workspaceMemberCheck.rows.length === 0) {
      return res.status(403).json({
        code: 403,
        message: 'You do not have access to this channel',
      });
    }

    // Fetch messages for the channel
    const result = await db.query(
      `SELECT m.id, m.content, m.sent_at, m.parent_id, m.is_deleted, m.message_data,
       m.sender_id, mb.email as sender_email, mb.user_data->>'name' as sender_name
       FROM messages m
       JOIN members mb ON m.sender_id = mb.id
       WHERE m.channel_id = $1 AND m.is_deleted = false
       ORDER BY m.sent_at ASC`,
      [channelId]
    );

    res.status(200).json({
      messages: result.rows,
    });
  } catch (err) {
    console.error('Error in messages route:', err);
    next(err);
  }
});

/**
 * Create a new message in a channel
 */
router.post('/channels/:channelId/messages', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const channelId = req.params.channelId;
    const { content, parent_id } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: 'Message content cannot be empty',
      });
    }

    // First, get the workspace for this channel
    const channelResult = await db.query(
      `SELECT workspace_id FROM channels WHERE id = $1`,
      [channelId]
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Channel not found',
      });
    }

    const workspaceId = channelResult.rows[0].workspace_id;

    // Verify that the user is a member of the workspace
    const workspaceMemberCheck = await db.query(
      `SELECT 1 FROM workspace_members 
       WHERE workspace_id = $1 AND member_id = $2`,
      [workspaceId, userId]
    );

    if (workspaceMemberCheck.rows.length === 0) {
      return res.status(403).json({
        code: 403,
        message: 'You do not have access to this channel',
      });
    }

    // If it's a reply, verify that the parent message exists in this channel
    if (parent_id) {
      const parentCheck = await db.query(
        `SELECT 1 FROM messages WHERE id = $1 AND channel_id = $2`,
        [parent_id, channelId]
      );

      if (parentCheck.rows.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'Parent message not found in this channel',
        });
      }
    }

    // Create the new message
    const result = await db.query(
      `INSERT INTO messages (channel_id, sender_id, parent_id, content, sent_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, content, sent_at, parent_id`,
      [channelId, userId, parent_id || null, content]
    );

    // Get sender info
    const userResult = await db.query(
      `SELECT email, user_data->>'name' as name FROM members WHERE id = $1`,
      [userId]
    );

    const newMessage = {
      ...result.rows[0],
      sender_id: userId,
      sender_email: userResult.rows[0].email,
      sender_name: userResult.rows[0].name,
    };

    res.status(201).json({
      message: newMessage,
    });
  } catch (err) {
    console.error('Error creating message:', err);
    next(err);
  }
});

export default router;