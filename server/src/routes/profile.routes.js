import { Router } from 'express';
import { getPublicProfile, downloadResume } from '../controllers/profile.controller.js';

const router = Router();

router.get('/', getPublicProfile);
router.get('/resume/download', downloadResume);

export default router;
