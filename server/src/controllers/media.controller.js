import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ALLOWED_FOLDERS = {
  profile: 'sabari_portfolio/profile',
  projects: 'sabari_portfolio/projects',
  certifications: 'sabari_portfolio/certifications',
  resume: 'sabari_portfolio/resume',
  skills: 'sabari_portfolio/skills',
};

// @desc    Upload media asset to Cloudinary
// @route   POST /api/admin/media/upload
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return sendError(
      res,
      'Cloudinary is not configured on the server. Please provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.',
      500
    );
  }

  if (!req.file) {
    return sendError(res, 'No file received for upload.', 400);
  }

  // Determine destination folder
  const requestedFolder = (req.body.folder || req.query.folder || '').toLowerCase().trim();
  const ext = (req.file.originalname ? req.file.originalname.slice(req.file.originalname.lastIndexOf('.')) : '').toLowerCase();
  const isPdf = req.file.mimetype === 'application/pdf' || ext === '.pdf';
  const isSvg = req.file.mimetype === 'image/svg+xml' || ext === '.svg';

  let destinationFolder = ALLOWED_FOLDERS[requestedFolder];
  if (!destinationFolder) {
    destinationFolder = isPdf ? ALLOWED_FOLDERS.resume : ALLOWED_FOLDERS.projects;
  }

  const resourceType = isPdf ? 'raw' : 'image';

  // Configure Cloudinary upload options
  const uploadOptions = {
    folder: destinationFolder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
  };

  // Optimization options for raster images (skip for vector SVG and PDF)
  if (!isPdf && !isSvg) {
    uploadOptions.transformation = [
      { quality: 'auto', fetch_format: 'auto' },
    ];
  }

  // Stream in-memory buffer directly to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, uploadResult) => {
        if (error) {
          return reject(error);
        }
        resolve(uploadResult);
      }
    );

    // Directly pipe in-memory buffer to stream
    uploadStream.end(req.file.buffer);
  });

  return sendSuccess(
    res,
    'Media uploaded successfully',
    {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      format: result.format || (isPdf ? 'pdf' : ''),
      bytes: result.bytes,
      resourceType: result.resource_type,
    },
    201
  );
});

// @desc    Delete media asset from Cloudinary by public ID
// @route   DELETE /api/admin/media/:publicId(*) OR DELETE /api/admin/media
export const deleteMedia = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return sendError(
      res,
      'Cloudinary is not configured on the server. Cannot perform deletion.',
      500
    );
  }

  // Extract public ID from params (supports slashes), query, or body
  let publicId =
    req.params.publicId ||
    req.params[0] ||
    req.query.publicId ||
    req.body?.publicId;

  if (!publicId || !publicId.trim()) {
    return sendError(res, 'Public ID of the media asset is required.', 400);
  }

  publicId = decodeURIComponent(publicId.trim());

  // Try image first, fallback to raw if not found
  let destroyResult = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });

  if (destroyResult.result === 'not found') {
    destroyResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      invalidate: true,
    });
  }

  if (destroyResult.result !== 'ok' && destroyResult.result !== 'not found') {
    return sendError(res, `Failed to delete media asset: ${destroyResult.result}`, 400);
  }

  return sendSuccess(res, 'Media asset deleted successfully', {
    publicId,
    status: destroyResult.result,
  });
});
