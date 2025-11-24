import handlePostgresError from '../../../errors/handlePostgresError';
import { UploadService } from '../upload/upload.service';
import { FileManagerService } from '../upload/fileManager.service';
import { documentTypeRepository } from '../document-type/documentType.repository';
import { documentRepository } from './document.repository';
import { CreateDocumentsRequest, DocumentResponse, UserType } from './document.interface';

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { statusCode: number; message: string; errorMessages?: { path: string | number; message: string }[] } };

/**
 * Helper to clean up temp files when document creation fails
 */
const cleanupTempFiles = (documents: { tempPath: string }[]): void => {
  const tempPaths = documents.map((d) => d.tempPath);
  UploadService.deleteTempFiles(tempPaths);
};

const createDocuments = async (payload: CreateDocumentsRequest): Promise<ServiceResult<DocumentResponse[]>> => {
  const { agencyId, userId, userType, createdBy, documents } = payload;
  const createdDocs: DocumentResponse[] = [];

  try {
    // Validate all temp files exist
    for (const doc of documents) {
      if (!UploadService.tempFileExists(doc.tempPath)) {
        // Clean up any other temp files that do exist
        cleanupTempFiles(documents.filter((d) => d.tempPath !== doc.tempPath));
        return {
          success: false,
          error: {
            statusCode: 400,
            message: 'Temp file not found',
            errorMessages: [{ path: doc.tempPath, message: 'File does not exist in temp storage' }],
          },
        };
      }
    }

    // Get all document types and validate
    const documentTypeIds = documents.map((d) => d.documentTypeId);
    const documentTypes = await documentTypeRepository.findByIds(documentTypeIds, agencyId);

    const foundTypeIds = new Set(documentTypes.map((dt) => dt.id));
    for (const doc of documents) {
      if (!foundTypeIds.has(doc.documentTypeId)) {
        cleanupTempFiles(documents);
        return {
          success: false,
          error: {
            statusCode: 404,
            message: 'Document type not found',
            errorMessages: [{ path: doc.documentTypeId, message: 'Document type does not exist for this agency' }],
          },
        };
      }
    }

    // Validate file extensions
    const typeMap = new Map(documentTypes.map((dt) => [dt.id, dt]));
    for (const doc of documents) {
      const docType = typeMap.get(doc.documentTypeId);
      if (docType && docType.allowedExtensions.length > 0) {
        const ext = doc.extension.toLowerCase();
        if (!docType.allowedExtensions.includes(ext)) {
          cleanupTempFiles(documents);
          return {
            success: false,
            error: {
              statusCode: 400,
              message: 'Invalid file extension',
              errorMessages: [
                {
                  path: doc.originalName,
                  message: `Extension '${ext}' is not allowed for ${docType.name}. Allowed: ${docType.allowedExtensions.join(', ')}`,
                },
              ],
            },
          };
        }
      }
    }

    // Check for duplicate documents
    for (const doc of documents) {
      const existingDoc = await documentRepository.findByUserAndType(userType, userId, doc.documentTypeId);
      if (existingDoc) {
        cleanupTempFiles(documents);
        const docType = typeMap.get(doc.documentTypeId);
        return {
          success: false,
          error: {
            statusCode: 409,
            message: 'Document already exists',
            errorMessages: [{ path: doc.documentTypeId, message: `A ${docType?.name || 'document'} already exists for this user` }],
          },
        };
      }
    }

    // Create documents
    for (const doc of documents) {
      const permanentPath = FileManagerService.getRelativePermanentPath({
        agencyId,
        userType,
        userId,
        documentTypeId: doc.documentTypeId,
        versionNumber: 1,
        filename: doc.originalName,
      });

      const createdDoc = await documentRepository.createWithRelations({
        document: {
          agencyId,
          documentTypeId: doc.documentTypeId,
          userType: userType as UserType,
          userId,
          status: 'DRAFT',
          versionNumber: 1,
          fileUrl: permanentPath,
          fileSize: doc.size,
          fileExtension: doc.extension,
          createdBy,
        },
        version: {
          versionNumber: 1,
          fileUrl: permanentPath,
          fileSize: doc.size,
          fileExtension: doc.extension,
          uploadedBy: createdBy,
        },
        auditLog: {
          action: 'UPLOADED',
          performedBy: createdBy,
          metadata: { originalName: doc.originalName, tempPath: doc.tempPath },
        },
      });

      FileManagerService.moveToPermament(doc.tempPath, permanentPath);

      createdDocs.push({
        id: createdDoc.id,
        documentTypeId: createdDoc.documentTypeId,
        fileUrl: createdDoc.fileUrl,
        fileSize: createdDoc.fileSize,
        fileExtension: createdDoc.fileExtension,
        status: createdDoc.status,
        versionNumber: createdDoc.versionNumber,
        createdAt: createdDoc.createdAt,
      });
    }

    return { success: true, data: createdDocs };
  } catch (error) {
    // Clean up temp files on database error
    cleanupTempFiles(documents);
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const getUserDocuments = async (agencyId: string, userId: string): Promise<ServiceResult<unknown>> => {
  try {
    const documents = await documentRepository.findByUser(agencyId, userId);
    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const getById = async (agencyId: string, id: string): Promise<ServiceResult<unknown>> => {
  try {
    const document = await documentRepository.findById(id, agencyId);

    if (!document) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Document not found',
          errorMessages: [{ path: 'id', message: 'Document does not exist' }],
        },
      };
    }

    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

interface UpdateDocumentPayload {
  agencyId: string;
  userId: string;
  documentId: string;
  tempPath: string;
  originalName: string;
  size: number;
  extension: string;
  updatedBy: string;
}

const updateDocument = async (payload: UpdateDocumentPayload): Promise<ServiceResult<DocumentResponse>> => {
  const { agencyId, userId, documentId, tempPath, originalName, size, extension, updatedBy } = payload;

  try {
    // Validate temp file exists
    if (!UploadService.tempFileExists(tempPath)) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: 'Temp file not found',
          errorMessages: [{ path: tempPath, message: 'File does not exist in temp storage' }],
        },
      };
    }

    // Find existing document and verify ownership
    const existingDoc = await documentRepository.findByIdAndUser(documentId, agencyId, userId);
    if (!existingDoc) {
      UploadService.deleteTempFile(tempPath);
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Document not found',
          errorMessages: [{ path: documentId, message: 'Document does not exist or does not belong to this user' }],
        },
      };
    }

    // Get document type and validate extension
    const documentType = await documentTypeRepository.findById(existingDoc.documentTypeId, agencyId);
    if (documentType && documentType.allowedExtensions.length > 0) {
      const ext = extension.toLowerCase();
      if (!documentType.allowedExtensions.includes(ext)) {
        UploadService.deleteTempFile(tempPath);
        return {
          success: false,
          error: {
            statusCode: 400,
            message: 'Invalid file extension',
            errorMessages: [
              {
                path: originalName,
                message: `Extension '${ext}' is not allowed for ${documentType.name}. Allowed: ${documentType.allowedExtensions.join(', ')}`,
              },
            ],
          },
        };
      }
    }

    // Calculate new version number
    const newVersionNumber = existingDoc.versionNumber + 1;

    // Generate new permanent path
    const permanentPath = FileManagerService.getRelativePermanentPath({
      agencyId,
      userType: existingDoc.userType,
      userId,
      documentTypeId: existingDoc.documentTypeId,
      versionNumber: newVersionNumber,
      filename: originalName,
    });

    // Update document with new version
    const updatedDoc = await documentRepository.updateWithNewVersion({
      documentId,
      document: {
        versionNumber: newVersionNumber,
        fileUrl: permanentPath,
        fileSize: size,
        fileExtension: extension,
        updatedBy,
      },
      version: {
        versionNumber: newVersionNumber,
        fileUrl: permanentPath,
        fileSize: size,
        fileExtension: extension,
        uploadedBy: updatedBy,
      },
      auditLog: {
        action: 'UPDATED',
        performedBy: updatedBy,
        metadata: {
          originalName,
          tempPath,
          previousVersion: existingDoc.versionNumber,
          previousFileUrl: existingDoc.fileUrl,
        },
      },
    });

    // Move new file to permanent storage
    FileManagerService.moveToPermament(tempPath, permanentPath);

    // Optionally delete old file (keep for version history)
    // FileManagerService.deletePermanentFile(existingDoc.fileUrl);

    return {
      success: true,
      data: {
        id: updatedDoc.id,
        documentTypeId: updatedDoc.documentTypeId,
        fileUrl: updatedDoc.fileUrl,
        fileSize: updatedDoc.fileSize,
        fileExtension: updatedDoc.fileExtension,
        status: updatedDoc.status,
        versionNumber: updatedDoc.versionNumber,
        createdAt: updatedDoc.createdAt,
      },
    };
  } catch (error) {
    // Clean up temp file on database error
    UploadService.deleteTempFile(tempPath);
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const deleteDocument = async (agencyId: string, userId: string, id: string): Promise<ServiceResult<{ deleted: boolean }>> => {
  try {
    // Find the document and verify ownership
    const document = await documentRepository.findByIdAndUser(id, agencyId, userId);

    if (!document) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Document not found',
          errorMessages: [{ path: 'id', message: 'Document does not exist or does not belong to this user' }],
        },
      };
    }

    // Delete the file from storage
    FileManagerService.deletePermanentFile(document.fileUrl);

    // Soft delete - keeps record in database with deletedAt timestamp
    await documentRepository.softDelete(id, userId);

    // Add audit log for deletion
    await documentRepository.addAuditLog({
      documentId: id,
      action: 'DELETED',
      performedBy: userId,
      metadata: { fileUrl: document.fileUrl, deletedAt: new Date().toISOString() },
    });

    return { success: true, data: { deleted: true } };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

export const documentService = {
  createDocuments,
  getUserDocuments,
  getById,
  updateDocument,
  deleteDocument,
};
