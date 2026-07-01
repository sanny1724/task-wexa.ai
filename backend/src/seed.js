// src/seed.js
import bcrypt from 'bcrypt';
import prisma from './prisma.js';

export async function seedDemoData() {
  console.log('Seeding demo database...');

  try {
    const demoEmail = 'demo@example.com';
    const demoOrgName = 'Demo Foods';

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (existingUser) {
      console.log('Demo user already seeded. Skipping.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create organization and user
    const org = await prisma.organization.create({
      data: {
        name: demoOrgName,
        defaultThreshold: 10,
        users: {
          create: {
            email: demoEmail,
            password: hashedPassword,
          },
        },
      },
      include: {
        users: true,
      },
    });

    const user = org.users[0];

    // Seed mock products for this organization
    const productsData = [
      {
        name: 'Organic Honey Crispy Apple',
        sku: 'APP-ORG-001',
        description: 'Premium organic honey crispy apples sourced locally.',
        quantity: 5,
        costPrice: 0.80,
        sellingPrice: 1.99,
        lowStockThreshold: 15, // Low stock alert (threshold 15 > qty 5)
      },
      {
        name: 'Chiquita Banana Bundle',
        sku: 'BAN-FRSH-002',
        description: 'Fresh yellow bananas, bundle of 6.',
        quantity: 25,
        costPrice: 0.35,
        sellingPrice: 0.99,
        lowStockThreshold: 10, // Healthy stock (threshold 10 < qty 25)
      },
      {
        name: 'Whole Milk 1 Gallon',
        sku: 'MILK-WHL-003',
        description: 'Pasteurized whole vitamin D milk.',
        quantity: 0,
        costPrice: 1.50,
        sellingPrice: 3.49,
        lowStockThreshold: null, // Out of stock (qty 0 <= default threshold 10)
      },
      {
        name: 'Plain Greek Yogurt 500g',
        sku: 'YOG-GRK-004',
        description: 'High protein fat-free plain Greek yogurt.',
        quantity: 8,
        costPrice: 1.20,
        sellingPrice: 2.99,
        lowStockThreshold: null, // Low stock (qty 8 <= default threshold 10)
      },
      {
        name: 'Sourdough Bread Loaf',
        sku: 'BRD-SOUR-005',
        description: 'Artisanal freshly baked sourdough bread.',
        quantity: 12,
        costPrice: 1.10,
        sellingPrice: 2.79,
        lowStockThreshold: 8, // Healthy stock (threshold 8 < qty 12)
      },
    ];

    await prisma.product.createMany({
      data: productsData.map(p => ({
        ...p,
        organizationId: org.id,
      })),
    });

    console.log('--------------------------------------------------');
    console.log('✅ Demo database seeded successfully!');
    console.log(`   Demo User: ${demoEmail}`);
    console.log('   Password: password123');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

// Self execution if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
}
