/**
 * clean-for-testing.ts
 * 
 * Tüm oluşturulmuş içerikleri, şirketleri ve kullanıcıları siler.
 * Sadece owner kullanıcısını bırakır (email güncellenir: owner@agencyos.test).
 * Onboarding bayrağı sıfırlanır — kullanıcı sistemi sıfırdan deneyimleyebilir.
 * 
 * Kullanım:
 *   npx tsx scripts/clean-for-testing.ts
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OWNER_EMAIL = 'owner@agencyos.test';
const OWNER_PASSWORD = 'Admin123!';

async function main() {
  console.log('\n🧹 AgencyOS — Test Ortamı Temizleniyor...\n');

  // 1. Owner kullanıcısını bul (enes@test.com veya mevcut owner)
  const owner = await prisma.user.findFirst({
    where: { role: 'owner' },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!owner) {
    console.error('❌ Owner kullanıcısı bulunamadı! Script durduruluyor.');
    process.exit(1);
  }

  console.log(`👤 Owner tespit edildi: ${owner.email} (${owner.firstName} ${owner.lastName})`);
  console.log(`   → Email güncellenecek: ${OWNER_EMAIL}`);

  // 2. İçerik bağımlılıklarını sil (FK sırasına göre)
  const mediaCount = await prisma.contentMedia.deleteMany({});
  console.log(`🗑  ContentMedia: ${mediaCount.count} kayıt silindi`);

  const commentCount = await prisma.contentComment.deleteMany({});
  console.log(`🗑  ContentComment: ${commentCount.count} kayıt silindi`);

  const versionCount = await prisma.contentVersion.deleteMany({});
  console.log(`🗑  ContentVersion: ${versionCount.count} kayıt silindi`);

  const contentCount = await prisma.content.deleteMany({});
  console.log(`🗑  Content: ${contentCount.count} kayıt silindi`);

  // 3. Ödemeler
  const paymentCount = await prisma.payment.deleteMany({});
  console.log(`🗑  Payment: ${paymentCount.count} kayıt silindi`);

  // 4. Bildirimler
  const notifCount = await prisma.notification.deleteMany({});
  console.log(`🗑  Notification: ${notifCount.count} kayıt silindi`);

  // 5. Activity logs
  const activityCount = await prisma.activityLog.deleteMany({});
  console.log(`🗑  ActivityLog: ${activityCount.count} kayıt silindi`);

  // 6. Sosyal hesaplar
  const socialCount = await prisma.socialAccount.deleteMany({});
  console.log(`🗑  SocialAccount: ${socialCount.count} kayıt silindi`);

  // 7. Şirket-kullanıcı rolleri ve üyelikleri
  const roleCount = await prisma.companyUserRole.deleteMany({});
  console.log(`🗑  CompanyUserRole: ${roleCount.count} kayıt silindi`);

  const cuCount = await prisma.companyUser.deleteMany({});
  console.log(`🗑  CompanyUser: ${cuCount.count} kayıt silindi`);

  // 8. Şirketler
  const companyCount = await prisma.company.deleteMany({});
  console.log(`🗑  Company: ${companyCount.count} kayıt silindi`);

  // 9. Refresh token'ları temizle
  const tokenCount = await prisma.refreshToken.deleteMany({});
  console.log(`🗑  RefreshToken: ${tokenCount.count} kayıt silindi`);

  // 10. Owner dışındaki tüm kullanıcıları sil
  const otherUsers = await prisma.user.deleteMany({
    where: { id: { not: owner.id } },
  });
  console.log(`🗑  User (owner hariç): ${otherUsers.count} kayıt silindi`);

  // 11. Owner'ı güncelle — email, şifre, onboarding sıfırla
  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
  await prisma.user.update({
    where: { id: owner.id },
    data: {
      email: OWNER_EMAIL,
      passwordHash,
      isActive: true,
      hasCompletedOnboarding: false,
      forcePasswordChange: false,
      deletedAt: null,
      inviteToken: null,
      inviteExpiresAt: null,
      resetToken: null,
      resetExpiresAt: null,
    },
  });

  console.log(`\n✅ Owner hesabı güncellendi:`);
  console.log(`   Email: ${OWNER_EMAIL}`);
  console.log(`   Şifre: ${OWNER_PASSWORD}`);
  console.log(`   Onboarding: sıfırlandı (ilk giriş deneyimi)\n`);

  // Doğrulama
  const remaining = await prisma.user.count();
  const companyRemaining = await prisma.company.count();
  const contentRemaining = await prisma.content.count();

  console.log('📊 Kalan kayıtlar:');
  console.log(`   Users: ${remaining}`);
  console.log(`   Companies: ${companyRemaining}`);
  console.log(`   Contents: ${contentRemaining}`);
  console.log('\n🎉 Temizlik tamamlandı. Sistemi sıfırdan test edebilirsin!\n');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Hata:', e);
  process.exit(1);
});
