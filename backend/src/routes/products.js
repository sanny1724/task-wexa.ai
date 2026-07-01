// src/routes/products.js
import express from 'express';
import prisma from '../prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all product routes
router.use(authMiddleware);

// 1. GET /api/products - List all products for the authenticated organization
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { organizationId: req.user.organizationId },
      orderBy: { updatedAt: 'desc' },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ error: 'Internal server error fetching products' });
  }
});

// 2. GET /api/products/search - Search products by name or SKU (scoped to tenant)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q ? String(req.query.q).trim() : '';
    
    const products = await prisma.product.findMany({
      where: {
        organizationId: req.user.organizationId,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({ error: 'Internal server error searching products' });
  }
});

// Helper for validating product body inputs
function validateProductInputs(body) {
  const { name, sku, quantity, costPrice, sellingPrice, lowStockThreshold } = body;
  
  if (!name || !name.trim()) return 'Product name is required';
  if (!sku || !sku.trim()) return 'SKU is required';

  const q = Number(quantity);
  if (isNaN(q) || q < 0) return 'Quantity must be a non-negative integer';

  const cp = Number(costPrice);
  if (isNaN(cp) || cp < 0) return 'Cost Price must be a non-negative number';

  const sp = Number(sellingPrice);
  if (isNaN(sp) || sp < 0) return 'Selling Price must be a non-negative number';

  if (lowStockThreshold !== undefined && lowStockThreshold !== null && lowStockThreshold !== '') {
    const threshold = Number(lowStockThreshold);
    if (isNaN(threshold) || threshold < 0) return 'Low stock threshold must be a non-negative integer';
  }

  return null;
}

// 3. POST /api/products - Create a new product (scoped to tenant)
router.post('/', async (req, res) => {
  try {
    const validationError = validateProductInputs(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { name, sku, description, quantity, costPrice, sellingPrice, lowStockThreshold } = req.body;
    const organizationId = req.user.organizationId;

    // Check SKU uniqueness in this organization
    const existingProduct = await prisma.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId,
          sku: sku.trim(),
        },
      },
    });

    if (existingProduct) {
      return res.status(400).json({ error: `Product with SKU "${sku}" already exists in your organization.` });
    }

    const product = await prisma.product.create({
      data: {
        organizationId,
        name: name.trim(),
        sku: sku.trim(),
        description: description ? description.trim() : null,
        quantity: Math.floor(Number(quantity)),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        lowStockThreshold: (lowStockThreshold !== undefined && lowStockThreshold !== null && lowStockThreshold !== '') 
          ? Math.floor(Number(lowStockThreshold)) 
          : null,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Internal server error creating product' });
  }
});

// 4. PUT /api/products/:id - Update an existing product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verify product exists and belongs to the organization
    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    const validationError = validateProductInputs(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { name, sku, description, quantity, costPrice, sellingPrice, lowStockThreshold } = req.body;

    // Check if SKU is being changed and if new SKU is already taken in this organization
    if (sku.trim() !== product.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: {
          organizationId_sku: {
            organizationId,
            sku: sku.trim(),
          },
        },
      });

      if (existingProduct) {
        return res.status(400).json({ error: `Product with SKU "${sku}" already exists in your organization.` });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        sku: sku.trim(),
        description: description ? description.trim() : null,
        quantity: Math.floor(Number(quantity)),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        lowStockThreshold: (lowStockThreshold !== undefined && lowStockThreshold !== null && lowStockThreshold !== '') 
          ? Math.floor(Number(lowStockThreshold)) 
          : null,
      },
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ error: 'Internal server error updating product' });
  }
});

// 5. DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verify product exists and belongs to this organization
    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'Internal server error deleting product' });
  }
});

export default router;
