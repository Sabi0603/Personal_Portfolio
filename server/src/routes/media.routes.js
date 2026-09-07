import { Router } from 'express';
import { uploadMedia, deleteMedia } from '../controllers/media.controller.js';
import { handleSingleUpload } from '../middlewares/upload.middleware.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all media endpoints with Admin JWT auth guard
router.use(protectAdmin);

// Media upload endpoint
router.post('/upload', handleSingleUpload, uploadMedia);

// Media deletion endpoints (query/body or route parameter matching full public ID path)
router.delete('/', deleteMedia);
router.delete('/*publicId', deleteMedia);

export default router;
