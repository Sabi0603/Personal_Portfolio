import { Router } from 'express';
import { protectAdmin } from '../middlewares/auth.middleware.js';

// Controllers
import {
  getAdminProfile,
  updateProfile,
} from '../controllers/profile.controller.js';

import {
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';

import {
  getAllExperienceAdmin,
  getExperienceByIdAdmin,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experience.controller.js';

import {
  getAllEducationAdmin,
  getEducationByIdAdmin,
  createEducation,
  updateEducation,
  deleteEducation,
} from '../controllers/education.controller.js';

import {
  getAllCertificationsAdmin,
  getCertificationByIdAdmin,
  createCertification,
  updateCertification,
  deleteCertification,
} from '../controllers/certification.controller.js';

import {
  getAllSocialLinksAdmin,
  getSocialLinkByIdAdmin,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../controllers/socialLink.controller.js';

import {
  getAllSkillsAdmin,
  getSkillByIdAdmin,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skill.controller.js';

import {
  getAdminSettings,
  updateAdminSettings,
} from '../controllers/settings.controller.js';

import {
  getAllMessagesAdmin,
  getMessageByIdAdmin,
  markMessageReadAdmin,
  replyToMessageAdmin,
  deleteMessageAdmin,
} from '../controllers/contact.controller.js';

const router = Router();

// ==========================================
// SECURE ALL ADMIN ROUTES WITH AUTH GUARD
// ==========================================
router.use(protectAdmin);

// --- Profile Routes ---
router.route('/profile')
  .get(getAdminProfile)
  .put(updateProfile);

// --- Project Routes ---
router.route('/projects')
  .get(getAllProjectsAdmin)
  .post(createProject);

router.route('/projects/:id')
  .get(getProjectByIdAdmin)
  .put(updateProject)
  .delete(deleteProject);

// --- Experience Routes ---
router.route('/experience')
  .get(getAllExperienceAdmin)
  .post(createExperience);

router.route('/experience/:id')
  .get(getExperienceByIdAdmin)
  .put(updateExperience)
  .delete(deleteExperience);

// --- Education Routes ---
router.route('/education')
  .get(getAllEducationAdmin)
  .post(createEducation);

router.route('/education/:id')
  .get(getEducationByIdAdmin)
  .put(updateEducation)
  .delete(deleteEducation);

// --- Certification Routes ---
router.route('/certifications')
  .get(getAllCertificationsAdmin)
  .post(createCertification);

router.route('/certifications/:id')
  .get(getCertificationByIdAdmin)
  .put(updateCertification)
  .delete(deleteCertification);

// --- Social Link Routes ---
router.route('/social-links')
  .get(getAllSocialLinksAdmin)
  .post(createSocialLink);

router.route('/social-links/:id')
  .get(getSocialLinkByIdAdmin)
  .put(updateSocialLink)
  .delete(deleteSocialLink);

// --- Skill Routes ---
router.route('/skills')
  .get(getAllSkillsAdmin)
  .post(createSkill);

router.route('/skills/:id')
  .get(getSkillByIdAdmin)
  .put(updateSkill)
  .delete(deleteSkill);

// --- Settings Routes ---
router.route('/settings')
  .get(getAdminSettings)
  .put(updateAdminSettings);

// --- Contact Message Routes ---
router.route('/messages')
  .get(getAllMessagesAdmin);

router.route('/messages/:id')
  .get(getMessageByIdAdmin)
  .delete(deleteMessageAdmin);

router.route('/messages/:id/read')
  .patch(markMessageReadAdmin);

router.route('/messages/:id/reply')
  .patch(replyToMessageAdmin);

export default router;
