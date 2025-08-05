import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'asc' } = req.query;
    const userLocation = req.user.location;

    let query = {};
    if (userLocation !== 'all') {
      query.location = userLocation;
    }

    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (userLocation !== 'all' && user.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new user
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty().trim(),
    body('role').isIn(['admin', 'salesperson', 'warehouse', 'accountant']),
    body('location').notEmpty().trim(),
  ],
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

      const { email, password, fullName, role, location } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists',
        });
      }

      const newUser = new User({
        email,
        password,
        fullName,
        role,
        location,
      });

      await newUser.save();

      res.status(201).json({
        success: true,
        data: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            location: newUser.location,
        },
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Update user
router.put(
  '/:id',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('fullName').optional().notEmpty().trim(),
    body('role').optional().isIn(['admin', 'salesperson', 'warehouse', 'accountant']),
    body('location').optional().notEmpty().trim(),
    body('isActive').optional().isBoolean(),
  ],
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

      const { id } = req.params;
      const userLocation = req.user.location;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      if (userLocation !== 'all' && user.location !== userLocation) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (userLocation !== 'all' && user.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      data: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
