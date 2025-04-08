/*
* User routes for the Diligent messaging app
*/
import express from 'express';
import db from '../db/db.js';
import {authenticateJWT} from './auth.js';

const router = express.Router();

/**
 * Get current user information
 */
router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Query the database for the user with the given ID
    const result = await db.query(
        'SELECT id, email, user_data FROM members WHERE id = $1',
        [userId]
    );

    // Check if user exists (should always be true if JWT is valid)
    if (result.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    const user = result.rows[0];
    const userData = user.user_data;

    // Format response according to API spec
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: userData.name || user.email.split('@')[0],
      role: userData.role || 'member',
      status: userData.status || 'active',
      lastLogin: userData.last_login,
      preferences: userData.preferences || {
        lastWorkspace: null,
        lastChannel: null,
        lastMessage: null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Update user preferences (for remembering last workspace/channel/message)
 */
router.patch('/me/preferences', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {lastWorkspace, lastChannel, lastMessage} = req.body;

    // Get current user data
    const userResult = await db.query(
        'SELECT user_data FROM members WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    const userData = userResult.rows[0].user_data;

    // Update preferences
    if (!userData.preferences) {
      userData.preferences = {};
    }

    if (lastWorkspace !== undefined) {
      userData.preferences.lastWorkspace = lastWorkspace;
    }
    
    if (lastChannel !== undefined) {
      userData.preferences.lastChannel = lastChannel;
    }
    
    if (lastMessage !== undefined) {
      userData.preferences.lastMessage = lastMessage;
    }

    // Save updated user data
    await db.query(
        'UPDATE members SET user_data = $1 WHERE id = $2',
        [userData, userId]
    );

    res.status(200).json({
      preferences: userData.preferences,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Update user status (active/away)
 */
router.patch('/me/status', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {status} = req.body;

    if (!['active', 'away'].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: 'Status must be either "active" or "away"',
      });
    }

    // Get current user data
    const userResult = await db.query(
        'SELECT user_data FROM members WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    const userData = userResult.rows[0].user_data;

    // Update status
    userData.status = status;

    // Save updated user data
    await db.query(
        'UPDATE members SET user_data = $1 WHERE id = $2',
        [userData, userId]
    );

    res.status(200).json({
      status: userData.status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;