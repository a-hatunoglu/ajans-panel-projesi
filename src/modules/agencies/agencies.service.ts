import { prisma } from '../../config/database';
import { UserRole, AgencyRole } from '../../shared/types/enums';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors/app-error';
import { CreateAgencyInput, UpdateAgencyInput, AddAgencyUserInput, UpdateAgencyUserRoleInput } from './agencies.schema';
import bcrypt from 'bcryptjs';

// ─── Types ───────────────────────────────────────────────────

type ActorContext = {
  userId: string;
  role: string;
  agencyId?: string;
  agencyRole?: string;
};

// ─── List Agencies ───────────────────────────────────────────

export async function listAgencies(
  actor: ActorContext,
  query: Record<string, unknown> = {},
) {
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    throw new ForbiddenError('Bu işlem için yetkiniz yok.');
  }

  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 20));
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = typeof query.status === 'string' ? query.status : 'active'; // active | inactive | deleted | all

  const where: Record<string, unknown> = {};

  if (status === 'active') {
    where.isActive = true;
    where.deletedAt = null;
  } else if (status === 'inactive') {
    where.isActive = false;
    where.deletedAt = null;
  } else if (status === 'deleted') {
    where.deletedAt = { not: null };
  }
  // status === 'all' → no filter

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [agencies, total] = await Promise.all([
    prisma.agency.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        email: true,
        phone: true,
        website: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        _count: {
          select: {
            companies: { where: { deletedAt: null } },
            agencyUsers: true,
          },
        },
      },
    }),
    prisma.agency.count({ where }),
  ]);

  return {
    agencies: agencies.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      logoUrl: a.logoUrl,
      email: a.email,
      phone: a.phone,
      website: a.website,
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      deletedAt: a.deletedAt?.toISOString() ?? null,
      companyCount: a._count.companies,
      userCount: a._count.agencyUsers,
    })),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

// ─── Get Agency Detail ───────────────────────────────────────

export async function getAgency(actor: ActorContext, agencyId: string) {
  // Platform owner can view any agency; agency_admin can only view their own
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    if (!actor.agencyId || actor.agencyId !== agencyId) {
      throw new ForbiddenError('Bu işlem için yetkiniz yok.');
    }
  }

  const agency = await prisma.agency.findFirst({
    where: { id: agencyId },
    include: {
      _count: {
        select: {
          companies: { where: { deletedAt: null } },
          agencyUsers: true,
        },
      },
      agencyUsers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!agency) {
    throw new NotFoundError('Ajans bulunamadı.');
  }

  // Get content count for this agency's companies
  const companyIds = await prisma.company.findMany({
    where: { agencyId, deletedAt: null },
    select: { id: true },
  });
  const contentCount = await prisma.content.count({
    where: { companyId: { in: companyIds.map((c) => c.id) }, deletedAt: null },
  });

  return {
    id: agency.id,
    name: agency.name,
    slug: agency.slug,
    logoUrl: agency.logoUrl,
    email: agency.email,
    phone: agency.phone,
    website: agency.website,
    isActive: agency.isActive,
    createdAt: agency.createdAt.toISOString(),
    updatedAt: agency.updatedAt.toISOString(),
    deletedAt: agency.deletedAt?.toISOString() ?? null,
    stats: {
      companyCount: agency._count.companies,
      userCount: agency._count.agencyUsers,
      contentCount,
    },
    users: agency.agencyUsers.map((au) => ({
      id: au.user.id,
      email: au.user.email,
      firstName: au.user.firstName,
      lastName: au.user.lastName,
      avatarUrl: au.user.avatarUrl,
      role: au.user.role,
      agencyRole: au.role,
      isActive: au.user.isActive,
      lastLoginAt: au.user.lastLoginAt?.toISOString() ?? null,
    })),
  };
}

// ─── Create Agency ───────────────────────────────────────────

export async function createAgency(actor: ActorContext, input: CreateAgencyInput) {
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    throw new ForbiddenError('Bu işlem için yetkiniz yok.');
  }

  // Check slug uniqueness
  const existing = await prisma.agency.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new ConflictError('Bu slug zaten kullanılıyor.');
  }

  // Check admin email uniqueness
  const existingUser = await prisma.user.findUnique({ where: { email: input.adminEmail } });
  if (existingUser) {
    throw new ConflictError('Bu e-posta adresi zaten kayıtlı.');
  }

  const passwordHash = await bcrypt.hash(input.adminPassword, 12);

  // Create agency + admin user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: {
        name: input.name,
        slug: input.slug,
        email: input.email ?? null,
        phone: input.phone ?? null,
        website: input.website ?? null,
        logoUrl: input.logoUrl ?? null,
      },
    });

    const adminUser = await tx.user.create({
      data: {
        email: input.adminEmail,
        passwordHash,
        firstName: input.adminFirstName,
        lastName: input.adminLastName,
        role: UserRole.USER,
      },
    });

    await tx.agencyUser.create({
      data: {
        agencyId: agency.id,
        userId: adminUser.id,
        role: AgencyRole.AGENCY_ADMIN,
      },
    });

    return { agency, adminUser };
  });

  return {
    agency: {
      id: result.agency.id,
      name: result.agency.name,
      slug: result.agency.slug,
    },
    adminUser: {
      id: result.adminUser.id,
      email: result.adminUser.email,
      firstName: result.adminUser.firstName,
      lastName: result.adminUser.lastName,
    },
  };
}

// ─── Update Agency ───────────────────────────────────────────

export async function updateAgency(actor: ActorContext, agencyId: string, input: UpdateAgencyInput) {
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    throw new ForbiddenError('Bu işlem için yetkiniz yok.');
  }

  const agency = await prisma.agency.findFirst({
    where: { id: agencyId, deletedAt: null },
  });

  if (!agency) {
    throw new NotFoundError('Ajans bulunamadı.');
  }

  // Check slug uniqueness if changing
  if (input.slug && input.slug !== agency.slug) {
    const existing = await prisma.agency.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new ConflictError('Bu slug zaten kullanılıyor.');
    }
  }

  const updated = await prisma.agency.update({
    where: { id: agencyId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.website !== undefined && { website: input.website }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    isActive: updated.isActive,
  };
}

// ─── Soft Delete Agency ──────────────────────────────────────

export async function softDeleteAgency(actor: ActorContext, agencyId: string) {
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    throw new ForbiddenError('Bu işlem için yetkiniz yok.');
  }

  const agency = await prisma.agency.findFirst({
    where: { id: agencyId, deletedAt: null },
  });

  if (!agency) {
    throw new NotFoundError('Ajans bulunamadı.');
  }

  await prisma.agency.update({
    where: { id: agencyId },
    data: { deletedAt: new Date(), isActive: false },
  });

  return { id: agencyId };
}

// ─── Restore Agency ─────────────────────────────────────────

export async function restoreAgency(actor: ActorContext, agencyId: string) {
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    throw new ForbiddenError('Bu işlem için yetkiniz yok.');
  }

  const agency = await prisma.agency.findFirst({
    where: { id: agencyId, deletedAt: { not: null } },
  });

  if (!agency) {
    throw new NotFoundError('Silinmiş ajans bulunamadı.');
  }

  await prisma.agency.update({
    where: { id: agencyId },
    data: { deletedAt: null, isActive: true },
  });

  return { id: agencyId };
}

// ─── Add User to Agency ──────────────────────────────────────

export async function addAgencyUser(actor: ActorContext, agencyId: string, input: AddAgencyUserInput) {
  // Platform owner can add to any agency; agency_admin can only add to their own
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    if (!actor.agencyId || actor.agencyId !== agencyId) {
      throw new ForbiddenError('Bu işlem için yetkiniz yok.');
    }
  }

  const agency = await prisma.agency.findFirst({
    where: { id: agencyId, deletedAt: null },
  });

  if (!agency) {
    throw new NotFoundError('Ajans bulunamadı.');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    // Check if already in this agency
    const existingMembership = await prisma.agencyUser.findFirst({
      where: { agencyId, userId: existingUser.id },
    });
    if (existingMembership) {
      throw new ConflictError('Bu kullanıcı zaten bu ajansa kayıtlı.');
    }

    await prisma.$transaction(async (tx) => {
      // Add existing user to agency
      await tx.agencyUser.create({
        data: {
          agencyId,
          userId: existingUser.id,
          role: input.role as string,
        },
      });

      // Auto-attach to all active companies of this agency
      await attachUserToAgencyCompanies(tx, agencyId, existingUser.id);
    });

    return {
      userId: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
    };
  }

  // Create new user + membership + company attachments
  const passwordHash = await bcrypt.hash(input.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: UserRole.USER,
      },
    });

    await tx.agencyUser.create({
      data: {
        agencyId,
        userId: user.id,
        role: input.role as string,
      },
    });

    // Auto-attach to all active companies of this agency
    await attachUserToAgencyCompanies(tx, agencyId, user.id);

    return user;
  });

  return {
    userId: result.id,
    email: result.email,
    firstName: result.firstName,
    lastName: result.lastName,
  };
}

// ─── Helper: attach user to all companies of an agency ──────

async function attachUserToAgencyCompanies(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  agencyId: string,
  userId: string,
) {
  const companies = await tx.company.findMany({
    where: { agencyId, deletedAt: null },
    select: { id: true },
  });

  for (const company of companies) {
    // Check if already a member
    const existing = await tx.companyUser.findFirst({
      where: { companyId: company.id, userId },
    });

    if (existing) {
      // Already a member — ensure roles exist
      const existingRoles = await tx.companyUserRole.findMany({
        where: { companyUserId: existing.id },
        select: { role: true },
      });
      const existingRoleSet = new Set(existingRoles.map((r) => r.role));

      for (const role of ['editor', 'designer']) {
        if (!existingRoleSet.has(role)) {
          await tx.companyUserRole.create({
            data: { companyUserId: existing.id, role },
          });
        }
      }
    } else {
      // Create CompanyUser + editor & designer roles
      const companyUser = await tx.companyUser.create({
        data: { companyId: company.id, userId },
      });

      await tx.companyUserRole.createMany({
        data: [
          { companyUserId: companyUser.id, role: 'editor' },
          { companyUserId: companyUser.id, role: 'designer' },
        ],
      });
    }
  }
}

// ─── Update Agency User Role ─────────────────────────────────

export async function updateAgencyUserRole(
  actor: ActorContext,
  agencyId: string,
  targetUserId: string,
  input: UpdateAgencyUserRoleInput,
) {
  // Platform owner can update any agency; agency_admin can only update their own
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    if (!actor.agencyId || actor.agencyId !== agencyId) {
      throw new ForbiddenError('Bu işlem için yetkiniz yok.');
    }
  }

  // Cannot change own role
  if (actor.userId === targetUserId) {
    throw new ForbiddenError('Kendi rolünüzü değiştiremezsiniz.');
  }

  const membership = await prisma.agencyUser.findFirst({
    where: { agencyId, userId: targetUserId },
  });

  if (!membership) {
    throw new NotFoundError('Bu kullanıcı ajans üyesi değil.');
  }

  const updated = await prisma.agencyUser.update({
    where: { id: membership.id },
    data: { role: input.role },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
      },
    },
  });

  return {
    id: updated.user.id,
    email: updated.user.email,
    firstName: updated.user.firstName,
    lastName: updated.user.lastName,
    agencyRole: updated.role,
    isActive: updated.user.isActive,
  };
}

// ─── Remove User from Agency ─────────────────────────────────

export async function removeAgencyUser(
  actor: ActorContext,
  agencyId: string,
  targetUserId: string,
) {
  // Platform owner can remove from any agency; agency_admin can only remove from their own
  if (actor.role !== UserRole.PLATFORM_OWNER) {
    if (!actor.agencyId || actor.agencyId !== agencyId) {
      throw new ForbiddenError('Bu işlem için yetkiniz yok.');
    }
  }

  // Cannot remove self
  if (actor.userId === targetUserId) {
    throw new ForbiddenError('Kendinizi ajans ekibinden çıkaramazsınız.');
  }

  const membership = await prisma.agencyUser.findFirst({
    where: { agencyId, userId: targetUserId },
  });

  if (!membership) {
    throw new NotFoundError('Bu kullanıcı ajans üyesi değil.');
  }

  // Remove user from agency + all agency companies in a transaction
  await prisma.$transaction(async (tx) => {
    // Get all companies of this agency
    const companies = await tx.company.findMany({
      where: { agencyId, deletedAt: null },
      select: { id: true },
    });

    // Remove CompanyUserRoles + CompanyUser entries
    for (const company of companies) {
      const companyUser = await tx.companyUser.findFirst({
        where: { companyId: company.id, userId: targetUserId },
      });

      if (companyUser) {
        await tx.companyUserRole.deleteMany({
          where: { companyUserId: companyUser.id },
        });
        await tx.companyUser.delete({
          where: { id: companyUser.id },
        });
      }
    }

    // Remove AgencyUser
    await tx.agencyUser.delete({
      where: { id: membership.id },
    });
  });

  return { success: true };
}
