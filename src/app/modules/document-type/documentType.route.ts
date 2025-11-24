import { Router } from 'express';
import { documentTypeController } from './documentType.controller';

const router = Router();

router.post('/:agencyId/:categoryId', documentTypeController.create);
router.get('/:agencyId/:categoryId/list', documentTypeController.getByCategory);
router.get('/:agencyId/grouped', documentTypeController.getGroupedByCategory);
router.patch('/:agencyId/:id', documentTypeController.update);
router.delete('/:agencyId/:id', documentTypeController.remove);
router.get('/:agencyId/:id', documentTypeController.getById);

export const documentTypeRouter = router;
