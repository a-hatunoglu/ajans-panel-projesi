import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migration started: Translating global roles to company-scoped roles.");

  // Fetch all users with operational global roles
  const usersToMigrate = await prisma.user.findMany({
    where: {
      role: { in: ["editor", "designer", "client"] },
    },
    include: {
      companies: true,
    },
  });

  console.log(`Found ${usersToMigrate.length} users with legacy operational global roles.`);

  for (const user of usersToMigrate) {
    console.log(`Migrating user ${user.id} (${user.email}) - Legacy Global Role: ${user.role}`);

    for (const membership of user.companies) {
      // Check if they already have this role in this company
      const existingRole = await prisma.companyUserRole.findUnique({
        where: {
          companyUserId_role: {
            companyUserId: membership.id,
            role: user.role,
          },
        },
      });

      if (!existingRole) {
        await prisma.companyUserRole.create({
          data: {
            companyUserId: membership.id,
            role: user.role,
          },
        });
        console.log(` > Assigned '${user.role}' in company membership ${membership.id}`);
      } else {
        console.log(` > User already had '${user.role}' in company membership ${membership.id}`);
      }
    }

    // Downgrade global role to "user"
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "user" },
    });
    console.log(` > Downgraded global role to 'user'.`);
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
