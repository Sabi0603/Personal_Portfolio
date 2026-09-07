import { Router } from 'express';
import { getPublicSkills } from '../controllers/skill.controller.js';

const router = Router();

// Public route to fetch published skills
router.get('/', getPublicSkills);

export default router;

