import express from 'express';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get sales report
router.get('/sales', async (req, res) => {
  try {
    const userLocation = req.user.location;
    const locationQuery = userLocation === 'all' ? {} : { location: userLocation };

    const invoices = await Invoice.find(locationQuery);
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = invoices.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const salesByLocation = await Invoice.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: '$location',
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
    ]);

    const salesByProduct = await Invoice.aggregate([
        { $match: locationQuery },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.carpet',
                quantity_sold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.total' }
            }
        },
        {
            $lookup: {
                from: 'inventories',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $project: {
                product_id: '$_id',
                product_name: '$product.name',
                quantity_sold: '$quantity_sold',
                revenue: '$revenue'
            }
        }
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        salesByLocation,
        salesByProduct,
      },
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get inventory report
router.get('/inventory', async (req, res) => {
    try {
        const userLocation = req.user.location;
        const locationQuery = userLocation === 'all' ? {} : { location: userLocation };

        const inventory = await Inventory.find(locationQuery);
        const totalValue = inventory.reduce((sum, item) => sum + (item.stockQuantity * item.costPrice), 0);
        const lowStockItems = inventory.filter(item => item.stockQuantity <= item.minimumStock).length;
        const outOfStockItems = inventory.filter(item => item.stockQuantity === 0).length;

        res.json({
            success: true,
            data: {
                totalItems: inventory.length,
                totalValue,
                lowStockItems,
                outOfStockItems,
            }
        });

    } catch (error) {
        console.error('Get inventory report error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
