import fs from 'fs';
import path from 'path';
import config from '../../../config';
import { PermanentPathInfo } from '../document/document.interface';

/**
 * Build the permanent file path based on document info
 */
const buildPermanentPath = (info: PermanentPathInfo): string => {
  const { agencyId, userType, userId, documentTypeId, versionNumber, filename } = info;
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  const timestamp = Date.now();
  const permanentFilename = `v${versionNumber}_${timestamp}_${baseName}${ext}`;

  return path.join(
    agencyId,
    userType,
    userId,
    documentTypeId,
    permanentFilename
  );
};

/**
 * Get relative permanent path (for storing in DB)
 */
const getRelativePermanentPath = (info: PermanentPathInfo): string => {
  return path.join('permanent', buildPermanentPath(info));
};

/**
 * Get full permanent path (for file operations)
 */
const getFullPermanentPath = (relativePath: string): string => {
  return path.join(config.file.uploadDir, relativePath);
};

/**
 * Ensure directory exists for the permanent file
 */
const ensurePermanentDir = (relativePermanentPath: string): void => {
  const fullPath = path.join(config.file.uploadDir, relativePermanentPath);
  const dirPath = path.dirname(fullPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Move file from temp to permanent location
 */
const moveToPermament = (
  relativeTempPath: string,
  relativePermanentPath: string
): void => {
  const fullTempPath = path.join(config.file.uploadDir, relativeTempPath);
  const fullPermanentPath = path.join(config.file.uploadDir, relativePermanentPath);

  // Ensure target directory exists
  ensurePermanentDir(relativePermanentPath);

  // Move file (rename if same filesystem, copy+delete otherwise)
  try {
    fs.renameSync(fullTempPath, fullPermanentPath);
  } catch (error) {
    // If rename fails (cross-device), copy and delete
    fs.copyFileSync(fullTempPath, fullPermanentPath);
    fs.unlinkSync(fullTempPath);
  }
};

/**
 * Delete a permanent file
 */
const deletePermanentFile = (relativePermanentPath: string): boolean => {
  try {
    const fullPath = path.join(config.file.uploadDir, relativePermanentPath);
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
 * Check if permanent file exists
 */
const permanentFileExists = (relativePermanentPath: string): boolean => {
  const fullPath = path.join(config.file.uploadDir, relativePermanentPath);
  return fs.existsSync(fullPath);
};

/**
 * Get file stats
 */
const getFileStats = (relativePath: string): fs.Stats | null => {
  try {
    const fullPath = path.join(config.file.uploadDir, relativePath);
    return fs.statSync(fullPath);
  } catch {
    return null;
  }
};

/**
 * Delete user's document folder (all versions)
 */
const deleteUserDocumentFolder = (
  agencyId: string,
  userType: string,
  userId: string,
  documentTypeId: string
): boolean => {
  try {
    const folderPath = path.join(
      config.file.permanentDir,
      agencyId,
      userType,
      userId,
      documentTypeId
    );
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const FileManagerService = {
  buildPermanentPath,
  getRelativePermanentPath,
  getFullPermanentPath,
  ensurePermanentDir,
  moveToPermament,
  deletePermanentFile,
  permanentFileExists,
  getFileStats,
  deleteUserDocumentFolder
};
