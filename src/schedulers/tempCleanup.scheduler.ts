import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { logger } from '../shared/logger';

/**
 * Temp File Cleanup Scheduler
 *
 * Cleans up orphaned temp files that are older than the configured max age.
 * This handles cases where users abandon forms without saving or discarding.
 */

type CleanupStats = {
  totalFiles: number;
  deletedFiles: number;
  failedFiles: number;
  freedBytes: number;
}

/**
 * Get age of file in hours
 */
const getFileAgeHours = (filePath: string): number => {
  try {
    const stats = fs.statSync(filePath);
    const now = Date.now();
    const fileTime = stats.mtime.getTime();
    return (now - fileTime) / (1000 * 60 * 60); // Convert to hours
  } catch {
    return 0;
  }
};

/**
 * Clean up old temp files
 */
const cleanupTempFiles = (): CleanupStats => {
  const stats: CleanupStats = {
    totalFiles: 0,
    deletedFiles: 0,
    failedFiles: 0,
    freedBytes: 0,
  };

  const tempDir = config.file.tempDir;
  const maxAgeHours = config.tempCleanup.maxAgeHours;

  // Check if temp directory exists
  if (!fs.existsSync(tempDir)) {
    logger.info('Temp directory does not exist, nothing to clean');
    return stats;
  }

  try {
    const files = fs.readdirSync(tempDir);
    stats.totalFiles = files.length;

    for (const filename of files) {
      const filePath = path.join(tempDir, filename);

      try {
        const fileStat = fs.statSync(filePath);

        // Skip directories (in case there are any)
        if (fileStat.isDirectory()) {
          continue;
        }

        const ageHours = getFileAgeHours(filePath);

        if (ageHours >= maxAgeHours) {
          const fileSize = fileStat.size;
          fs.unlinkSync(filePath);
          stats.deletedFiles++;
          stats.freedBytes += fileSize;
          logger.info(`Deleted old temp file: ${filename} (age: ${ageHours.toFixed(1)}h)`);
        }
      } catch (err) {
        stats.failedFiles++;
        logger.error(`Failed to process temp file ${filename}:`, err);
      }
    }
  } catch (err) {
    logger.error('Failed to read temp directory:', err);
  }

  return stats;
};

/**
 * Start the temp cleanup scheduler
 */
const startTempCleanupScheduler = (): void => {
  if (!config.tempCleanup.enabled) {
    logger.info('Temp cleanup scheduler is disabled');
    return;
  }

  const cronSchedule = config.tempCleanup.cronSchedule;

  // Validate cron expression
  if (!cron.validate(cronSchedule)) {
    logger.error(`Invalid cron expression: ${cronSchedule}`);
    return;
  }

  logger.info(`Starting temp cleanup scheduler with schedule: ${cronSchedule}`);
  logger.info(`Max age for temp files: ${config.tempCleanup.maxAgeHours} hours`);

  cron.schedule(cronSchedule, () => {
    logger.info('Running temp file cleanup...');
    const startTime = Date.now();

    try {
      const stats = cleanupTempFiles();
      const duration = Date.now() - startTime;

      logger.info('Temp cleanup completed:', {
        totalFiles: stats.totalFiles,
        deletedFiles: stats.deletedFiles,
        failedFiles: stats.failedFiles,
        freedMB: (stats.freedBytes / (1024 * 1024)).toFixed(2),
        durationMs: duration,
      });
    } catch (err) {
      logger.error('Temp cleanup failed:', err);
    }
  });

  // Run cleanup once on startup (optional - can be commented out)
  // cleanupTempFiles();
};

/**
 * Run cleanup manually (for testing or admin purposes)
 */
const runCleanupNow = (): CleanupStats => {
  logger.info('Running manual temp file cleanup...');
  return cleanupTempFiles();
};

export const TempCleanupScheduler = {
  start: startTempCleanupScheduler,
  runNow: runCleanupNow,
  cleanupTempFiles,
};

export default TempCleanupScheduler;
