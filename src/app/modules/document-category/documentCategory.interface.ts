export type CreateCategoryInput = {
  agencyId: string;
  name: string;
  description?: string;
  createdBy?: string;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
  updatedBy?: string;
};

export type CategoryFilters = {
  agencyId: string;
  search?: string;
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
