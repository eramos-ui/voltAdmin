import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('poiuyt', 10);

  const newUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
      theme: 'light', // Puedes ajustar esto según sea necesario
    },
  });

  console.log('User created:', newUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
