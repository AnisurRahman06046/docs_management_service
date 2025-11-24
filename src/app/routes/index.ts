import express from 'express';
import { documentCategoryRouter } from '../modules/document-category';
import { documentTypeRouter } from '../modules/document-type';
import { documentRouter } from '../modules/document';
import { uploadRouter } from '../modules/upload';

const router = express.Router();

const moduleRoutes = [
  { path: '/documents-category', route: documentCategoryRouter },
  { path: '/document-type', route: documentTypeRouter },
  { path: '/documents', route: documentRouter },
  { path: '/upload', route: uploadRouter },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
