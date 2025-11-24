export type CreateDocumentTypeInput = {
  agencyId: string;
  categoryId: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  allowedExtensions: string[];
  createdBy?: string;
};

export type UpdateDocumentTypeInput = {
  name?: string;
  description?: string;
  isRequired?: boolean;
  allowedExtensions?: string[];
  updatedBy?: string;
};
