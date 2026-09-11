import { Router } from 'express';
import {
  getPublicProfile,
  viewResume,
  downloadResume,
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/', getPublicProfile);
router.get('/resume/view', viewResume);
router.get('/resume/download', downloadResume);

export default router;
