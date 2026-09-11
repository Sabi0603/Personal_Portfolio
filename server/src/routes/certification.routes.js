import { Router } from 'express';
import {
  getPublicCertifications,
  viewCertification,
  downloadCertification,
  getCertificationPreview,
} from '../controllers/certification.controller.js';

const router = Router();

router.get('/', getPublicCertifications);
router.get('/:id/view', viewCertification);
router.get('/:id/download', downloadCertification);
router.get('/:id/preview', getCertificationPreview);

export default router;

