import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UploadService } from './upload.service';
import { UploadedFile } from './upload.interface';

// Multer file type
type MulterFile = {
  filename: string;
  originalname: string;
  path: string;
  size: number;
};

/**
 * Upload file(s) to temp storage
 */
const uploadFiles = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as MulterFile[];

  if (!files || files.length === 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'No files were uploaded',
    });
  }

  const uploadedFiles: UploadedFile[] = UploadService.processUploadedFiles(files);

  // Single file response
  if (uploadedFiles.length === 1) {
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'File uploaded successfully',
      data: uploadedFiles[0]
    });
  }

  // Multiple files response
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Files uploaded successfully',
    data: uploadedFiles
  });
});

/**
 * Delete temp files
 * DELETE /upload
 */
const deleteTempFiles = catchAsync(async (req: Request, res: Response) => {
  const { tempPaths } = req.body as { tempPaths: string[] };

  if (!tempPaths || !Array.isArray(tempPaths) || tempPaths.length === 0) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'No temp paths provided'
    });
  }

  const result = UploadService.deleteTempFiles(tempPaths);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.deleted > 0
      ? `${result.deleted} file(s) deleted successfully`
      : 'No files were deleted',
    data: {
      deletedCount: result.deleted,
      failedCount: result.failed
    }
  });
});

export const UploadController = {
  uploadFiles,
  deleteTempFiles
};
