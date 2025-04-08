/*
* Workspace routes for the Diligent messaging app
*/
import express from 'express';
import db from '../db/db.js';
import {authenticateJWT} from './auth.js';

const router = express.Router();

/**
 * Get workspaces for the authenticated user
 */
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    console.log('Fetching workspaces for user:', userId);

    // Query the database for workspaces the user is a member of
    const result = await db.query(
        `SELECT w.id, w.name, w.workspace_data 
         FROM workspaces w
         JOIN workspace_members wm ON w.id = wm.workspace_id
         WHERE wm.member_id = $1`,
        [userId]
    );

    console.log('Found workspaces:', result.rows.length);
    
    res.status(200).json({
      workspaces: result.rows
    });
  } catch (err) {
    console.error('Error in workspaces route:', err);
    next(err);
  }
});

export default router;