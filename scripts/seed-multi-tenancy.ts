/**
 * seed-multi-tenancy.ts
 * 
 * Multi-tenancy geçişi sonrası veritabanını hazırlar:
 * 1. Mevcut owner kullanıcısını platform_owner olarak günceller
 * 2. Varsayılan ajans oluşturur ("AgencyOS Demo" — test için)
 * 3. Owner'ı bu ajansa agency_admin olarak atar
 * 
 * Kullanım:
 *   npx tsx scripts/seed-multi-tenancy.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🏗️  Multi-Tenancy Seed Başlıyor...\n');

  // 1. Mevcut owner'ı bul
  const owner = await prisma.user.findFirst({
    where: { role: { in: ['owner', 'platform_owner'] } },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  if (!owner) {
    console.error('❌ Owner kullanıcısı bulunamadı! Önce clean-for-testing.ts çalıştırın.');
    process.exit(1);
  }

  console.log(`👤 Owner bulundu: ${owner.email} (role: ${owner.role})`);

  // 2. Owner'ın rolünü platform_owner olarak güncelle
  if (owner.role !== 'platform_owner') {
    await prisma.user.update({
      where: { id: owner.id },
      data: { role: 'platform_owner' },
    });
    console.log(`✅ Rol güncellendi: ${owner.role} → platform_owner`);
  } else {
    console.log(`ℹ️  Rol zaten platform_owner`);
  }

  // 3. Mevcut diğer kullanıcıları (admin/member) 'user' rolüne güncelle
  const otherUsers = await prisma.user.updateMany({
    where: {
      id: { not: owner.id },
      role: { in: ['admin', 'member'] },
    },
    data: { role: 'user' },
  });

  if (otherUsers.count > 0) {
    console.log(`✅ ${otherUsers.count} kullanıcı 'user' rolüne güncellendi`);
  }

  // 4. Varsayılan ajans oluştur (yoksa)
  const existingAgency = await prisma.agency.findFirst({
    select: { id: true, name: true, slug: true },
  });

  let agencyId: string;

  if (existingAgency) {
    agencyId = existingAgency.id;
    console.log(`ℹ️  Mevcut ajans bulundu: ${existingAgency.name} (${existingAgency.slug})`);
  } else {
    const newAgency = await prisma.agency.create({
      data: {
        name: 'Demo Ajans',
        slug: 'demo-ajans',
        email: 'info@demo-ajans.com',
        website: 'https://demo-ajans.com',
        isActive: true,
      },
      select: { id: true, name: true, slug: true },
    });
    agencyId = newAgency.id;
    console.log(`✅ Yeni ajans oluşturuldu: ${newAgency.name} (${newAgency.slug})`);
  }

  // 5. Owner'ı ajansa agency_admin olarak ata (yoksa)
  const existingMembership = await prisma.agencyUser.findUnique({
    where: {
      agencyId_userId: {
        agencyId,
        userId: owner.id,
      },
    },
  });

  if (!existingMembership) {
    await prisma.agencyUser.create({
      data: {
        agencyId,
        userId: owner.id,
        role: 'agency_admin',
      },
    });
    console.log(`✅ Owner ajansa agency_admin olarak atandı`);
  } else {
    console.log(`ℹ️  Owner zaten ajansa atanmış (role: ${existingMembership.role})`);
  }

  // 6. Mevcut şirketleri (varsa) bu ajansa bağla
  const unlinkedCompanies = await prisma.$executeRaw`
    UPDATE companies SET agency_id = ${agencyId}::uuid 
    WHERE agency_id IS NULL OR agency_id NOT IN (SELECT id FROM agencies)
  `;
  
  if (unlinkedCompanies > 0) {
    console.log(`✅ ${unlinkedCompanies} şirket ajansa bağlandı`);
  }

  // Doğrulama
  const stats = {
    agencies: await prisma.agency.count(),
    agencyUsers: await prisma.agencyUser.count(),
    platformOwners: await prisma.user.count({ where: { role: 'platform_owner' } }),
    regularUsers: await prisma.user.count({ where: { role: 'user' } }),
    companies: await prisma.company.count(),
  };

  console.log('\n📊 Doğrulama:');
  console.log(`   Ajanslar: ${stats.agencies}`);
  console.log(`   Ajans Kullanıcıları: ${stats.agencyUsers}`);
  console.log(`   Platform Owner: ${stats.platformOwners}`);
  console.log(`   Normal Kullanıcılar: ${stats.regularUsers}`);
  console.log(`   Şirketler: ${stats.companies}`);
  console.log('\n🎉 Multi-tenancy seed tamamlandı!\n');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Hata:', e);
  process.exit(1);
});
