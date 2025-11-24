import prisma from '../../../shared/prisma';
import { CreateDocumentTypeInput } from './documentType.interface';

export const documentTypeRepository = {
  create: async (data: CreateDocumentTypeInput) => {
    return prisma.documentTypeRequirements.create({ data });
  },

  findById: async (id: string, agencyId: string) => {
    return prisma.documentTypeRequirements.findFirst({
      where: { id, agencyId, deletedAt: null },
    });
  },

  findByNameInCategory: async (name: string, categoryId: string, agencyId: string) => {
    return prisma.documentTypeRequirements.findFirst({
      where: { name, categoryId, agencyId, deletedAt: null },
    });
  },

  findByCategory: async (
    categoryId: string,
    agencyId: string,
    options?: { skip?: number; take?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ) => {
    return prisma.documentTypeRequirements.findMany({
      where: { agencyId, categoryId, deletedAt: null },
      skip: options?.skip,
      take: options?.take,
      orderBy: { [options?.sortBy || 'createdAt']: options?.sortOrder || 'asc' },
    });
  },

  countByCategory: async (categoryId: string, agencyId: string) => {
    return prisma.documentTypeRequirements.count({
      where: { agencyId, categoryId, deletedAt: null },
    });
  },

  findAllByAgency: async (agencyId: string) => {
    return prisma.documentTypeRequirements.findMany({
      where: { agencyId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  },

  findByIds: async (ids: string[], agencyId: string) => {
    return prisma.documentTypeRequirements.findMany({
      where: { id: { in: ids }, agencyId, deletedAt: null },
    });
  },

  update: async (id: string, data: Record<string, unknown>) => {
    return prisma.documentTypeRequirements.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string, deletedBy?: string) => {
    return prisma.documentTypeRequirements.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },
};
