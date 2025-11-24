import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { documentService } from './document.service';
import { CreateDocumentsRequest } from './document.interface';

const createDocuments = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as CreateDocumentsRequest;

  if (!payload.agencyId) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId is required' });
  }

  if (!payload.userId) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'userId is required' });
  }

  if (!payload.userType) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'userType is required' });
  }

  if (!payload.documents || !Array.isArray(payload.documents) || payload.documents.length === 0) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'documents array is required and cannot be empty' });
  }

  for (const doc of payload.documents) {
    if (!doc.documentTypeId || !doc.tempPath || !doc.size || !doc.extension) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Each document must have documentTypeId, tempPath, size, and extension',
      });
    }
  }

  const result = await documentService.createDocuments(payload);

  return sendResponse(res, {
    statusCode: result.success ? 201 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Documents created successfully' : result.error?.message || 'Failed to create documents',
    data: result.success ? result.data : null,
  });
});

const getUserDocuments = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, userId } = req.params;

  if (!agencyId || !userId) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and userId are required' });
  }

  const result = await documentService.getUserDocuments(agencyId, userId);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Documents fetched successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentService.getById(agencyId, id);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 404,
    success: result.success,
    message: result.success ? 'Document fetched successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, userId, id } = req.params;

  if (!agencyId || !userId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId, userId and id are required' });
  }

  const result = await documentService.deleteDocument(agencyId, userId, id);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Document deleted successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

export const documentController = {
  createDocuments,
  getUserDocuments,
  getById,
  deleteDocument,
};
