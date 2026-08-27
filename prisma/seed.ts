import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.user.upsert({
    where: {
      email: 'martech@example.com',
    },
    update: {},
    create: {
      username: 'martech',
      email: 'martech@example.com',
      phoneNumber: '+1234567790',
      firstName: 'martech',
      lastName: 'martech',
    },
  });

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
