import express from 'express';
import { body, validationResult } from 'express-validator';
import Inventory from '../models/Inventory.js';
import StockMovement from '../models/StockMovement.js';

const router = express.Router();

// Get all inventory items
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

    const items = await Inventory.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: items,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    if (userLocation !== 'all' && item.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new inventory item
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('type').notEmpty().trim(),
    body('color').notEmpty().trim(),
    body('size').notEmpty().trim(),
    body('material').notEmpty().trim(),
    body('rollLength').isNumeric(),
    body('unitPrice').isNumeric(),
    body('costPrice').isNumeric(),
    body('stockQuantity').isNumeric(),
    body('minimumStock').isNumeric(),
    body('maximumStock').isNumeric(),
    body('barcode').notEmpty().trim(),
    body('sku').notEmpty().trim(),
    body('location').notEmpty().trim(),
    body('supplier').optional().trim(),
    body('description').optional().trim(),
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
        type,
        color,
        size,
        material,
        rollLength,
        unitPrice,
        costPrice,
        stockQuantity,
        minimumStock,
        maximumStock,
        barcode,
        sku,
        location,
        supplier,
        description,
      } = req.body;

      const existingItem = await Inventory.findOne({ $or: [{ barcode }, { sku }] });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          error: 'Item with this barcode or SKU already exists',
        });
      }

      const newItem = new Inventory({
        name,
        type,
        color,
        size,
        material,
        rollLength,
        unitPrice,
        costPrice,
        stockQuantity,
        minimumStock,
        maximumStock,
        barcode,
        sku,
        location,
        supplier,
        description,
        createdBy: req.user.id,
      });

      await newItem.save();

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Inventory item created successfully',
      });
    } catch (error) {
      console.error('Create inventory item error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Update inventory item
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('type').optional().notEmpty().trim(),
    body('color').optional().notEmpty().trim(),
    body('size').optional().notEmpty().trim(),
    body('material').optional().notEmpty().trim(),
    body('rollLength').optional().isNumeric(),
    body('unitPrice').optional().isNumeric(),
    body('costPrice').optional().isNumeric(),
    body('minimumStock').optional().isNumeric(),
    body('maximumStock').optional().isNumeric(),
    body('supplier').optional().trim(),
    body('description').optional().trim(),
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

      const item = await Inventory.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found',
        });
      }

      if (userLocation !== 'all' && item.location !== userLocation) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const allowedUpdates = [
        'name',
        'type',
        'color',
        'size',
        'material',
        'rollLength',
        'unitPrice',
        'costPrice',
        'minimumStock',
        'maximumStock',
        'supplier',
        'description',
      ];
      const updates = {};
      for (const key in req.body) {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      }
      updates.updatedAt = new Date();

      const updatedItem = await Inventory.findByIdAndUpdate(id, updates, {
        new: true,
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Inventory item updated successfully',
      });
    } catch (error) {
      console.error('Update inventory item error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    if (userLocation !== 'all' && item.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    await Inventory.findByIdAndDelete(id);

    res.json({
      success: true,
      data: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Update stock quantity
router.patch(
  '/:id/stock',
  [
    body('quantity').isNumeric(),
    body('movementType').isIn(['in', 'out', 'adjustment']),
    body('notes').optional().trim(),
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
      const { quantity, movementType, notes } = req.body;
      const userLocation = req.user.location;

      const item = await Inventory.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found',
        });
      }

      if (userLocation !== 'all' && item.location !== userLocation) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const previousQuantity = item.stockQuantity;
      let newQuantity = previousQuantity;

      switch (movementType) {
        case 'in':
          newQuantity += parseInt(quantity);
          break;
        case 'out':
          newQuantity -= parseInt(quantity);
          break;
        case 'adjustment':
          newQuantity = parseInt(quantity);
          break;
      }

      item.stockQuantity = newQuantity;
      await item.save();

      const movement = new StockMovement({
        carpet: id,
        movementType,
        quantity,
        previousQuantity,
        newQuantity,
        notes,
        location: item.location,
        createdBy: req.user.id,
      });
      await movement.save();

      res.json({
        success: true,
        data: item,
        message: 'Stock updated successfully',
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

export default router;
