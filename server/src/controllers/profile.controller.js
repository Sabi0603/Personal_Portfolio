import Profile from '../models/Profile.js';
import Resume from '../models/Resume.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get public profile data
// @route   GET /api/profile
export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne().select('-__v');
  if (profile) {
    const activeResume = await Resume.findOne({ isActive: true });
    if (activeResume) {
      profile.resume = {
        url: activeResume.url,
        publicId: activeResume.publicId,
        fileName: activeResume.fileName,
      };
    }
  }
  return sendSuccess(res, 'Profile fetched successfully', profile || null);
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne().select('-__v');
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
    resume,
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
      resume,
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

// @desc    View profile resume inline in browser
// @route   GET /api/profile/resume/view
export const viewResume = asyncHandler(async (req, res) => {
  let resumeUrl = '';
  let fileName = 'Sabari-M-Resume.pdf';

  const activeResume = await Resume.findOne({ isActive: true });
  if (activeResume && activeResume.url) {
    resumeUrl = activeResume.url;
    fileName = activeResume.fileName || fileName;
  } else {
    const profile = await Profile.findOne().select('resume fullName');
    if (profile && profile.resume && profile.resume.url) {
      resumeUrl = profile.resume.url;
      fileName = profile.resume.fileName || fileName;
    }
  }

  if (!resumeUrl) {
    return sendError(res, 'No resume document is currently uploaded.', 404);
  }

  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  try {
    const upstreamRes = await fetch(resumeUrl);
    if (!upstreamRes.ok) {
      return sendError(res, 'Failed to retrieve resume from storage.', upstreamRes.status);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return sendError(res, `Failed to stream resume: ${error.message}`, 500);
  }
});

// @desc    Download profile resume as PDF
// @route   GET /api/profile/resume/download
export const downloadResume = asyncHandler(async (req, res) => {
  let resumeUrl = '';
  let fileName = 'Sabari-M-Resume.pdf';

  const activeResume = await Resume.findOne({ isActive: true });
  if (activeResume && activeResume.url) {
    resumeUrl = activeResume.url;
    fileName = activeResume.fileName || fileName;
  } else {
    const profile = await Profile.findOne().select('resume fullName');
    if (profile && profile.resume && profile.resume.url) {
      resumeUrl = profile.resume.url;
      fileName = profile.resume.fileName || fileName;
    }
  }

  if (!resumeUrl) {
    return sendError(res, 'No resume document is currently uploaded.', 404);
  }

  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  try {
    const upstreamRes = await fetch(resumeUrl);
    if (!upstreamRes.ok) {
      return sendError(res, 'Failed to retrieve resume from storage.', upstreamRes.status);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return sendError(res, `Failed to stream resume: ${error.message}`, 500);
  }
});
