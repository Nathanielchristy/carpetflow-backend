import express from 'express';
import { body, validationResult } from 'express-validator';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import StockMovement from '../models/StockMovement.js';

const router = express.Router();

// Get all invoices
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

    const invoices = await Invoice.find(query)
      .populate('customer', 'name')
      .populate('items.carpet', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: invoices,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const invoice = await Invoice.findById(id)
      .populate('customer')
      .populate('items.carpet');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    if (userLocation !== 'all' && invoice.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new invoice
router.post(
  '/',
  [
    body('customer').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.carpet').notEmpty(),
    body('items.*.quantity').isNumeric(),
    body('items.*.unitPrice').isNumeric(),
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

      const { customer, items, status, ...rest } = req.body;

      const customerDoc = await Customer.findById(customer);
      if (!customerDoc) {
        return res.status(400).json({
          success: false,
          error: 'Customer not found',
        });
      }

      let subtotal = 0;
      for (const item of items) {
        const carpet = await Inventory.findById(item.carpet);
        if (!carpet) {
          return res.status(400).json({
            success: false,
            error: `Carpet with id ${item.carpet} not found`,
          });
        }
        item.total = item.quantity * item.unitPrice;
        subtotal += item.total;
      }

      const total = subtotal; // Simplified for now

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(await Invoice.countDocuments() + 1).padStart(3, '0')}`;

      const invoice = new Invoice({
        ...rest,
        customer,
        items,
        subtotal,
        total,
        invoiceNumber,
        location: customerDoc.location,
        createdBy: req.user.id,
      });

      await invoice.save();

      if (status !== 'draft') {
        for (const item of items) {
            const carpet = await Inventory.findById(item.carpet);
            const previousQuantity = carpet.stockQuantity;
            const newQuantity = previousQuantity - item.quantity;
            await Inventory.findByIdAndUpdate(item.carpet, { stockQuantity: newQuantity });

            const movement = new StockMovement({
                carpet: item.carpet,
                movementType: 'out',
                quantity: item.quantity,
                previousQuantity,
                newQuantity,
                referenceType: 'invoice',
                referenceId: invoice._id,
                notes: `Sale - Invoice ${invoice.invoiceNumber}`,
                location: customerDoc.location,
                createdBy: req.user.id,
            });
            await movement.save();
        }
      }

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    if (userLocation !== 'all' && invoice.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    if (userLocation !== 'all' && invoice.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    await Invoice.findByIdAndDelete(id);

    res.json({
      success: true,
      data: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
