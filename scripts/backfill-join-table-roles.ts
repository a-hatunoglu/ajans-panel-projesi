import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting CompanyUserRole backfill...');

  // Find all CompanyUsers that have the legacy 'role' column populated
  const companyUsersWithRole = await prisma.companyUser.findMany({
    where: {
      role: { not: null },
    },
  });

  let createdCount = 0;
  let skippedCount = 0;

  for (const cu of companyUsersWithRole) {
    if (!cu.role) continue; // Should be impossible given the where clause, but satisfies TS

    // Check if the record already exists
    const existing = await prisma.companyUserRole.findUnique({
      where: {
        companyUserId_role: {
          companyUserId: cu.id,
          role: cu.role,
        },
      },
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    // Create the join table record
    await prisma.companyUserRole.create({
      data: {
        companyUserId: cu.id,
        role: cu.role,
      },
    });
    createdCount++;
  }

  console.log(`Backfill complete. Created ${createdCount} new roles, skipped ${skippedCount} existing.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
