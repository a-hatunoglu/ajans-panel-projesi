import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { ContentStatus, UserRole } from '../src/shared/types/enums';

const prisma = new PrismaClient();

const PASSWORD = 'LocalDev123!';
const PASSWORD_SALT_ROUNDS = 12;

const FIXTURE = {
  company: {
    id: '0349f0bd-aa25-4cc0-8ea1-4dac3c9c340b',
    name: 'Atlas Local Dev',
    slug: 'atlas-local-dev',
    email: 'atlas.local@test.com',
    website: 'https://atlas-local.dev',
    phone: '+90 212 555 0101',
    notes: 'Dev-only workflow QA company fixture.',
  },
  company2: {
    id: 'a6e1c4d9-2f88-4b29-9e3c-75dfe0a11b42',
    name: 'Momentum Digital',
    slug: 'momentum-digital',
    email: 'info@momentum.digital',
    website: 'https://momentum.digital',
    phone: '+90 216 444 0202',
    notes: 'Dev-only second company for demo density.',
  },
  socialAccount: {
    id: '15a2ebe9-c6e4-465c-bf54-2709da1caa69',
    platform: 'instagram',
    accountName: '@atlaslocaldev',
    profileUrl: 'https://instagram.com/atlaslocaldev',
    notes: 'Dev-only social account fixture for workflow QA content.',
  },
  socialAccount2: {
    id: 'b7c3d8e1-4f92-4a1d-8e5f-93c6a7b2d034',
    platform: 'linkedin',
    accountName: '@momentumdigital',
    profileUrl: 'https://linkedin.com/company/momentumdigital',
    notes: 'Dev-only LinkedIn account for second company.',
  },
  users: [
    {
      id: 'cf187016-976f-4dbe-bc10-8c35e4dd3d75',
      email: 'enes@test.com',
      firstName: 'Enes',
      lastName: 'Koç',
      role: UserRole.OWNER,
    },
    {
      id: '12a0ad6e-3d92-4e88-a239-167a3bfcfdb9',
      email: 'ayla.admin@test.com',
      firstName: 'Ayla',
      lastName: 'Yılmaz',
      role: UserRole.ADMIN,
    },
    {
      id: 'e62e0a6a-aa61-4fb9-9df7-d6fcb9639e90',
      email: 'ece.editor@test.com',
      firstName: 'Ece',
      lastName: 'Aydın',
      role: UserRole.EDITOR,
    },
    {
      id: 'd8d3a00f-02d2-4587-b494-25ac7b3b65d9',
      email: 'deniz.designer@test.com',
      firstName: 'Deniz',
      lastName: 'Şahin',
      role: UserRole.DESIGNER,
    },
    {
      id: 'd8347798-0116-4dce-88e3-935e6023bfd9',
      email: 'cem.client@test.com',
      firstName: 'Cem',
      lastName: 'Yıldız',
      role: UserRole.CLIENT,
    },
  ],
  contents: [
    {
      id: '8501b9f4-ab59-4789-ae24-aea4b3d50184',
      title: '[QA] Workflow Draft',
      status: ContentStatus.DRAFT,
      body: 'Draft workflow fixture content for detail-screen QA.',
      createdAt: new Date('2026-03-28T09:00:00.000Z'),
      versionId: '91b77519-7d46-42d7-8b7a-f59cbec40001',
      approvedAt: null,
      scheduledAt: null,
      publishedAt: null,
    },
    {
      id: '8851a9fa-f457-44f0-a24c-42dac3a0a76e',
      title: '[QA] Workflow In Review',
      status: ContentStatus.IN_REVIEW,
      body: 'In-review workflow fixture content for approval and comment QA.',
      createdAt: new Date('2026-03-29T09:00:00.000Z'),
      versionId: '91b77519-7d46-42d7-8b7a-f59cbec40002',
      approvedAt: null,
      scheduledAt: null,
      publishedAt: null,
    },
    {
      id: '52801ac6-1ebe-44e1-86d2-5a84dd633abd',
      title: '[QA] Workflow Revise',
      status: ContentStatus.REVISE,
      body: 'Revise workflow fixture content for resubmission QA.',
      createdAt: new Date('2026-03-30T09:00:00.000Z'),
      versionId: '91b77519-7d46-42d7-8b7a-f59cbec40003',
      approvedAt: null,
      scheduledAt: null,
      publishedAt: null,
    },
    {
      id: '70afac3f-54ff-4796-a8b5-d5fd5ce6d9a1',
      title: '[QA] Workflow Approved',
      status: ContentStatus.APPROVED,
      body: 'Approved workflow fixture content for scheduling QA.',
      createdAt: new Date('2026-03-31T09:00:00.000Z'),
      versionId: '91b77519-7d46-42d7-8b7a-f59cbec40004',
      approvedAt: new Date('2026-03-31T12:00:00.000Z'),
      scheduledAt: null,
      publishedAt: null,
    },
    {
      id: '44a6e6eb-67c4-49cf-bbf0-f2a81f9e7d4f',
      title: '[QA] Workflow Scheduled',
      status: ContentStatus.SCHEDULED,
      body: 'Scheduled workflow fixture content for publish QA.',
      createdAt: new Date('2026-04-01T09:00:00.000Z'),
      versionId: '91b77519-7d46-42d7-8b7a-f59cbec40005',
      approvedAt: new Date('2026-04-01T10:00:00.000Z'),
      scheduledAt: new Date('2026-04-08T12:30:00.000Z'),
      publishedAt: null,
    },
    {
      id: 'c3f8d1a2-5e47-4b9c-a6d3-8f2e1c9b7a05',
      title: '[QA] Workflow Published',
      status: ContentStatus.PUBLISHED,
      body: 'Published workflow fixture content — full lifecycle complete.',
      createdAt: new Date('2026-03-25T09:00:00.000Z'),
      versionId: '91b77519-7d46-42d7-8b7a-f59cbec40006',
      approvedAt: new Date('2026-03-26T14:00:00.000Z'),
      scheduledAt: new Date('2026-03-27T10:00:00.000Z'),
      publishedAt: new Date('2026-03-27T10:00:00.000Z'),
    },
  ],
  contents2: [
    {
      id: 'e1a2b3c4-d5e6-4f78-9a0b-c1d2e3f40001',
      title: 'Momentum — Q2 Campaign Draft',
      status: ContentStatus.DRAFT,
      body: 'Q2 social media campaign draft for Momentum Digital.',
      createdAt: new Date('2026-04-02T09:00:00.000Z'),
      versionId: 'f1a2b3c4-d5e6-4f78-9a0b-c1d2e3f50001',
      approvedAt: null,
      scheduledAt: null,
      publishedAt: null,
    },
    {
      id: 'e1a2b3c4-d5e6-4f78-9a0b-c1d2e3f40002',
      title: 'Momentum — Brand Awareness Post',
      status: ContentStatus.IN_REVIEW,
      body: 'LinkedIn brand awareness content awaiting client review.',
      createdAt: new Date('2026-04-03T11:00:00.000Z'),
      versionId: 'f1a2b3c4-d5e6-4f78-9a0b-c1d2e3f50002',
      approvedAt: null,
      scheduledAt: null,
      publishedAt: null,
    },
    {
      id: 'e1a2b3c4-d5e6-4f78-9a0b-c1d2e3f40003',
      title: 'Momentum — Product Launch Scheduled',
      status: ContentStatus.SCHEDULED,
      body: 'Product launch announcement scheduled for next week.',
      createdAt: new Date('2026-04-04T14:00:00.000Z'),
      versionId: 'f1a2b3c4-d5e6-4f78-9a0b-c1d2e3f50003',
      approvedAt: new Date('2026-04-05T09:00:00.000Z'),
      scheduledAt: new Date('2026-04-12T10:00:00.000Z'),
      publishedAt: null,
    },
  ],
  payments: [
    {
      id: '6c40f49b-66e0-4446-8847-2b55445aa1d1',
      amount: '12500.00',
      currency: 'TRY',
      status: 'pending',
      periodStart: new Date('2026-04-01T00:00:00.000Z'),
      periodEnd: new Date('2026-04-30T00:00:00.000Z'),
      dueDate: new Date('2026-04-12T00:00:00.000Z'),
      paidAt: null,
      notes: 'Dev-only pending payment fixture for global payments smoke.',
    },
    {
      id: '1f58215f-7923-48b8-a557-b1b2166c72cf',
      amount: '9800.00',
      currency: 'TRY',
      status: 'paid',
      periodStart: new Date('2026-03-01T00:00:00.000Z'),
      periodEnd: new Date('2026-03-31T00:00:00.000Z'),
      dueDate: new Date('2026-04-05T00:00:00.000Z'),
      paidAt: new Date('2026-04-03T10:15:00.000Z'),
      notes: 'Dev-only paid payment fixture for global payments smoke.',
    },
    {
      id: '3a7b8c9d-1e2f-4a5b-6c7d-8e9f0a1b2c3d',
      amount: '15000.00',
      currency: 'TRY',
      status: 'overdue',
      periodStart: new Date('2026-02-01T00:00:00.000Z'),
      periodEnd: new Date('2026-02-28T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
      paidAt: null,
      notes: 'Dev-only overdue payment fixture for badge coverage.',
    },
  ],
  payments2: [
    {
      id: '4b8c9d0e-2f3a-4b5c-7d8e-9f0a1b2c3d4e',
      amount: '8500.00',
      currency: 'TRY',
      status: 'pending',
      periodStart: new Date('2026-04-01T00:00:00.000Z'),
      periodEnd: new Date('2026-04-30T00:00:00.000Z'),
      dueDate: new Date('2026-04-15T00:00:00.000Z'),
      paidAt: null,
      notes: 'Dev-only payment for Momentum Digital.',
    },
  ],
} as const;

async function ensureUser(user: (typeof FIXTURE.users)[number], passwordHash: string) {
  const existing = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true,
        deletedAt: null,
        passwordHash,
        inviteToken: null,
        inviteExpiresAt: null,
        resetToken: null,
        resetExpiresAt: null,
      },
      select: { id: true, email: true, role: true },
    });
  }

  return prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: true,
      passwordHash,
    },
    select: { id: true, email: true, role: true },
  });
}

async function ensureCompany() {
  const existing = await prisma.company.findUnique({
    where: { slug: FIXTURE.company.slug },
    select: { id: true },
  });

  if (existing) {
    return prisma.company.update({
      where: { id: existing.id },
      data: {
        name: FIXTURE.company.name,
        slug: FIXTURE.company.slug,
        email: FIXTURE.company.email,
        website: FIXTURE.company.website,
        phone: FIXTURE.company.phone,
        notes: FIXTURE.company.notes,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, name: true, slug: true },
    });
  }

  return prisma.company.create({
    data: {
      id: FIXTURE.company.id,
      name: FIXTURE.company.name,
      slug: FIXTURE.company.slug,
      email: FIXTURE.company.email,
      website: FIXTURE.company.website,
      phone: FIXTURE.company.phone,
      notes: FIXTURE.company.notes,
      isActive: true,
    },
    select: { id: true, name: true, slug: true },
  });
}

async function ensureSocialAccount(companyId: string) {
  const existingById = await prisma.socialAccount.findUnique({
    where: { id: FIXTURE.socialAccount.id },
    select: { id: true },
  });

  if (existingById) {
    return prisma.socialAccount.update({
      where: { id: existingById.id },
      data: {
        companyId,
        platform: FIXTURE.socialAccount.platform,
        accountName: FIXTURE.socialAccount.accountName,
        profileUrl: FIXTURE.socialAccount.profileUrl,
        notes: FIXTURE.socialAccount.notes,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, accountName: true },
    });
  }

  const existingByName = await prisma.socialAccount.findFirst({
    where: {
      companyId,
      accountName: FIXTURE.socialAccount.accountName,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existingByName) {
    return prisma.socialAccount.update({
      where: { id: existingByName.id },
      data: {
        companyId,
        platform: FIXTURE.socialAccount.platform,
        accountName: FIXTURE.socialAccount.accountName,
        profileUrl: FIXTURE.socialAccount.profileUrl,
        notes: FIXTURE.socialAccount.notes,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, accountName: true },
    });
  }

  return prisma.socialAccount.create({
    data: {
      id: FIXTURE.socialAccount.id,
      companyId,
      platform: FIXTURE.socialAccount.platform,
      accountName: FIXTURE.socialAccount.accountName,
      profileUrl: FIXTURE.socialAccount.profileUrl,
      notes: FIXTURE.socialAccount.notes,
      isActive: true,
    },
    select: { id: true, accountName: true },
  });
}

async function ensureMemberships(companyId: string, userIds: string[]) {
  for (const userId of userIds) {
    await prisma.companyUser.upsert({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
      update: {},
      create: {
        companyId,
        userId,
      },
    });
  }
}

async function archiveDuplicateQaContents(companyId: string) {
  const allContentTitles = [...FIXTURE.contents, ...FIXTURE.contents2].map((content) => content.title);
  const allContentIds = [...FIXTURE.contents, ...FIXTURE.contents2].map((content) => content.id);
  await prisma.content.updateMany({
    where: {
      companyId,
      title: { in: allContentTitles },
      id: { notIn: allContentIds },
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

async function ensureQaContents(params: {
  companyId: string;
  socialAccountId: string;
  ownerId: string;
  designerId: string;
  editorId: string;
}) {
  await prisma.contentComment.deleteMany({
    where: {
      contentId: { in: FIXTURE.contents.map((content) => content.id) },
    },
  });

  await prisma.contentVersion.deleteMany({
    where: {
      contentId: { in: FIXTURE.contents.map((content) => content.id) },
    },
  });

  for (const content of FIXTURE.contents) {
    await prisma.content.upsert({
      where: { id: content.id },
      update: {
        companyId: params.companyId,
        socialAccountId: params.socialAccountId,
        assignedDesignerId: params.designerId,
        assignedEditorId: params.editorId,
        createdById: params.ownerId,
        approvedById: content.approvedAt ? params.ownerId : null,
        approvedAt: content.approvedAt,
        title: content.title,
        body: content.body,
        status: content.status,
        scheduledAt: content.scheduledAt,
        publishedAt: content.publishedAt,
        deletedAt: null,
      },
      create: {
        id: content.id,
        companyId: params.companyId,
        socialAccountId: params.socialAccountId,
        assignedDesignerId: params.designerId,
        assignedEditorId: params.editorId,
        createdById: params.ownerId,
        approvedById: content.approvedAt ? params.ownerId : null,
        title: content.title,
        body: content.body,
        status: content.status,
        approvedAt: content.approvedAt,
        scheduledAt: content.scheduledAt,
        publishedAt: content.publishedAt,
        createdAt: content.createdAt,
      },
    });

    await prisma.contentVersion.create({
      data: {
        id: content.versionId,
        contentId: content.id,
        createdById: params.ownerId,
        title: content.title,
        body: content.body,
        status: content.status,
        version: 1,
        createdAt: content.createdAt,
      },
    });
  }
}

async function ensureCompany2() {
  const existing = await prisma.company.findUnique({
    where: { slug: FIXTURE.company2.slug },
    select: { id: true },
  });

  if (existing) {
    return prisma.company.update({
      where: { id: existing.id },
      data: {
        name: FIXTURE.company2.name,
        slug: FIXTURE.company2.slug,
        email: FIXTURE.company2.email,
        website: FIXTURE.company2.website,
        phone: FIXTURE.company2.phone,
        notes: FIXTURE.company2.notes,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, name: true, slug: true },
    });
  }

  return prisma.company.create({
    data: {
      id: FIXTURE.company2.id,
      name: FIXTURE.company2.name,
      slug: FIXTURE.company2.slug,
      email: FIXTURE.company2.email,
      website: FIXTURE.company2.website,
      phone: FIXTURE.company2.phone,
      notes: FIXTURE.company2.notes,
      isActive: true,
    },
    select: { id: true, name: true, slug: true },
  });
}

async function ensureSocialAccount2(companyId: string) {
  const existing = await prisma.socialAccount.findUnique({
    where: { id: FIXTURE.socialAccount2.id },
    select: { id: true },
  });

  if (existing) {
    return prisma.socialAccount.update({
      where: { id: existing.id },
      data: {
        companyId,
        platform: FIXTURE.socialAccount2.platform,
        accountName: FIXTURE.socialAccount2.accountName,
        profileUrl: FIXTURE.socialAccount2.profileUrl,
        notes: FIXTURE.socialAccount2.notes,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, accountName: true },
    });
  }

  return prisma.socialAccount.create({
    data: {
      id: FIXTURE.socialAccount2.id,
      companyId,
      platform: FIXTURE.socialAccount2.platform,
      accountName: FIXTURE.socialAccount2.accountName,
      profileUrl: FIXTURE.socialAccount2.profileUrl,
      notes: FIXTURE.socialAccount2.notes,
      isActive: true,
    },
    select: { id: true, accountName: true },
  });
}

async function ensureQaContents2(params: {
  companyId: string;
  socialAccountId: string;
  ownerId: string;
  designerId: string;
  editorId: string;
}) {
  await prisma.contentComment.deleteMany({
    where: {
      contentId: { in: FIXTURE.contents2.map((content) => content.id) },
    },
  });

  await prisma.contentVersion.deleteMany({
    where: {
      contentId: { in: FIXTURE.contents2.map((content) => content.id) },
    },
  });

  for (const content of FIXTURE.contents2) {
    await prisma.content.upsert({
      where: { id: content.id },
      update: {
        companyId: params.companyId,
        socialAccountId: params.socialAccountId,
        assignedDesignerId: params.designerId,
        assignedEditorId: params.editorId,
        createdById: params.ownerId,
        approvedById: content.approvedAt ? params.ownerId : null,
        approvedAt: content.approvedAt,
        title: content.title,
        body: content.body,
        status: content.status,
        scheduledAt: content.scheduledAt,
        publishedAt: content.publishedAt,
        deletedAt: null,
      },
      create: {
        id: content.id,
        companyId: params.companyId,
        socialAccountId: params.socialAccountId,
        assignedDesignerId: params.designerId,
        assignedEditorId: params.editorId,
        createdById: params.ownerId,
        approvedById: content.approvedAt ? params.ownerId : null,
        title: content.title,
        body: content.body,
        status: content.status,
        approvedAt: content.approvedAt,
        scheduledAt: content.scheduledAt,
        publishedAt: content.publishedAt,
        createdAt: content.createdAt,
      },
    });

    await prisma.contentVersion.create({
      data: {
        id: content.versionId,
        contentId: content.id,
        createdById: params.ownerId,
        title: content.title,
        body: content.body,
        status: content.status,
        version: 1,
        createdAt: content.createdAt,
      },
    });
  }
}

type PaymentFixture = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt: Date | null;
  notes: string;
};

async function ensureQaPayments(params: {
  companyId: string;
  createdById: string;
  payments: readonly PaymentFixture[];
}) {
  for (const payment of params.payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: {
        companyId: params.companyId,
        createdById: params.createdById,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        dueDate: payment.dueDate,
        paidAt: payment.paidAt,
        notes: payment.notes,
      },
      create: {
        id: payment.id,
        companyId: params.companyId,
        createdById: params.createdById,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        dueDate: payment.dueDate,
        paidAt: payment.paidAt,
        notes: payment.notes,
      },
    });
  }
}

async function ensureNotifications(params: {
  ownerId: string;
  adminId: string;
  editorId: string;
  designerId: string;
  companyId: string;
  companyId2: string;
}) {
  // Clear existing demo notifications for idempotency
  await prisma.notification.deleteMany({
    where: {
      userId: { in: [params.ownerId, params.adminId, params.editorId, params.designerId] },
      title: { startsWith: '[Demo]' },
    },
  });

  const now = new Date();
  const notifications = [
    {
      userId: params.ownerId,
      companyId: params.companyId,
      type: 'content_in_review',
      title: '[Demo] İçerik onayınıza sunuldu: Workflow In Review',
      message: 'Ece Editor bu içeriği incelemeniz için gönderdi.',
      resourceType: 'content',
      isRead: false,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId,
      type: 'content_approved',
      title: '[Demo] İçerik onaylandı: Workflow Approved',
      message: 'İçerik başarıyla onaylandı ve planlamaya hazır.',
      resourceType: 'content',
      isRead: false,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId,
      type: 'content_published',
      title: '[Demo] İçerik yayınlandı: Workflow Published',
      message: 'İçerik başarıyla yayınlandı.',
      resourceType: 'content',
      isRead: true,
      readAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId2,
      type: 'content_in_review',
      title: '[Demo] İçerik onayınıza sunuldu: Brand Awareness Post',
      message: 'Momentum Digital için yeni bir içerik incelemede.',
      resourceType: 'content',
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId,
      type: 'payment_overdue',
      title: '[Demo] Ödeme gecikti: Atlas Local Dev — Şubat dönemi',
      message: 'Şubat dönemine ait ödeme vadesi geçti.',
      resourceType: 'payment',
      isRead: true,
      readAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
    },
    {
      userId: params.editorId,
      companyId: params.companyId,
      type: 'content_approved',
      title: '[Demo] İçerik onaylandı: Workflow Approved',
      message: 'Atandığınız içerik onaylandı.',
      resourceType: 'content',
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: params.designerId,
      companyId: params.companyId,
      type: 'content_approved',
      title: '[Demo] İçerik onaylandı: Workflow Approved',
      message: 'Tasarladığınız içerik onaylandı.',
      resourceType: 'content',
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }
}

async function ensureActivityLogs(params: {
  ownerId: string;
  adminId: string;
  editorId: string;
  designerId: string;
  companyId: string;
  companyId2: string;
}) {
  // Clear existing demo activity logs for idempotency
  await prisma.activityLog.deleteMany({
    where: {
      userId: { in: [params.ownerId, params.adminId, params.editorId, params.designerId] },
      action: {
        in: [
          'content.create', 'content.update', 'content.status_change',
          'content.approve', 'company.create', 'social_account.create',
          'payment.create', 'content.assign',
        ],
      },
      details: { path: ['_demo'], equals: true },
    },
  });

  const now = new Date();
  const logs = [
    {
      userId: params.ownerId,
      companyId: params.companyId,
      action: 'company.create',
      resourceType: 'company',
      resourceId: params.companyId,
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId2,
      action: 'company.create',
      resourceType: 'company',
      resourceId: params.companyId2,
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      userId: params.adminId,
      companyId: params.companyId,
      action: 'social_account.create',
      resourceType: 'social_account',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      userId: params.editorId,
      companyId: params.companyId,
      action: 'content.create',
      resourceType: 'content',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      userId: params.designerId,
      companyId: params.companyId,
      action: 'content.update',
      resourceType: 'content',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      userId: params.editorId,
      companyId: params.companyId,
      action: 'content.status_change',
      resourceType: 'content',
      details: { _demo: true, oldStatus: 'draft', newStatus: 'in_review' },
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId,
      action: 'content.approve',
      resourceType: 'content',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: params.ownerId,
      companyId: params.companyId,
      action: 'payment.create',
      resourceType: 'payment',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: params.adminId,
      companyId: params.companyId,
      action: 'content.assign',
      resourceType: 'content',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: params.editorId,
      companyId: params.companyId2,
      action: 'content.create',
      resourceType: 'content',
      details: { _demo: true },
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ];

  for (const log of logs) {
    await prisma.activityLog.create({ data: log });
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-seed-workflow-qa is dev-only and must not run in production.');
  }

  const passwordHash = await bcrypt.hash(PASSWORD, PASSWORD_SALT_ROUNDS);

  const users = [];
  for (const user of FIXTURE.users) {
    users.push(await ensureUser(user, passwordHash));
  }

  const usersByRole = Object.fromEntries(users.map((user) => [user.role, user])) as Record<UserRole, (typeof users)[number]>;

  // ── Company 1: Atlas Local Dev ──
  const company = await ensureCompany();
  const socialAccount = await ensureSocialAccount(company.id);

  await ensureMemberships(
    company.id,
    users.map((user) => user.id),
  );

  await archiveDuplicateQaContents(company.id);

  await ensureQaContents({
    companyId: company.id,
    socialAccountId: socialAccount.id,
    ownerId: usersByRole.owner.id,
    designerId: usersByRole.designer.id,
    editorId: usersByRole.editor.id,
  });
  await ensureQaPayments({
    companyId: company.id,
    createdById: usersByRole.owner.id,
    payments: FIXTURE.payments,
  });

  // ── Company 2: Momentum Digital ──
  const company2 = await ensureCompany2();
  const socialAccount2 = await ensureSocialAccount2(company2.id);

  // Only owner, admin, editor, designer — not client
  const company2UserIds = [
    usersByRole.owner.id,
    usersByRole.admin.id,
    usersByRole.editor.id,
    usersByRole.designer.id,
  ];
  await ensureMemberships(company2.id, company2UserIds);

  await archiveDuplicateQaContents(company2.id);
  await ensureQaContents2({
    companyId: company2.id,
    socialAccountId: socialAccount2.id,
    ownerId: usersByRole.owner.id,
    designerId: usersByRole.designer.id,
    editorId: usersByRole.editor.id,
  });
  await ensureQaPayments({
    companyId: company2.id,
    createdById: usersByRole.owner.id,
    payments: FIXTURE.payments2,
  });

  // ── Notifications & Activity Logs ──
  await ensureNotifications({
    ownerId: usersByRole.owner.id,
    adminId: usersByRole.admin.id,
    editorId: usersByRole.editor.id,
    designerId: usersByRole.designer.id,
    companyId: company.id,
    companyId2: company2.id,
  });
  await ensureActivityLogs({
    ownerId: usersByRole.owner.id,
    adminId: usersByRole.admin.id,
    editorId: usersByRole.editor.id,
    designerId: usersByRole.designer.id,
    companyId: company.id,
    companyId2: company2.id,
  });

  // ── Summary ──
  const membershipCount = await prisma.companyUser.count({
    where: { companyId: company.id },
  });
  const membershipCount2 = await prisma.companyUser.count({
    where: { companyId: company2.id },
  });

  const qaContents = await prisma.content.findMany({
    where: {
      id: { in: [...FIXTURE.contents, ...FIXTURE.contents2].map((content) => content.id) },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      companyId: true,
    },
    orderBy: { title: 'asc' },
  });
  const qaPayments = await prisma.payment.findMany({
    where: {
      id: { in: [...FIXTURE.payments, ...FIXTURE.payments2].map((payment) => payment.id) },
    },
    select: {
      id: true,
      amount: true,
      status: true,
      dueDate: true,
      paidAt: true,
    },
    orderBy: { dueDate: 'asc' },
  });
  const notificationCount = await prisma.notification.count({
    where: { title: { startsWith: '[Demo]' } },
  });
  const activityLogCount = await prisma.activityLog.count({
    where: { details: { path: ['_demo'], equals: true } },
  });

  console.log(
    JSON.stringify(
      {
        fixture: 'workflow-qa',
        password: PASSWORD,
        companies: [
          { id: company.id, name: company.name, slug: company.slug, membershipCount },
          { id: company2.id, name: company2.name, slug: company2.slug, membershipCount: membershipCount2 },
        ],
        socialAccounts: [
          { id: socialAccount.id, accountName: socialAccount.accountName },
          { id: socialAccount2.id, accountName: socialAccount2.accountName },
        ],
        users,
        qaContents,
        qaPayments: qaPayments.map((payment) => ({
          ...payment,
          amount: payment.amount.toString(),
        })),
        notificationCount,
        activityLogCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
