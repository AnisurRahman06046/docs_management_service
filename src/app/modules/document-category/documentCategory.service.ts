import handlePostgresError from '../../../errors/handlePostgresError';
import { documentCategoryRepository } from './documentCategory.repository';
import { CreateCategoryInput, UpdateCategoryInput, CategoryFilters, PaginationOptions } from './documentCategory.interface';

type ServiceResult<T> =
  | { success: true; data: T; meta?: { page: number; limit: number; total: number } }
  | { success: false; error: { statusCode: number; message: string; errorMessages?: { path: string | number; message: string }[] } };

const create = async (
  payload: CreateCategoryInput,
  user?: { id?: string }
): Promise<ServiceResult<unknown>> => {
  try {
    const { agencyId, name, description } = payload;

    const exists = await documentCategoryRepository.findByName(name, agencyId);
    if (exists) {
      return {
        success: false,
        error: {
          statusCode: 409,
          message: 'Category already exists',
          errorMessages: [{ path: 'name', message: 'Category name must be unique within the agency' }],
        },
      };
    }

    const data = await documentCategoryRepository.create({
      agencyId,
      name,
      description,
      ...(user?.id && { createdBy: user.id }),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const getAll = async (
  filters: CategoryFilters,
  options: PaginationOptions
): Promise<ServiceResult<unknown>> => {
  try {
    const { agencyId, search = '' } = filters;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    if (!agencyId) {
      return { success: true, meta: { page, limit, total: 0 }, data: [] };
    }

    const skip = (page - 1) * limit;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null, agencyId: agencyId.trim() };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      documentCategoryRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { documentTypes: { where: { deletedAt: null } } },
      }),
      documentCategoryRepository.count(where),
    ]);

    return { success: true, meta: { page, limit, total }, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const getById = async (agencyId: string, id: string): Promise<ServiceResult<unknown>> => {
  try {
    const category = await documentCategoryRepository.findById(id, agencyId);

    if (!category) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Category not found',
          errorMessages: [{ path: 'id', message: 'Category does not exist for this agency' }],
        },
      };
    }

    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const update = async (
  agencyId: string,
  id: string,
  payload: UpdateCategoryInput,
  user?: { id?: string }
): Promise<ServiceResult<unknown>> => {
  try {
    const exists = await documentCategoryRepository.findById(id, agencyId);

    if (!exists) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Category not found',
          errorMessages: [{ path: 'id', message: 'Cannot update a non-existing category' }],
        },
      };
    }

    const data = await documentCategoryRepository.update(id, {
      ...payload,
      ...(user?.id && { updatedBy: user.id }),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const remove = async (agencyId: string, id: string, deletedBy?: string): Promise<ServiceResult<unknown>> => {
  try {
    const exists = await documentCategoryRepository.findById(id, agencyId);

    if (!exists) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Category not found',
          errorMessages: [{ path: 'id', message: 'Category does not exist for this agency' }],
        },
      };
    }

    const data = await documentCategoryRepository.softDelete(id, deletedBy);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

export const documentCategoryService = {
  create,
  getAll,
  getById,
  update,
  remove,
};
