import Profile from '../models/Profile.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get public profile data
// @route   GET /api/profile
export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne().select('-__v');
  return sendSuccess(res, 'Profile fetched successfully', profile || null);
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne().select('-__v');
  return sendSuccess(res, 'Admin profile fetched successfully', profile || null);
});

// @desc    Update/Create profile
// @route   PUT /api/admin/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    title,
    shortBio,
    about,
    avatar,
    email,
    phone,
    location,
    availableForHire,
    yearsOfExperience,
    skills,
  } = req.body;

  if (!fullName || !title || !shortBio || !about || !email) {
    return sendError(res, 'Please provide fullName, title, shortBio, about, and email', 400);
  }

  const profile = await Profile.findOneAndUpdate(
    {},
    {
      fullName,
      title,
      shortBio,
      about,
      avatar,
      email,
      phone,
      location,
      availableForHire,
      yearsOfExperience,
      skills,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return sendSuccess(res, 'Profile updated successfully', profile);
});

