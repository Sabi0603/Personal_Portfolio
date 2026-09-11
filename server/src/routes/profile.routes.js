import { Router } from 'express';
import { getPublicProfile } from '../controllers/profile.controller.js';

const router = Router();

router.get('/', getPublicProfile);
router.get('/resume/view', (req, res) => res.redirect(301, '/api/resume/view'));
router.get('/resume/download', (req, res) => res.redirect(301, '/api/resume/download'));

export default router;
