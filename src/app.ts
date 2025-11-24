import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import path from 'path';
import routes from './app/routes';
import config from './config';

import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();

app.use(cors());
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
// URL: /api/v1/documents-management/files/{fileUrl}
// Example: /api/v1/documents-management/files/permanent/agency123/STUDENT/user456/docType/v1_file.pdf
app.use(
  '/api/v1/documents-management/files',
  express.static(config.file.uploadDir, {
    // Set proper headers for file viewing
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      // For PDFs and images, allow inline viewing
      if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        res.setHeader('Content-Disposition', 'inline');
      }
    },
  })
);

app.use('/api/v1/documents-management', routes);

app.use(globalErrorHandler);

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
