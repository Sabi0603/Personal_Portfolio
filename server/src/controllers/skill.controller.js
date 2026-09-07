import Skill from '../models/Skill.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get published skills for public portfolio
// @route   GET /api/skills
export const getPublicSkills = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isPublished: true };
  if (category && category.trim()) {
    filter.category = new RegExp(`^${category.trim()}$`, 'i');
  }

  const skills = await Skill.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .select('-__v');

  return sendSuccess(res, 'Skills fetched successfully', skills);
});

// @desc    Get all skills for admin (with optional search, category filter, and pagination)
// @route   GET /api/admin/skills
export const getAllSkillsAdmin = asyncHandler(async (req, res) => {
  const { search, category, page, limit } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  if (category && category.trim() && category !== 'All') {
    filter.category = new RegExp(`^${category.trim()}$`, 'i');
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum > 0 && limitNum > 0) {
    const skip = (pageNum - 1) * limitNum;
    const total = await Skill.countDocuments(filter);
    const skills = await Skill.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Admin skills fetched successfully', {
      items: skills,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  // Unpaginated fallback
  const skills = await Skill.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .select('-__v');

  return sendSuccess(res, 'Admin skills fetched successfully', skills);
});

// @desc    Get single skill by ID for admin
// @route   GET /api/admin/skills/:id
export const getSkillByIdAdmin = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).select('-__v');
  if (!skill) {
    return sendError(res, 'Skill not found', 404);
  }
  return sendSuccess(res, 'Skill fetched successfully', skill);
});

// @desc    Create new skill
// @route   POST /api/admin/skills
export const createSkill = asyncHandler(async (req, res) => {
  const { name, category, icon, proficiency, order, isPublished } = req.body;

  if (!name || !name.trim()) {
    return sendError(res, 'Skill name is required', 400);
  }

  const parsedProficiency = Number(proficiency);
  if (isNaN(parsedProficiency) || parsedProficiency < 0 || parsedProficiency > 100) {
    return sendError(res, 'Proficiency must be a number between 0 and 100', 400);
  }

  const skill = await Skill.create({
    name: name.trim(),
    category: category?.trim() || 'Frontend',
    icon: {
      url: icon?.url || (typeof icon === 'string' ? icon : ''),
      publicId: icon?.publicId || '',
    },
    proficiency: parsedProficiency,
    order: Number(order) || 0,
    isPublished: isPublished ?? true,
  });

  return sendSuccess(res, 'Skill created successfully', skill, 201);
});

// @desc    Update existing skill (STRICT: preserves _id, NEVER creates duplicate)
// @route   PUT /api/admin/skills/:id
export const updateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existingSkill = await Skill.findById(id);

  if (!existingSkill) {
    return sendError(res, 'Skill not found', 404);
  }

  const { name, category, icon, proficiency, order, isPublished } = req.body;

  if (name !== undefined) {
    if (!name || !name.trim()) {
      return sendError(res, 'Skill name cannot be empty', 400);
    }
    existingSkill.name = name.trim();
  }

  if (category !== undefined) {
    existingSkill.category = category.trim() || 'Frontend';
  }

  if (proficiency !== undefined) {
    const parsedProficiency = Number(proficiency);
    if (isNaN(parsedProficiency) || parsedProficiency < 0 || parsedProficiency > 100) {
      return sendError(res, 'Proficiency must be a number between 0 and 100', 400);
    }
    existingSkill.proficiency = parsedProficiency;
  }

  if (order !== undefined) {
    existingSkill.order = Number(order) || 0;
  }

  if (isPublished !== undefined) {
    existingSkill.isPublished = Boolean(isPublished);
  }

  if (icon !== undefined) {
    if (typeof icon === 'string') {
      existingSkill.icon = { url: icon.trim(), publicId: existingSkill.icon?.publicId || '' };
    } else if (icon && typeof icon === 'object') {
      existingSkill.icon = {
        url: icon.url !== undefined ? icon.url : (existingSkill.icon?.url || ''),
        publicId: icon.publicId !== undefined ? icon.publicId : (existingSkill.icon?.publicId || ''),
      };
    }
  }

  const updatedSkill = await existingSkill.save();
  return sendSuccess(res, 'Skill updated successfully', updatedSkill);
});

// @desc    Delete skill
// @route   DELETE /api/admin/skills/:id
export const deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const skill = await Skill.findByIdAndDelete(id);

  if (!skill) {
    return sendError(res, 'Skill not found', 404);
  }

  return sendSuccess(res, 'Skill deleted successfully', { id });
});

