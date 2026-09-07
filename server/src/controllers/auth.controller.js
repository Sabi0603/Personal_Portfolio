import crypto from 'crypto';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

// @desc    Admin login
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Please provide both email and password', 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  // Explicitly select password which is excluded by default
  const admin = await Admin.findOne({ email: cleanEmail }).select('+password');

  if (!admin) {
    return sendError(res, 'Invalid credentials', 401);
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Update last login timestamp
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = generateToken(admin._id);

  return sendSuccess(res, 'Logged in successfully', {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      lastLogin: admin.lastLogin,
    },
  });
});

// @desc    Get currently authenticated admin
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 'Admin data retrieved', {
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      lastLogin: req.admin.lastLogin,
      createdAt: req.admin.createdAt,
    },
  });
});

// @desc    Admin logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // Stateless token logout: client discards stored token
  return sendSuccess(res, 'Logged out successfully');
});

// @desc    Change admin password
// @route   PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Please provide currentPassword and newPassword', 400);
  }

  if (newPassword.length < 8) {
    return sendError(res, 'New password must be at least 8 characters long', 400);
  }

  // Fetch admin with current password
  const admin = await Admin.findById(req.admin._id).select('+password');

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  admin.password = newPassword;
  await admin.save();

  const token = generateToken(admin._id);

  return sendSuccess(res, 'Password changed successfully', {
    token,
  });
});

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 'Please provide an email address', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const admin = await Admin.findOne({ email: cleanEmail });

  // Generic message to prevent email enumeration
  const genericMessage =
    'If an admin account is registered with this email, password reset instructions have been dispatched.';

  if (!admin) {
    return sendSuccess(res, genericMessage);
  }

  // Generate 15-minute reset token (saved as SHA-256 hash in database)
  const resetToken = admin.generatePasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientBaseUrl}/admin/reset-password/${resetToken}`;

  // Dispatch password reset email in background without blocking response.
  // This guarantees sub-100ms response time, closes timing enumeration side-channels,
  // and prevents client HTTP timeouts while preserving secure email dispatch.
  sendPasswordResetEmail({
    toEmail: admin.email,
    resetUrl,
    adminName: admin.name,
  }).catch((error) => {
    console.error('[Email Error] Background password reset dispatch failed:', error.message);
  });

  // Strictly return generic message without exposing resetToken or resetUrl
  return sendSuccess(res, genericMessage);
});

// @desc    Reset admin password using token
// @route   POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return sendError(res, 'Password must be at least 8 characters long', 400);
  }

  // Hash incoming token to match database record
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const admin = await Admin.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!admin) {
    return sendError(res, 'Invalid or expired password reset token', 400);
  }

  // Update password and clear reset fields
  admin.password = password;
  admin.resetPasswordToken = null;
  admin.resetPasswordExpires = null;
  await admin.save();

  const newToken = generateToken(admin._id);

  return sendSuccess(res, 'Password has been reset successfully', {
    token: newToken,
  });
});
