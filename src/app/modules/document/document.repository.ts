import prisma from '../../../shared/prisma';
import { UserType, DocumentStatus } from './document.interface';

export const documentRepository = {
  createWithRelations: async (data: {
    document: {
      agencyId: string;
      documentTypeId: string;
      userType: UserType;
      userId: string;
      status: DocumentStatus;
      versionNumber: number;
      fileUrl: string;
      fileSize: number;
      fileExtension: string;
      createdBy?: string;
    };
    version: {
      versionNumber: number;
      fileUrl: string;
      fileSize: number;
      fileExtension: string;
      uploadedBy: string;
    };
    auditLog: {
      action: string;
      performedBy: string;
      metadata?: object;
    };
  }) => {
    return prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: data.document,
      });

      const version = await tx.documentVersion.create({
        data: {
          documentId: document.id,
          ...data.version,
          createdBy: data.document.createdBy,
        },
      });

      const updatedDocument = await tx.document.update({
        where: { id: document.id },
        data: { currentVersionId: version.id },
      });

      await tx.documentAuditLog.create({
        data: {
          documentId: document.id,
          documentVersionId: version.id,
          ...data.auditLog,
          createdBy: data.document.createdBy,
        },
      });

      await tx.documentStatusTimeline.create({
        data: {
          documentId: document.id,
          status: data.document.status,
          changedBy: data.document.createdBy || data.version.uploadedBy,
          createdBy: data.document.createdBy,
        },
      });

      return { ...updatedDocument, currentVersion: version };
    });
  },

  findById: async (id: string, agencyId: string) => {
    return prisma.document.findFirst({
      where: { id, agencyId, deletedAt: null },
      include: {
        currentVersion: true,
        documentType: true,
      },
    });
  },

  findByIdAndUser: async (id: string, agencyId: string, userId: string) => {
    return prisma.document.findFirst({
      where: { id, agencyId, userId, deletedAt: null },
      include: {
        currentVersion: true,
        documentType: true,
      },
    });
  },

  findByUserAndType: async (userType: string, userId: string, documentTypeId: string) => {
    return prisma.document.findFirst({
      where: {
        userType: userType as UserType,
        userId,
        documentTypeId,
        deletedAt: null,
      },
    });
  },

  findByUser: async (agencyId: string, userId: string) => {
    return prisma.document.findMany({
      where: {
        agencyId,
        userId,
        deletedAt: null,
      },
      include: {
        currentVersion: true,
        documentType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  softDelete: async (id: string, deletedBy?: string) => {
    return prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },

  addAuditLog: async (data: {
    documentId: string;
    documentVersionId?: string;
    action: string;
    performedBy: string;
    metadata?: object;
  }) => {
    return prisma.documentAuditLog.create({
      data: {
        documentId: data.documentId,
        documentVersionId: data.documentVersionId,
        action: data.action,
        performedBy: data.performedBy,
        metadata: data.metadata,
        createdBy: data.performedBy,
      },
    });
  },

  updateWithNewVersion: async (data: {
    documentId: string;
    document: {
      versionNumber: number;
      fileUrl: string;
      fileSize: number;
      fileExtension: string;
      updatedBy: string;
    };
    version: {
      versionNumber: number;
      fileUrl: string;
      fileSize: number;
      fileExtension: string;
      uploadedBy: string;
    };
    auditLog: {
      action: string;
      performedBy: string;
      metadata?: object;
    };
  }) => {
    return prisma.$transaction(async (tx) => {
      // Create new version
      const version = await tx.documentVersion.create({
        data: {
          documentId: data.documentId,
          ...data.version,
          createdBy: data.document.updatedBy,
        },
      });

      // Update document with new version info
      const updatedDocument = await tx.document.update({
        where: { id: data.documentId },
        data: {
          versionNumber: data.document.versionNumber,
          fileUrl: data.document.fileUrl,
          fileSize: data.document.fileSize,
          fileExtension: data.document.fileExtension,
          currentVersionId: version.id,
          updatedBy: data.document.updatedBy,
          updatedAt: new Date(),
        },
      });

      // Create audit log
      await tx.documentAuditLog.create({
        data: {
          documentId: data.documentId,
          documentVersionId: version.id,
          ...data.auditLog,
          createdBy: data.document.updatedBy,
        },
      });

      return { ...updatedDocument, currentVersion: version };
    });
  },
};
