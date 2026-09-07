import Certification from '../models/Certification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get public certifications
// @route   GET /api/certifications
export const getPublicCertifications = asyncHandler(async (req, res) => {
  const certifications = await Certification.find()
    .sort({ order: 1, issueDate: -1 })
    .select('-__v');
  return sendSuccess(res, 'Certifications fetched successfully', certifications);
});

// @desc    Get all certifications for admin (supports optional pagination and search)
// @route   GET /api/admin/certifications
export const getAllCertificationsAdmin = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { issuer: { $regex: search.trim(), $options: 'i' } },
      { credentialId: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum > 0 && limitNum > 0) {
    const total = await Certification.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;
    const certifications = await Certification.find(filter)
      .sort({ order: 1, issueDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Admin certifications fetched successfully', {
      items: certifications,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  const certifications = await Certification.find(filter)
    .sort({ order: 1, issueDate: -1 })
    .select('-__v');
  return sendSuccess(res, 'Admin certifications fetched successfully', certifications);
});

// @desc    Get certification by ID
// @route   GET /api/admin/certifications/:id
export const getCertificationByIdAdmin = asyncHandler(async (req, res) => {
  const certification = await Certification.findById(req.params.id).select('-__v');
  if (!certification) {
    return sendError(res, 'Certification not found', 404);
  }
  return sendSuccess(res, 'Certification fetched successfully', certification);
});

// @desc    Create certification
// @route   POST /api/admin/certifications
export const createCertification = asyncHandler(async (req, res) => {
  const {
    title,
    issuer,
    issueDate,
    expiryDate,
    doesNotExpire,
    credentialId,
    credentialUrl,
    image,
    order,
  } = req.body;

  if (!title || !issuer || !issueDate) {
    return sendError(res, 'Please provide title, issuer, and issueDate', 400);
  }

  const certification = await Certification.create({
    title,
    issuer,
    issueDate,
    expiryDate: doesNotExpire ? null : expiryDate,
    doesNotExpire: doesNotExpire ?? true,
    credentialId,
    credentialUrl,
    image,
    order: order ?? 0,
  });

  return sendSuccess(res, 'Certification created successfully', certification, 201);
});

// @desc    Update certification
// @route   PUT /api/admin/certifications/:id
export const updateCertification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const certification = await Certification.findById(id);

  if (!certification) {
    return sendError(res, 'Certification not found', 404);
  }

  if (req.body.doesNotExpire) {
    req.body.expiryDate = null;
  }

  const updated = await Certification.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 'Certification updated successfully', updated);
});

// @desc    Delete certification
// @route   DELETE /api/admin/certifications/:id
export const deleteCertification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const certification = await Certification.findByIdAndDelete(id);

  if (!certification) {
    return sendError(res, 'Certification not found', 404);
  }

  return sendSuccess(res, 'Certification deleted successfully', { id });
});
