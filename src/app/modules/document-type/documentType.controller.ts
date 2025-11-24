import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { documentTypeService } from './documentType.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, categoryId } = req.params;
  const payload = req.body;

  if (!agencyId || !categoryId || !payload.name || !payload.allowedExtensions) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'agencyId, categoryId, name and allowedExtensions are required',
    });
  }

  const result = await documentTypeService.create({ ...payload, agencyId, categoryId });

  return sendResponse(res, {
    statusCode: result.success ? 201 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Document type added successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const getByCategory = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, categoryId } = req.params;
  const { page, limit, sortBy, sortOrder } = req.query;

  if (!agencyId || !categoryId) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and categoryId are required' });
  }

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || 'createdAt',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
  };

  const result = await documentTypeService.getByCategory(agencyId, categoryId, options);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Document types fetched' : result.error?.message,
    meta: result.success ? result.meta : undefined,
    data: result.success ? result.data : null,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentTypeService.getById(agencyId, id);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 404,
    success: result.success,
    message: result.success ? 'Document type fetched' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;
  const payload = req.body;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentTypeService.update(agencyId, id, payload);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Document type updated' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentTypeService.remove(agencyId, id);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Document type deleted' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const getGroupedByCategory = catchAsync(async (req: Request, res: Response) => {
  const { agencyId } = req.params;

  if (!agencyId) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId is required' });
  }

  const result = await documentTypeService.getGroupedByCategory(agencyId);

  return sendResponse(res, {
    statusCode: 200,
    success: result.success,
    message: result.success ? 'Document types grouped by categories fetched' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

export const documentTypeController = {
  create,
  getByCategory,
  getById,
  update,
  remove,
  getGroupedByCategory,
};
