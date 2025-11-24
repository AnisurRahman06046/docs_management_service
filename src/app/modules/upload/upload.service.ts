import fs from 'fs';
import path from 'path';
import config from '../../../config';
import { UploadedFile } from './upload.interface';

// Multer file type
type MulterFile = {
  filename: string;
  originalname: string;
  path: string;
  size: number;
};

/**
 * Process uploaded files and return metadata
 */
const processUploadedFiles = (
  files: MulterFile[]
): UploadedFile[] => {
  return files.map((file) => {
    const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
    const relativeTempPath = path.join('temp', file.filename);

    return {
      tempPath: relativeTempPath,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      sizeKB: Math.round((file.size / 1024) * 100) / 100,
      extension
    };
  });
};

/**
 * Delete a temp file by its relative path
 */
const deleteTempFile = (relativeTempPath: string): boolean => {
  try {
    const fullPath = path.join(config.file.uploadDir, relativeTempPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Delete multiple temp files
 */
const deleteTempFiles = (relativeTempPaths: string[]): { deleted: number; failed: number } => {
  let deleted = 0;
  let failed = 0;

  for (const tempPath of relativeTempPaths) {
    if (deleteTempFile(tempPath)) {
      deleted++;
    } else {
      failed++;
    }
  }

  return { deleted, failed };
};

/**
 * Check if a temp file exists
 */
const tempFileExists = (relativeTempPath: string): boolean => {
  const fullPath = path.join(config.file.uploadDir, relativeTempPath);
  return fs.existsSync(fullPath);
};

/**
 * Get full path from relative temp path
 */
const getFullTempPath = (relativeTempPath: string): string => {
  return path.join(config.file.uploadDir, relativeTempPath);
};

/**
 * List all temp files (for debugging/admin)
 */
const listTempFiles = (): { filename: string; size: number; createdAt: Date }[] => {
  if (!fs.existsSync(config.file.tempDir)) {
    return [];
  }

  const files = fs.readdirSync(config.file.tempDir);
  return files.map((filename) => {
    const filePath = path.join(config.file.tempDir, filename);
    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      createdAt: stats.birthtime
    };
  });
};

export const UploadService = {
  processUploadedFiles,
  deleteTempFile,
  deleteTempFiles,
  tempFileExists,
  getFullTempPath,
  listTempFiles
};
