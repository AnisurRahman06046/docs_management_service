import express, { RequestHandler } from 'express';
import { UploadController } from './upload.controller';
import { uploadAny } from './upload.multer';

const router = express.Router();

/**
 * POST /upload
 * Upload single or multiple files to temp storage
 *
 * Body (multipart/form-data):
 * - file: single file
 * - files: multiple files
 */
router.post(
  '/',
  uploadAny as unknown as RequestHandler,
  UploadController.uploadFiles
);

/**
 * DELETE /upload/temp
 * Delete temp files by paths
 *
 * Body:
 * - tempPaths: string[] - array of temp file paths to delete
 */
router.delete(
  '/temp',
  UploadController.deleteTempFiles
);

export const uploadRouter = router;
