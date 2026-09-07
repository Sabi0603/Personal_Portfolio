import { Router } from 'express';
import {
  getPublicProjects,
  getPublicProjectBySlug,
} from '../controllers/project.controller.js';

const router = Router();

router.get('/', getPublicProjects);
router.get('/:slug', getPublicProjectBySlug);

export default router;
