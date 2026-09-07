import { Router } from 'express';
import {
  login,
  getMe,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';
import { loginLimiter, forgotPasswordLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protectAdmin, getMe);
router.put('/change-password', protectAdmin, changePassword);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
