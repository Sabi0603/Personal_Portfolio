import Experience from '../models/Experience.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get public experiences
// @route   GET /api/experience
export const getPublicExperience = asyncHandler(async (req, res) => {
  const experiences = await Experience.find().sort({ order: 1, startDate: -1 }).select('-__v');
  return sendSuccess(res, 'Experiences fetched successfully', experiences);
});

// @desc    Get all experiences for admin (supports optional pagination and search)
// @route   GET /api/admin/experience
export const getAllExperienceAdmin = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { company: { $regex: search.trim(), $options: 'i' } },
      { location: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum > 0 && limitNum > 0) {
    const total = await Experience.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;
    const experiences = await Experience.find(filter)
      .sort({ order: 1, startDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Admin experiences fetched successfully', {
      items: experiences,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  const experiences = await Experience.find(filter).sort({ order: 1, startDate: -1 }).select('-__v');
  return sendSuccess(res, 'Admin experiences fetched successfully', experiences);
});

// @desc    Get experience by ID
// @route   GET /api/admin/experience/:id
export const getExperienceByIdAdmin = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id).select('-__v');
  if (!experience) {
    return sendError(res, 'Experience entry not found', 404);
  }
  return sendSuccess(res, 'Experience fetched successfully', experience);
});

// @desc    Create experience
// @route   POST /api/admin/experience
export const createExperience = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    location,
    employmentType,
    startDate,
    endDate,
    isCurrent,
    description,
    techStack,
    companyUrl,
    order,
  } = req.body;

  if (!title || !company || !startDate) {
    return sendError(res, 'Please provide title, company, and startDate', 400);
  }

  const experience = await Experience.create({
    title,
    company,
    location,
    employmentType,
    startDate,
    endDate: isCurrent ? null : endDate,
    isCurrent: isCurrent ?? false,
    description,
    techStack,
    companyUrl,
    order: order ?? 0,
  });

  return sendSuccess(res, 'Experience created successfully', experience, 201);
});

// @desc    Update experience
// @route   PUT /api/admin/experience/:id
export const updateExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const experience = await Experience.findById(id);

  if (!experience) {
    return sendError(res, 'Experience entry not found', 404);
  }

  if (req.body.isCurrent) {
    req.body.endDate = null;
  }

  const updated = await Experience.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 'Experience updated successfully', updated);
});

// @desc    Delete experience
// @route   DELETE /api/admin/experience/:id
export const deleteExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const experience = await Experience.findByIdAndDelete(id);

  if (!experience) {
    return sendError(res, 'Experience entry not found', 404);
  }

  return sendSuccess(res, 'Experience deleted successfully', { id });
});
