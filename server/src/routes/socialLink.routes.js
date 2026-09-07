import { Router } from 'express';
import { getPublicSocialLinks } from '../controllers/socialLink.controller.js';

const router = Router();

router.get('/', getPublicSocialLinks);

export default router;
