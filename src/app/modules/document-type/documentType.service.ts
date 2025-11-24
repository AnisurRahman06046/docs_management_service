import handlePostgresError from '../../../errors/handlePostgresError';
import { documentCategoryRepository } from '../document-category/documentCategory.repository';
import { documentTypeRepository } from './documentType.repository';
import { CreateDocumentTypeInput, UpdateDocumentTypeInput } from './documentType.interface';

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { statusCode: number; message: string; errorMessages?: { path: string | number; message: string }[] } };

const create = async (
  payload: CreateDocumentTypeInput,
  user?: { id?: string }
): Promise<ServiceResult<unknown>> => {
  try {
    const { agencyId, categoryId, name } = payload;

    // Validate category exists
    const categoryExists = await documentCategoryRepository.findById(categoryId, agencyId);
    if (!categoryExists) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Category not found for this agency',
          errorMessages: [{ path: 'categoryId', message: 'Category does not exist' }],
        },
      };
    }

    // Check for duplicate
    const exists = await documentTypeRepository.findByNameInCategory(name, categoryId, agencyId);
    if (exists) {
      return {
        success: false,
        error: {
          statusCode: 409,
          message: 'Document type already exists',
          errorMessages: [{ path: 'name', message: 'Document type name must be unique within this category' }],
        },
      };
    }

    const data = await documentTypeRepository.create({
      ...payload,
      ...(user?.id && { createdBy: user.id }),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

type PaginationOptions = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type PaginatedResult<T> =
  | { success: true; data: T; meta: { page: number; limit: number; total: number } }
  | { success: false; error: { statusCode: number; message: string; errorMessages?: { path: string | number; message: string }[] } };

const getByCategory = async (
  agencyId: string,
  categoryId: string,
  options: PaginationOptions
): Promise<PaginatedResult<unknown>> => {
  try {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      documentTypeRepository.findByCategory(categoryId, agencyId, { skip, take: limit, sortBy, sortOrder }),
      documentTypeRepository.countByCategory(categoryId, agencyId),
    ]);

    return { success: true, data, meta: { page, limit, total } };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const getById = async (agencyId: string, id: string): Promise<ServiceResult<unknown>> => {
  try {
    const data = await documentTypeRepository.findById(id, agencyId);

    if (!data) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Document type not found',
          errorMessages: [{ path: 'id', message: 'Does not exist for this agency' }],
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const update = async (
  agencyId: string,
  id: string,
  payload: UpdateDocumentTypeInput,
  user?: { id?: string }
): Promise<ServiceResult<unknown>> => {
  try {
    const exists = await documentTypeRepository.findById(id, agencyId);

    if (!exists) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Document type not found',
          errorMessages: [{ path: 'id', message: 'Cannot update non-existing type' }],
        },
      };
    }

    const data = await documentTypeRepository.update(id, {
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
    const exists = await documentTypeRepository.findById(id, agencyId);

    if (!exists) {
      return {
        success: false,
        error: {
          statusCode: 404,
          message: 'Document type not found',
          errorMessages: [{ path: 'id', message: 'Cannot delete non-existing type' }],
        },
      };
    }

    const data = await documentTypeRepository.softDelete(id, deletedBy);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

const getGroupedByCategory = async (agencyId: string): Promise<ServiceResult<unknown>> => {
  try {
    if (!agencyId) {
      return { success: false, error: { statusCode: 400, message: 'agencyId is required' } };
    }

    const [categories, documentTypes] = await Promise.all([
      documentCategoryRepository.findAllByAgency(agencyId),
      documentTypeRepository.findAllByAgency(agencyId),
    ]);

    const data = categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryDescription: cat.description,
      documentTypes: documentTypes.filter((dt) => dt.categoryId === cat.id),
    }));

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handlePostgresError(error as import('pg').DatabaseError) };
  }
};

export const documentTypeService = {
  create,
  getByCategory,
  getById,
  update,
  remove,
  getGroupedByCategory,
};
