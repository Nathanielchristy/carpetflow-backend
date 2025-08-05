import express from 'express';
import StockMovement from '../models/StockMovement.js';

const router = express.Router();

// Get all stock movements
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'asc' } = req.query;
    const userLocation = req.user.location;

    let query = {};
    if (userLocation !== 'all') {
      query.location = userLocation;
    }

    if (search) {
      // This will require a text index on the StockMovement model
      // and potentially populating and searching related fields.
      // For now, we will search on notes.
      query.notes = { $regex: search, $options: 'i' };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const movements = await StockMovement.find(query)
      .populate('carpet', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await StockMovement.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: movements,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get stock movement by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLocation = req.user.location;

    const movement = await StockMovement.findById(id).populate('carpet');

    if (!movement) {
      return res.status(404).json({
        success: false,
        error: 'Stock movement not found',
      });
    }

    if (userLocation !== 'all' && movement.location !== userLocation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: movement,
    });
  } catch (error) {
    console.error('Get stock movement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
