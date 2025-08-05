import express from 'express';
import { body, validationResult } from 'express-validator';
import { generateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Login route
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { email, password } = req.body;
      console.log('email: ', email, 'password: ', password);

      const user = await User.findOne({ email, isActive: true });

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            location: user.location,
          },
          token,
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Verify token route
router.get('/verify', (req, res) => {
  res.json({
    success: true,
    data: req.user,
    message: 'Token is valid',
  });
});

export default router;
