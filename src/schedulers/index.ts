import { TempCleanupScheduler } from './tempCleanup.scheduler';
import { logger } from '../shared/logger';

/**
 * Initialize all schedulers
 */
const initializeSchedulers = (): void => {
  logger.info('Initializing schedulers...');

  // Start temp file cleanup scheduler
  TempCleanupScheduler.start();

  logger.info('All schedulers initialized');
};

export { initializeSchedulers, TempCleanupScheduler };
