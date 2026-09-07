import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';

// Strict rate limiter for Admin login attempts (brute-force defense)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many failed login attempts from this IP. Please try again after 15 minutes.',
      429
    );
  },
});

// Rate limiter for forgot password requests
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many password reset requests from this IP. Please try again after 15 minutes.',
      429
    );
  },
});
