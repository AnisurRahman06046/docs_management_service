import prisma from '../../../shared/prisma';

type WhereClause = Record<string, unknown>;
type OrderByClause = Record<string, 'asc' | 'desc'>;
type IncludeClause = Record<string, boolean | object>;

export const documentCategoryRepository = {
  create: async (data: {
    agencyId: string;
    name: string;
    description?: string;
    createdBy?: string;
  }) => {
    return prisma.documentCategory.create({ data });
  },

  findById: async (id: string, agencyId: string) => {
    return prisma.documentCategory.findFirst({
      where: { id, agencyId, deletedAt: null },
      include: { documentTypes: { where: { deletedAt: null } } },
    });
  },

  findByName: async (name: string, agencyId: string) => {
    return prisma.documentCategory.findFirst({
      where: { name, agencyId, deletedAt: null },
    });
  },

  findMany: async (params: {
    where: WhereClause;
    skip: number;
    take: number;
    orderBy: OrderByClause;
    include?: IncludeClause;
  }) => {
    return prisma.documentCategory.findMany(params);
  },

  count: async (where: WhereClause) => {
    return prisma.documentCategory.count({ where });
  },

  update: async (id: string, data: Record<string, unknown>) => {
    return prisma.documentCategory.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string, deletedBy?: string) => {
    return prisma.documentCategory.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },

  findAllByAgency: async (agencyId: string) => {
    return prisma.documentCategory.findMany({
      where: { agencyId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  },
};
