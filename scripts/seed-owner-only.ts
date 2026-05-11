import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Veritabanı temizleniyor...");

  // Bağımlılık sırasına göre tüm tabloları temizle
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.content.deleteMany(),
    prisma.companyUserRole.deleteMany(),
    prisma.socialAccount.deleteMany(),
    prisma.company.deleteMany(),
    prisma.agencyUser.deleteMany(),
    prisma.agency.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Tüm veriler silindi.");

  console.log("Owner hesabı oluşturuluyor...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const owner = await prisma.user.create({
    data: {
      email: "enes@test.com",
      firstName: "Enes",
      lastName: "Owner",
      passwordHash: hashedPassword,
      role: "owner",
    },
  });

  console.log("=========================================");
  console.log("TEMİZ KURULUM TAMAMLANDI");
  console.log("Giriş Bilgileri:");
  console.log(`Email: ${owner.email}`);
  console.log("Şifre: 123456");
  console.log("Sistemde başka hiçbir ajans, şirket veya kullanıcı yoktur.");
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
