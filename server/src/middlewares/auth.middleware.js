import Admin from '../models/Admin.js';
import { verifyToken } from '../utils/token.js';
import { sendError } from '../utils/apiResponse.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Access denied. Authentication token required.', 401);
  }

  try {
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return sendError(res, 'Access denied. Admin account no longer exists.', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    if (error.message && error.message.includes('JWT_SECRET')) {
      console.error('[Auth Error] Missing JWT_SECRET configuration:', error.message);
      return sendError(res, 'Internal server authentication configuration error.', 500);
    }
    return sendError(res, 'Invalid authentication token.', 401);
  }
};
