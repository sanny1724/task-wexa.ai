// src/routes/dashboard.js
import express from 'express';
import prisma from '../prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/dashboard - Aggregate dashboard statistics
router.get('/', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Fetch the organization to get the default threshold
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const defaultThreshold = org.defaultThreshold;

    // Fetch all products for the organization to perform calculations
    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
    });

    const totalProducts = products.length;
    const totalInventoryUnits = products.reduce((sum, p) => sum + p.quantity, 0);

    // Filter low stock items
    const lowStockItems = products.filter(p => {
      const threshold = p.lowStockThreshold !== null ? p.lowStockThreshold : defaultThreshold;
      return p.quantity <= threshold;
    });

    const lowStockCount = lowStockItems.length;

    // Return aggregated dashboard data
    return res.status(200).json({
      totalProducts,
      totalInventoryUnits,
      lowStockCount,
      defaultThreshold,
      // Send the top 5 low stock products needing attention (sorted by quantity ascending)
      lowStockAlerts: lowStockItems
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity,
          threshold: p.lowStockThreshold !== null ? p.lowStockThreshold : defaultThreshold,
        })),
    });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    return res.status(500).json({ error: 'Internal server error calculating dashboard metrics' });
  }
});

export default router;
