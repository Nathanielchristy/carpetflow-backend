import express from 'express';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'asc' } = req.query;
    const userLocation = req.user.location;

    let query = {};
    if (userLocation !== 'all') {
      query.location = userLocation;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const customers = await Customer.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: customers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    if (userLocation !== 'all' && customer.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new customer
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty().trim(),
    body('address').notEmpty().trim(),
    body('city').notEmpty().trim(),
    body('location').notEmpty().trim(),
    body('taxNumber').optional().trim(),
    body('creditLimit').optional().isNumeric(),
    body('paymentTerms').optional().trim(),
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

      const {
        name,
        email,
        phone,
        address,
        city,
        location,
        taxNumber,
        creditLimit,
        paymentTerms,
      } = req.body;

      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          error: 'Customer with this email already exists',
        });
      }

      const newCustomer = new Customer({
        name,
        email,
        phone,
        address,
        city,
        location,
        taxNumber,
        creditLimit,
        paymentTerms,
        createdBy: req.user.id,
      });

      await newCustomer.save();

      res.status(201).json({
        success: true,
        data: newCustomer,
        message: 'Customer created successfully',
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Update customer
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().notEmpty().trim(),
    body('address').optional().notEmpty().trim(),
    body('city').optional().notEmpty().trim(),
    body('location').optional().notEmpty().trim(),
    body('taxNumber').optional().trim(),
    body('creditLimit').optional().isNumeric(),
    body('paymentTerms').optional().trim(),
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

      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
      }

      if (userLocation !== 'all' && customer.location !== userLocation) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      res.json({
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully',
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    if (userLocation !== 'all' && customer.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      data: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
