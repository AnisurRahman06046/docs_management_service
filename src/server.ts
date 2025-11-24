// src/server.ts
import app from './app';
import { pool } from './config/database';
import { initializeSchedulers } from './schedulers';
import { virusScanner } from './app/modules/upload/virusScanner.service';

const PORT = process.env.PORT || 3005;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-const
let server: any;

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} signal received. Starting graceful shutdown...`);

  // Close HTTP Server
  if (server) {
    console.log('Closing HTTP server...');
    await new Promise((resolve) => {
      server.close(() => {
        console.log('HTTP server closed');
        resolve(true);
      });
    });
  }

  // Close Database Pool
  try {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
  } catch (err) {
    console.error('Error closing database pool:', err);
  }

  // Exit process
  console.log('Graceful shutdown completed');
  process.exit(0);
}

// Handle unhandled promise rejections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Optionally terminate the process
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Perform graceful shutdown
  gracefulShutdown('uncaughtException').catch(console.error);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM').catch(console.error);
});

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT').catch(console.error);
});

// Start server
server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize virus scanner
  await virusScanner.initialize();

  // Initialize schedulers after server starts
  initializeSchedulers();
});

// Handle server errors
server.on('error', (error: Error) => {
  console.error('Server error:', error);
});