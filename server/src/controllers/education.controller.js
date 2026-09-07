import Education from '../models/Education.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get public education entries
// @route   GET /api/education
export const getPublicEducation = asyncHandler(async (req, res) => {
  const educations = await Education.find().sort({ order: 1, startDate: -1 }).select('-__v');
  return sendSuccess(res, 'Education entries fetched successfully', educations);
});

// @desc    Get all education for admin (supports optional pagination and search)
// @route   GET /api/admin/education
export const getAllEducationAdmin = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { institution: { $regex: search.trim(), $options: 'i' } },
      { degree: { $regex: search.trim(), $options: 'i' } },
      { fieldOfStudy: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum > 0 && limitNum > 0) {
    const total = await Education.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;
    const educations = await Education.find(filter)
      .sort({ order: 1, startDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Admin education entries fetched successfully', {
      items: educations,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  const educations = await Education.find(filter).sort({ order: 1, startDate: -1 }).select('-__v');
  return sendSuccess(res, 'Admin education entries fetched successfully', educations);
});

// @desc    Get education by ID
// @route   GET /api/admin/education/:id
export const getEducationByIdAdmin = asyncHandler(async (req, res) => {
  const education = await Education.findById(req.params.id).select('-__v');
  if (!education) {
    return sendError(res, 'Education entry not found', 404);
  }
  return sendSuccess(res, 'Education fetched successfully', education);
});

// @desc    Create education entry
// @route   POST /api/admin/education
export const createEducation = asyncHandler(async (req, res) => {
  const {
    institution,
    degree,
    fieldOfStudy,
    location,
    startDate,
    endDate,
    isCurrent,
    grade,
    description,
    order,
  } = req.body;

  if (!institution || !degree || !fieldOfStudy || !startDate) {
    return sendError(res, 'Please provide institution, degree, fieldOfStudy, and startDate', 400);
  }

  const education = await Education.create({
    institution,
    degree,
    fieldOfStudy,
    location,
    startDate,
    endDate: isCurrent ? null : endDate,
    isCurrent: isCurrent ?? false,
    grade,
    description,
    order: order ?? 0,
  });

  return sendSuccess(res, 'Education entry created successfully', education, 201);
});

// @desc    Update education entry
// @route   PUT /api/admin/education/:id
export const updateEducation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const education = await Education.findById(id);

  if (!education) {
    return sendError(res, 'Education entry not found', 404);
  }

  if (req.body.isCurrent) {
    req.body.endDate = null;
  }

  const updated = await Education.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 'Education entry updated successfully', updated);
});

// @desc    Delete education entry
// @route   DELETE /api/admin/education/:id
export const deleteEducation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const education = await Education.findByIdAndDelete(id);

  if (!education) {
    return sendError(res, 'Education entry not found', 404);
  }

  return sendSuccess(res, 'Education entry deleted successfully', { id });
});
