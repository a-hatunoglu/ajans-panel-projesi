import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin123!', 12);
  
  // Reset ALL user passwords
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, isActive: true }
    });
    console.log(`✅ ${user.email} (${user.role}) → Admin123!`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
