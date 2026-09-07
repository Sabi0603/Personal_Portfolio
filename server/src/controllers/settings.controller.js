import SiteSettings from '../models/SiteSettings.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get public site settings
// @route   GET /api/settings
export const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne().select(
    'siteTitle siteDescription keywords author enableContactForm maintenanceMode ogImage -_id'
  );

  if (!settings) {
    settings = {
      siteTitle: 'Sabari M | MERN Stack Developer',
      siteDescription: 'Production-ready full-stack portfolio of Sabari M.',
      keywords: ['MERN Stack', 'React', 'Node.js', 'MongoDB', 'Express', 'Portfolio'],
      author: 'Sabari M',
      enableContactForm: true,
      maintenanceMode: false,
    };
  }

  return sendSuccess(res, 'Settings fetched successfully', settings);
});

// @desc    Get admin settings
// @route   GET /api/admin/settings
export const getAdminSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne().select('-__v');
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return sendSuccess(res, 'Admin settings fetched successfully', settings);
});

// @desc    Update admin settings
// @route   PUT /api/admin/settings
export const updateAdminSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  return sendSuccess(res, 'Settings updated successfully', settings);
});
