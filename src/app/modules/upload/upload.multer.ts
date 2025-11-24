import fs from 'fs';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../../../config';

// Ensure temp directory exists
const ensureTempDir = (): void => {
  if (!fs.existsSync(config.file.tempDir)) {
    fs.mkdirSync(config.file.tempDir, { recursive: true });
  }
};

ensureTempDir();

// Storage configuration for temp uploads
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureTempDir();
    cb(null, config.file.tempDir);
  },
  filename: (_req, file, cb) => {
    const uuid = uuidv4().split('-')[0]; // Short UUID
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Sanitize filename
      .substring(0, 50); // Limit length
    const filename = `${uuid}_${baseName}${ext}`;
    cb(null, filename);
  }
});

// File filter - basic validation (detailed validation in service)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileFilter = (
  _req: any,
  file: { originalname: string },
  cb: multer.FileFilterCallback
) => {
  // Allow all files at multer level, validate extensions in service layer
  // This allows proper error messages with document type context
  if (file.originalname) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file'));
  }
};

// Multer instance for single file upload
export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: config.file.maxFileSize
  },
  fileFilter
}).single('file');

// Multer instance for multiple file upload
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: config.file.maxFileSize
  },
  fileFilter
}).array('files', 10); // Max 10 files at once

// Combined handler that accepts both single and multiple
export const uploadAny = multer({
  storage,
  limits: {
    fileSize: config.file.maxFileSize
  },
  fileFilter
}).any();
