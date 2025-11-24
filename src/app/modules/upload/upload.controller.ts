import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UploadService } from './upload.service';
import { UploadedFile } from './upload.interface';
import { virusScanner } from './virusScanner.service';
import config from '../../../config';

// Multer file type
type MulterFile = {
  filename: string;
  originalname: string;
  path: string;
  size: number;
};

/**
 * Upload file(s) to temp storage with virus scanning
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

  // Virus scanning if enabled
  if (config.virusScan?.enabled !== false) {
    const infectedFiles: string[] = [];

    for (const file of uploadedFiles) {
      const scanResult = await virusScanner.scanFile(file.tempPath);

      if (scanResult.isInfected) {
        infectedFiles.push(file.originalName);
        // Delete infected file from temp storage
        UploadService.deleteTempFiles([file.tempPath]);
      } else if (scanResult.error && !scanResult.isClean) {
        // Scan failed and we're being strict - reject the file
        infectedFiles.push(`${file.originalName} (scan failed: ${scanResult.error})`);
        UploadService.deleteTempFiles([file.tempPath]);
      }
    }

    if (infectedFiles.length > 0) {
      // If all files were infected, return error
      if (infectedFiles.length === uploadedFiles.length) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: 'File(s) rejected due to security scan',
          data: {
            rejectedFiles: infectedFiles,
            reason: 'Potential malware detected or scan failed',
          },
        });
      }

      // Some files passed, some didn't - return partial success
      const cleanFiles = uploadedFiles.filter(
        (f) => !infectedFiles.some((inf) => inf.startsWith(f.originalName))
      );

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `${cleanFiles.length} file(s) uploaded, ${infectedFiles.length} rejected`,
        data: {
          uploaded: cleanFiles,
          rejected: infectedFiles,
        },
      });
    }
  }

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
