/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },
  file: {
    uploadDir: process.env.FILE_UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    tempDir: process.env.FILE_TEMP_DIR || path.join(process.cwd(), 'uploads', 'temp'),
    permanentDir: process.env.FILE_PERMANENT_DIR || path.join(process.cwd(), 'uploads', 'permanent'),
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    maxSizeReadable: process.env.MAX_SIZE_READABLE || '5 MB',
    // Base URL for file access - frontend uses this + fileUrl to construct browsable URL
    // Local: http://localhost:3005/api/v1/documents-management/files
    // Production: https://cdn.example.com/files or https://api.example.com/api/v1/documents-management/files
    baseUrl: process.env.FILE_BASE_URL || `http://localhost:${process.env.PORT || 3005}/api/v1/documents-management/files`,
  },
  tempCleanup: {
    enabled: process.env.TEMP_CLEANUP_ENABLED !== 'false',
    cronSchedule: process.env.TEMP_CLEANUP_CRON || '0 * * * *', // Every hour
    maxAgeHours: Number(process.env.TEMP_CLEANUP_MAX_AGE_HOURS) || 24,
  },
  virusScan: {
    enabled: process.env.VIRUS_SCAN_ENABLED !== 'false',
    clamdscan: {
      host: process.env.CLAMAV_HOST || '127.0.0.1',
      port: Number(process.env.CLAMAV_PORT) || 3310,
      timeout: Number(process.env.CLAMAV_TIMEOUT) || 60000,
    },
    clamscan: {
      path: process.env.CLAMSCAN_PATH || '/usr/bin/clamscan',
    },
    quarantineDir: process.env.QUARANTINE_DIR || path.join(process.cwd(), 'uploads', 'quarantine'),
  },
};

export default config;
