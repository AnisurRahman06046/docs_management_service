import { Router } from 'express';
import { documentCategoryController } from './documentCategory.controller';

const router = Router();

router.post('/', documentCategoryController.create);
router.get('/:agencyId', documentCategoryController.getAll);
router.get('/:agencyId/:id', documentCategoryController.getById);
router.patch('/:agencyId/:id', documentCategoryController.update);
router.delete('/:agencyId/:id', documentCategoryController.remove);

export const documentCategoryRouter = router;
