import { PrismaClient, UserRole, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!ChangeMe', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bingoshop.com' },
    update: {},
    create: {
      email: 'admin@bingoshop.com',
      username: 'admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'BingoShop',
      credits: 10000,
      xp: 0,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo users
  const demoUsers = [];
  for (let i = 1; i <= 5; i++) {
    const demoPassword = await bcrypt.hash('Demo123!', 10);
    const user = await prisma.user.upsert({
      where: { email: `demo${i}@bingoshop.com` },
      update: {},
      create: {
        email: `demo${i}@bingoshop.com`,
        username: `demo_player_${i}`,
        password: demoPassword,
        firstName: `Demo`,
        lastName: `Player ${i}`,
        credits: 100,
        xp: Math.floor(Math.random() * 500),
        emailVerifiedAt: new Date(),
      },
    });
    demoUsers.push(user);
  }

  console.log(`✅ ${demoUsers.length} demo users created`);

  // Create sample products
  const products = [
    {
      name: 'Casque Bluetooth Premium',
      description: 'Casque audio sans fil avec réduction de bruit active. Autonomie 30h.',
      priceInCredits: 8000,
      priceInEur: 80,
      stock: 50,
      category: 'Audio',
      tags: ['bluetooth', 'casque', 'audio'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Casque',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Carte Cadeau Amazon 50€',
      description: 'Carte cadeau Amazon valable sur tous les produits. Code envoyé par email.',
      priceInCredits: 5000,
      priceInEur: 0,
      unlimited: true,
      category: 'Cartes Cadeaux',
      tags: ['amazon', 'carte-cadeau'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Amazon',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Montre Connectée Sport',
      description: 'Montre connectée avec suivi fitness, GPS et notifications smartphone.',
      priceInCredits: 15000,
      priceInEur: 150,
      stock: 30,
      category: 'Électronique',
      tags: ['montre', 'sport', 'fitness'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Montre',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Enceinte Portable JBL',
      description: 'Enceinte Bluetooth waterproof avec son 360°. Autonomie 20h.',
      priceInCredits: 6000,
      priceInEur: 60,
      stock: 40,
      category: 'Audio',
      tags: ['enceinte', 'bluetooth', 'portable'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Enceinte',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Console de Jeux Portable',
      description: 'Console portable avec écran HD et plus de 1000 jeux intégrés.',
      priceInCredits: 12000,
      priceInEur: 120,
      stock: 20,
      category: 'Gaming',
      tags: ['console', 'jeux', 'portable'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Console',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Pack Accessoires Gaming',
      description: 'Souris, clavier et tapis gaming RGB avec éclairage personnalisable.',
      priceInCredits: 9000,
      priceInEur: 90,
      stock: 35,
      category: 'Gaming',
      tags: ['gaming', 'clavier', 'souris'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Gaming',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Carte Cadeau Netflix 3 mois',
      description: 'Abonnement Netflix Premium pour 3 mois. Code envoyé par email.',
      priceInCredits: 4000,
      unlimited: true,
      category: 'Cartes Cadeaux',
      tags: ['netflix', 'streaming', 'carte-cadeau'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Netflix',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Drone avec Caméra HD',
      description: 'Drone compact avec caméra 1080p et stabilisation. Portée 500m.',
      priceInCredits: 20000,
      priceInEur: 200,
      stock: 15,
      category: 'Électronique',
      tags: ['drone', 'caméra', 'volant'],
      imageUrl: 'https://via.placeholder.com/300x300.png?text=Drone',
      status: ProductStatus.ACTIVE,
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    });
  }

  console.log(`✅ ${products.length} products created`);

  // Create addresses for demo users
  for (const user of demoUsers.slice(0, 2)) {
    await prisma.address.create({
      data: {
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        addressLine1: `${Math.floor(Math.random() * 100)} Rue de la Demo`,
        city: 'Paris',
        postalCode: '75001',
        country: 'FR',
        phoneNumber: '+33612345678',
        isDefault: true,
      },
    });
  }

  console.log('✅ Demo addresses created');

  console.log('✨ Database seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@bingoshop.com / Admin123!ChangeMe');
  console.log('Demo users: demo1@bingoshop.com to demo5@bingoshop.com / Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
