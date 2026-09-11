import Resume from '../models/Resume.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to destroy Cloudinary assets across raw and image resource types
const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    const rawRes = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      invalidate: true,
    });
    if (rawRes.result === 'not found') {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
    }
  } catch (err) {
    console.error(`[Cloudinary Cleanup] Failed to destroy asset ${publicId}:`, err.message);
  }
};

// @desc    Get current active public resume
// @route   GET /api/resume
export const getPublicResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ isActive: true }).select('-__v');

  if (resume) {
    return sendSuccess(res, 'Active resume fetched successfully', resume);
  }

  return sendSuccess(res, 'No active resume found', null);
});

// @desc    View active public resume inline (or by ID)
// @route   GET /api/resume/view
export const viewPublicResume = asyncHandler(async (req, res) => {
  let resumeUrl = '';
  let fileName = 'Sabari-M-Resume.pdf';

  const resumeId = req.query.id;
  let resume = null;
  if (resumeId) {
    resume = await Resume.findById(resumeId);
  } else {
    resume = await Resume.findOne({ isActive: true });
  }

  if (resume && resume.url) {
    resumeUrl = resume.url;
    fileName = resume.fileName || fileName;
  }

  if (!resumeUrl) {
    return sendError(res, 'No resume document is currently uploaded or active.', 404);
  }

  // Ensure fileName ends with .pdf
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  try {
    const upstreamRes = await fetch(resumeUrl);
    if (!upstreamRes.ok) {
      return sendError(res, 'Failed to retrieve resume from cloud storage.', upstreamRes.status);
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

// @desc    Download active public resume (or by ID)
// @route   GET /api/resume/download
export const downloadPublicResume = asyncHandler(async (req, res) => {
  let resumeUrl = '';
  let fileName = 'Sabari-M-Resume.pdf';

  const resumeId = req.query.id;
  let resume = null;
  if (resumeId) {
    resume = await Resume.findById(resumeId);
  } else {
    resume = await Resume.findOne({ isActive: true });
  }

  if (resume && resume.url) {
    resumeUrl = resume.url;
    fileName = resume.fileName || fileName;
  }

  if (!resumeUrl) {
    return sendError(res, 'No resume document is currently uploaded or active.', 404);
  }

  // Ensure fileName ends with .pdf
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  try {
    const upstreamRes = await fetch(resumeUrl);
    if (!upstreamRes.ok) {
      return sendError(res, 'Failed to retrieve resume from cloud storage.', upstreamRes.status);
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

// @desc    Get all resumes for admin
// @route   GET /api/admin/resumes
export const getAllResumesAdmin = asyncHandler(async (req, res) => {
  const resumes = await Resume.find().sort({ isActive: -1, createdAt: -1 }).select('-__v');
  return sendSuccess(res, 'Resumes fetched successfully', resumes);
});

// @desc    Get resume by ID for admin
// @route   GET /api/admin/resumes/:id
export const getResumeByIdAdmin = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id).select('-__v');
  if (!resume) {
    return sendError(res, 'Resume not found', 404);
  }
  return sendSuccess(res, 'Resume fetched successfully', resume);
});

// @desc    Create/Upload new resume
// @route   POST /api/admin/resumes
export const createResumeAdmin = asyncHandler(async (req, res) => {
  const { title, fileName, url, publicId, format, bytes, isActive } = req.body;

  if (!fileName || !url) {
    return sendError(res, 'File name and URL are required to create a resume record.', 400);
  }

  // Resume must be a PDF
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  if (format && format.toLowerCase() !== 'pdf' && ext !== '.pdf') {
    return sendError(res, 'Only PDF documents are allowed for resume.', 400);
  }

  const shouldBeActive = isActive !== false; // default true if not specified

  if (shouldBeActive) {
    // Only one resume can be active
    await Resume.updateMany({}, { isActive: false });
  }

  const resume = await Resume.create({
    title: (title || '').trim() || fileName,
    fileName: fileName.trim(),
    url: url.trim(),
    publicId: (publicId || '').trim(),
    format: 'pdf',
    bytes: Number(bytes) || 0,
    isActive: shouldBeActive,
  });

  return sendSuccess(res, 'Resume created successfully', resume, 201);
});

// @desc    Update resume details or status
// @route   PUT /api/admin/resumes/:id
export const updateResumeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, isActive } = req.body;

  const resume = await Resume.findById(id);
  if (!resume) {
    return sendError(res, 'Resume not found', 404);
  }

  if (title !== undefined) {
    resume.title = title.trim();
  }

  if (typeof isActive === 'boolean') {
    if (isActive) {
      // Deactivate all others
      await Resume.updateMany({ _id: { $ne: id } }, { isActive: false });
      resume.isActive = true;
    } else {
      resume.isActive = false;
    }
  }

  await resume.save();
  return sendSuccess(res, 'Resume updated successfully', resume);
});

// @desc    Set specific resume as active
// @route   PATCH /api/admin/resumes/:id/activate
export const setActiveResumeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resume = await Resume.findById(id);
  if (!resume) {
    return sendError(res, 'Resume not found', 404);
  }

  // Deactivate all others
  await Resume.updateMany({ _id: { $ne: id } }, { isActive: false });

  resume.isActive = true;
  await resume.save();

  return sendSuccess(res, `Resume "${resume.title || resume.fileName}" is now active`, resume);
});

// @desc    Delete resume and clean up Cloudinary
// @route   DELETE /api/admin/resumes/:id
export const deleteResumeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resume = await Resume.findById(id);
  if (!resume) {
    return sendError(res, 'Resume not found', 404);
  }

  // Clean up Cloudinary asset
  if (resume.publicId) {
    await destroyCloudinaryAsset(resume.publicId);
  }

  await Resume.findByIdAndDelete(id);

  return sendSuccess(res, 'Resume deleted successfully', { id });
});

