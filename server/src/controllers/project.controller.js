import Project from '../models/Project.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get published projects for public portfolio
// @desc    Get published projects for public portfolio (supports optional pagination)
// @route   GET /api/projects
export const getPublicProjects = asyncHandler(async (req, res) => {
  const pageNum = parseInt(req.query.page, 10);
  const limitNum = parseInt(req.query.limit, 10);
  const filter = { isPublished: true };

  if (pageNum > 0 && limitNum > 0) {
    const total = await Project.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;
    const projects = await Project.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Projects fetched successfully', {
      items: projects,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  const projects = await Project.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .select('-__v');
  return sendSuccess(res, 'Projects fetched successfully', projects);
});

// @desc    Get single project by slug
// @route   GET /api/projects/:slug
export const getPublicProjectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const project = await Project.findOne({ slug, isPublished: true }).select('-__v');

  if (!project) {
    return sendError(res, `Project with slug "${slug}" not found`, 404);
  }

  return sendSuccess(res, 'Project fetched successfully', project);
});

// @desc    Get all projects for admin
// @desc    Get all projects for admin (supports optional pagination and search)
// @route   GET /api/admin/projects
export const getAllProjectsAdmin = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { summary: { $regex: search.trim(), $options: 'i' } },
      { techStack: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum > 0 && limitNum > 0) {
    const total = await Project.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;
    const projects = await Project.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    return sendSuccess(res, 'Admin projects fetched successfully', {
      items: projects,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  }

  const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 }).select('-__v');
  return sendSuccess(res, 'Admin projects fetched successfully', projects);
});

// @desc    Get single project by ID for admin
// @route   GET /api/admin/projects/:id
export const getProjectByIdAdmin = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).select('-__v');
  if (!project) {
    return sendError(res, 'Project not found', 404);
  }
  return sendSuccess(res, 'Project fetched successfully', project);
});

// @desc    Create new project
// @route   POST /api/admin/projects
export const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    summary,
    description,
    problem,
    solution,
    thumbnail,
    screenshots,
    techStack,
    demoUrl,
    githubUrl,
    featured,
    isPublished,
    order,
  } = req.body;

  if (!title || !slug || !summary || !description) {
    return sendError(res, 'Please provide title, slug, summary, and description', 400);
  }

  const cleanSlug = slug.toLowerCase().trim();
  const existingProject = await Project.findOne({ slug: cleanSlug });
  if (existingProject) {
    return sendError(res, `A project with slug "${cleanSlug}" already exists`, 409);
  }

  const project = await Project.create({
    title,
    slug: cleanSlug,
    summary,
    description,
    problem: problem ? problem.trim() : '',
    solution: solution ? solution.trim() : '',
    thumbnail,
    screenshots,
    techStack,
    demoUrl,
    githubUrl,
    featured: featured ?? false,
    isPublished: isPublished ?? true,
    order: order ?? 0,
  });

  return sendSuccess(res, 'Project created successfully', project, 201);
});

// @desc    Update project
// @route   PUT /api/admin/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  if (req.body.slug && req.body.slug.toLowerCase().trim() !== project.slug) {
    const cleanSlug = req.body.slug.toLowerCase().trim();
    const existing = await Project.findOne({ slug: cleanSlug });
    if (existing && existing._id.toString() !== id) {
      return sendError(res, `A project with slug "${cleanSlug}" already exists`, 409);
    }
    req.body.slug = cleanSlug;
  }

  const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 'Project updated successfully', updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  return sendSuccess(res, 'Project deleted successfully', { id });
});
