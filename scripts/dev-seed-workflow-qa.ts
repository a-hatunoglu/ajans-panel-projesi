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
  socialAccount: {
    id: '15a2ebe9-c6e4-465c-bf54-2709da1caa69',
    platform: 'instagram',
    accountName: '@atlaslocaldev',
    profileUrl: 'https://instagram.com/atlaslocaldev',
    notes: 'Dev-only social account fixture for workflow QA content.',
  },
  users: [
    {
      id: 'cf187016-976f-4dbe-bc10-8c35e4dd3d75',
      email: 'enes@test.com',
      firstName: 'Enes',
      lastName: 'Owner',
      role: UserRole.OWNER,
    },
    {
      id: '12a0ad6e-3d92-4e88-a239-167a3bfcfdb9',
      email: 'ayla.admin@test.com',
      firstName: 'Ayla',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
    {
      id: 'e62e0a6a-aa61-4fb9-9df7-d6fcb9639e90',
      email: 'ece.editor@test.com',
      firstName: 'Ece',
      lastName: 'Editor',
      role: UserRole.EDITOR,
    },
    {
      id: 'd8d3a00f-02d2-4587-b494-25ac7b3b65d9',
      email: 'deniz.designer@test.com',
      firstName: 'Deniz',
      lastName: 'Designer',
      role: UserRole.DESIGNER,
    },
    {
      id: 'd8347798-0116-4dce-88e3-935e6023bfd9',
      email: 'cem.client@test.com',
      firstName: 'Cem',
      lastName: 'Client',
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
  await prisma.content.updateMany({
    where: {
      companyId,
      title: { in: FIXTURE.contents.map((content) => content.title) },
      id: { notIn: FIXTURE.contents.map((content) => content.id) },
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

async function ensureQaPayments(params: {
  companyId: string;
  createdById: string;
}) {
  for (const payment of FIXTURE.payments) {
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
  });

  const membershipCount = await prisma.companyUser.count({
    where: { companyId: company.id },
  });

  const qaContents = await prisma.content.findMany({
    where: {
      id: { in: FIXTURE.contents.map((content) => content.id) },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      assignedDesignerId: true,
      assignedEditorId: true,
      createdById: true,
      companyId: true,
    },
    orderBy: { title: 'asc' },
  });
  const qaPayments = await prisma.payment.findMany({
    where: {
      id: { in: FIXTURE.payments.map((payment) => payment.id) },
      companyId: company.id,
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

  console.log(
    JSON.stringify(
      {
        fixture: 'workflow-qa',
        password: PASSWORD,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          membershipCount,
        },
        socialAccount: {
          id: socialAccount.id,
          accountName: socialAccount.accountName,
        },
        users,
        qaContents,
        qaPayments: qaPayments.map((payment) => ({
          ...payment,
          amount: payment.amount.toString(),
        })),
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
