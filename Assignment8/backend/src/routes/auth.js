/*
* Authentication routes for the Diligent messaging app
*/
import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import {compareSync} from 'bcrypt';

const router = express.Router();

// Secret key from environment variable
const JWT_SECRET = process.env.SECRET || 'XZBN24IQYIxd9meHiZu68xMkE5wNxwuy';

/**
 * Login endpoint - authenticate user and return JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const {email, password} = req.body;

    // Query the database for the user with the given email
    const result = await db.query(
        'SELECT id, email, password_hash, user_data FROM members WHERE email = $1',
        [email]
    );

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        code: 401,
        message: 'user does not exist',
      });
    }

    const user = result.rows[0];
    
    // Verify password
    if (!compareSync(password, user.password_hash)) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid email or password',
      });
    }

    // User is authenticated, create a JWT token
    const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        JWT_SECRET,
        {expiresIn: '24h'}
    );

    // Update last login time
    const userData = user.user_data;
    userData.last_login = new Date();
    
    await db.query(
        'UPDATE members SET user_data = $1 WHERE id = $2',
        [userData, user.id]
    );

    // Return user information and token
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: userData.name || email.split('@')[0],
        role: userData.role || 'member',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Logout endpoint
 */
router.post('/logout', authenticateJWT, async (req, res, next) => {
  try {
    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Middleware to authenticate JWT token
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: 'Access token is missing',
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid or expired token',
      });
    }

    req.user = user;
    next();
  });
}

// Test endpoint to validate token directly
router.get('/validate-token', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid header format' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ 
      valid: true, 
      decoded: decoded,
      message: 'Token is valid'
    });
  } catch (err) {
    return res.status(401).json({ 
      valid: false, 
      error: err.message,
      message: 'Token validation failed'
    });
  }
});

export default router;