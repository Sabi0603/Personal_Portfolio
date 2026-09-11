import { Router } from 'express';
import {
  getPublicResume,
  viewPublicResume,
  downloadPublicResume,
} from '../controllers/resume.controller.js';

const router = Router();

router.get('/', getPublicResume);
router.get('/view', viewPublicResume);
router.get('/download', downloadPublicResume);

export default router;

