import SocialLink from '../models/SocialLink.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get visible social links for public
// @route   GET /api/social-links
export const getPublicSocialLinks = asyncHandler(async (req, res) => {
  const links = await SocialLink.find({ isVisible: true }).sort({ order: 1 }).select('-__v');
  return sendSuccess(res, 'Social links fetched successfully', links);
});

// @desc    Get all social links for admin (supports optional pagination and search)
// @route   GET /api/admin/social-links
export const getAllSocialLinksAdmin = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { platform: { $regex: search.trim(), $options: 'i' } },
      { url: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum > 0 && limitNum > 0) {
    const total = await SocialLink.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;
    const links = await SocialLink.find(filter)
      .sort({ order: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Admin social links fetched successfully', {
      items: links,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  const links = await SocialLink.find(filter).sort({ order: 1 }).select('-__v');
  return sendSuccess(res, 'Admin social links fetched successfully', links);
});

// @desc    Get social link by ID
// @route   GET /api/admin/social-links/:id
export const getSocialLinkByIdAdmin = asyncHandler(async (req, res) => {
  const link = await SocialLink.findById(req.params.id).select('-__v');
  if (!link) {
    return sendError(res, 'Social link not found', 404);
  }
  return sendSuccess(res, 'Social link fetched successfully', link);
});

// @desc    Create social link
// @route   POST /api/admin/social-links
export const createSocialLink = asyncHandler(async (req, res) => {
  const { platform, url, icon, isVisible, order } = req.body;

  if (!platform || !url) {
    return sendError(res, 'Please provide platform and url', 400);
  }

  const link = await SocialLink.create({
    platform,
    url,
    icon: icon || '',
    isVisible: isVisible ?? true,
    order: order ?? 0,
  });

  return sendSuccess(res, 'Social link created successfully', link, 201);
});

// @desc    Update social link
// @route   PUT /api/admin/social-links/:id
export const updateSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const link = await SocialLink.findById(id);

  if (!link) {
    return sendError(res, 'Social link not found', 404);
  }

  const updated = await SocialLink.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 'Social link updated successfully', updated);
});

// @desc    Delete social link
// @route   DELETE /api/admin/social-links/:id
export const deleteSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const link = await SocialLink.findByIdAndDelete(id);

  if (!link) {
    return sendError(res, 'Social link not found', 404);
  }

  return sendSuccess(res, 'Social link deleted successfully', { id });
});
