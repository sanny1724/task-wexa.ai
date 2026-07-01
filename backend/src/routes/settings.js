// src/routes/settings.js
import express from 'express';
import prisma from '../prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/settings - Get settings for organization
router.get('/', async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.status(200).json({
      name: org.name,
      defaultThreshold: org.defaultThreshold,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: 'Internal server error retrieving settings' });
  }
});

// PUT /api/settings - Update organization settings
router.put('/', async (req, res) => {
  try {
    const { name, defaultThreshold } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const threshold = Number(defaultThreshold);
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({ error: 'Default threshold must be a non-negative integer' });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        name: name.trim(),
        defaultThreshold: Math.floor(threshold),
      },
    });

    return res.status(200).json({
      name: updatedOrg.name,
      defaultThreshold: updatedOrg.defaultThreshold,
      message: 'Settings successfully updated',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'Internal server error updating settings' });
  }
});

export default router;
