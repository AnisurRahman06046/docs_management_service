import { Router } from 'express';
import { documentController } from './document.controller';

const router = Router();

router.post('/', documentController.createDocuments);
router.get('/:agencyId/user/:userId', documentController.getUserDocuments);
router.delete('/:agencyId/user/:userId/:id', documentController.deleteDocument);
router.get('/:agencyId/:id', documentController.getById);

export const documentRouter = router;
