import { Router } from 'express';
import { getPublicCertifications } from '../controllers/certification.controller.js';

const router = Router();

router.get('/', getPublicCertifications);

export default router;
