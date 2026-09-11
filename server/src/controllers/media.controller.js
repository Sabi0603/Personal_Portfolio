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

  // Cloudinary officially supports PDF documents as image assets (resource_type: 'image'),
  // allowing inline delivery and proper PDF content type.
  const resourceType = 'image';

  // Configure Cloudinary upload options
  const uploadOptions = {
    folder: destinationFolder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
  };

  if (isPdf) {
    uploadOptions.format = 'pdf';
  }

  // Optimization options for raster images (skip for vector SVG and PDF)
  if (!isPdf && !isSvg) {
    uploadOptions.transformation = [
      { quality: 'auto', fetch_format: 'auto' },
    ];
  }

  // Helper to stream in-memory buffer to Cloudinary
  const uploadToCloudinary = (options) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, uploadResult) => {
          if (error) {
            return reject(error);
          }
          resolve(uploadResult);
        }
      );
      uploadStream.end(req.file.buffer);
    });
  };

  let result = await uploadToCloudinary(uploadOptions);

  // If a PDF was uploaded as image, verify if Cloudinary account allows direct PDF image delivery.
  // If the Cloudinary account restricts PDF image delivery ('deny or ACL failure'),
  // fallback safely to 'raw' so certificate storage and delivery never break.
  if (isPdf && result.secure_url) {
    try {
      const checkRes = await fetch(result.secure_url, { method: 'HEAD' });
      if (checkRes.status === 401) {
        await cloudinary.uploader.destroy(result.public_id, { resource_type: 'image' }).catch(() => {});
        result = await uploadToCloudinary({
          folder: destinationFolder,
          resource_type: 'raw',
          use_filename: true,
          unique_filename: true,
        });
      }
    } catch {
      // Proceed with current result if verification check encounters connection issue
    }
  }

  // Generate first-page image preview for PDF documents
  let previewUrl = '';
  if (isPdf) {
    if (result.resource_type === 'image' && result.public_id) {
      previewUrl = cloudinary.url(result.public_id, {
        resource_type: 'image',
        page: 1,
        format: 'jpg',
        secure: true,
      });
    } else if (result.secure_url) {
      try {
        const thumbRes = await cloudinary.uploader.upload(result.secure_url, {
          folder: `${destinationFolder}/previews`,
          resource_type: 'image',
          format: 'jpg',
          page: 1,
        });
        previewUrl = thumbRes.secure_url || thumbRes.url;
      } catch (err) {
        console.warn('[mediaController] Failed to generate PDF preview thumbnail:', err.message);
      }
    }
  }

  return sendSuccess(
    res,
    'Media uploaded successfully',
    {
      url: result.secure_url || result.url,
      previewUrl,
      publicId: result.public_id,
      fileName: req.file.originalname,
      format: result.format || (isPdf ? 'pdf' : ''),
      fileType: isPdf ? 'pdf' : 'image',
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
