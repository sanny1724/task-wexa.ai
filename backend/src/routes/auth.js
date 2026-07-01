// src/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

const router = express.Router();

// Signup Route: Register organization + user
router.post('/signup', async (req, res) => {
  try {
    const { email, password, organizationName } = req.body;

    // Validation
    if (!email || !password || !organizationName) {
      return res.status(400).json({ error: 'Email, password, and organization name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization and user atomically
    const org = await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          create: {
            email,
            password: hashedPassword,
          },
        },
      },
      include: {
        users: true,
      },
    });

    const user = org.users[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        organizationId: org.id,
      },
      process.env.JWT_SECRET || 'super-secret-jwt-key-12345',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: org.id,
        organizationName: org.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// Login Route: Authenticate credentials and return JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET || 'super-secret-jwt-key-12345',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

export default router;
