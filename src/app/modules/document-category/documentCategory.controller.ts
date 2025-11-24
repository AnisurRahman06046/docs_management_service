import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { documentCategoryService } from './documentCategory.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await documentCategoryService.create(req.body);

  return sendResponse(res, {
    statusCode: result.success ? 201 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Category created successfully' : result.error?.message || 'Failed to create category',
    data: result.success ? result.data : null,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { agencyId } = req.params;
  const { search = '', page, limit, sortBy, sortOrder } = req.query;

  if (!agencyId) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId is required' });
  }

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || 'createdAt',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
  };

  const result = await documentCategoryService.getAll({ agencyId, search: search as string }, options);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Categories fetched successfully' : result.error?.message,
    meta: result.success ? result.meta : undefined,
    data: result.success ? result.data : null,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentCategoryService.getById(agencyId, id);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 404,
    success: result.success,
    message: result.success ? 'Category fetched successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;
  const payload = req.body;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentCategoryService.update(agencyId, id, payload);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Category updated successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { agencyId, id } = req.params;

  if (!agencyId || !id) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'agencyId and id are required' });
  }

  const result = await documentCategoryService.remove(agencyId, id);

  return sendResponse(res, {
    statusCode: result.success ? 200 : result.error?.statusCode || 400,
    success: result.success,
    message: result.success ? 'Category deleted successfully' : result.error?.message,
    data: result.success ? result.data : null,
  });
});

export const documentCategoryController = {
  create,
  getAll,
  getById,
  update,
  remove,
};
