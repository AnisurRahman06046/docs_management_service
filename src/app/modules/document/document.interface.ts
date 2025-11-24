export type UserType = 'STUDENT' | 'COUNSELOR' | 'ADMIN' | 'OTHER';
export type DocumentStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export type CreateDocumentInput = {
  documentTypeId: string;
  tempPath: string;
  originalName: string;
  size: number;
  extension: string;
};

export type CreateDocumentsRequest = {
  agencyId: string;
  userId: string;
  userType: UserType;
  createdBy: string;
  documents: CreateDocumentInput[];
};

export type DocumentResponse = {
  id: string;
  documentTypeId: string;
  fileUrl: string;
  fileSize: number;
  fileExtension: string;
  status: string;
  versionNumber: number;
  createdAt: Date;
};

export type PermanentPathInfo = {
  agencyId: string;
  userType: string;
  userId: string;
  documentTypeId: string;
  versionNumber: number;
  filename: string;
};
