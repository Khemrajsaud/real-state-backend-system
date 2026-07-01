import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const categories = [
    { name: 'House', iconUrl: null },
    { name: 'Land', iconUrl: null },
    { name: 'Flats', iconUrl: null },
    { name: 'Office Space', iconUrl: null },
    { name: 'Shop Space', iconUrl: null },
    { name: 'Apartment', iconUrl: null },
  ];

  const statuses = [
    { name: 'Available' },
    { name: 'Under Construction' },
    { name: 'Sold' },
  ];

  const amenityNames = [
    'Swimming Pool',
    'Gym',
    'Garage',
    'Elevator',
    'Security Guard',
    'Garden',
    'Balcony',
    'Parking',
    'Generator',
    'Internet',
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { iconUrl: category.iconUrl },
      create: category,
    });
  }

  for (const status of statuses) {
    await prisma.property_status.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    });
  }

  for (const name of amenityNames) {
    await prisma.amenities.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const [categoryCount, statusCount, amenityCount] = await Promise.all([
    prisma.category.count(),
    prisma.property_status.count(),
    prisma.amenities.count(),
  ]);

  console.log('Seed completed successfully.');
  console.log(`Categories: ${categoryCount}`);
  console.log(`Statuses: ${statusCount}`);
  console.log(`Amenities: ${amenityCount}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
