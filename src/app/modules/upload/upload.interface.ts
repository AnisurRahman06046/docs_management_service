export type UploadedFile = {
  tempPath: string;
  filename: string;
  originalName: string;
  size: number;
  sizeKB: number;
  extension: string;
};

export type DeleteTempFilesResult = {
  deleted: number;
  failed: number;
};
