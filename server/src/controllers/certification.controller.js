import Certification from '../models/Certification.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to clean up media asset from Cloudinary
const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    if (result.result === 'not found') {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        invalidate: true,
      });
    }
  } catch (err) {
    console.error(`[Certification Cleanup] Failed to destroy asset ${publicId}:`, err.message);
  }
};

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

  const certificationData = {
    title,
    issuer,
    issueDate,
    expiryDate: doesNotExpire ? null : expiryDate,
    doesNotExpire: doesNotExpire ?? true,
    credentialId,
    credentialUrl,
    image,
    order: order ?? 0,
  };

  if (isPdfCertification(certificationData) && !certificationData.image?.previewUrl && isCloudinaryConfigured()) {
    try {
      if (certificationData.image.url.includes('/image/upload/') && certificationData.image.publicId) {
        certificationData.image.previewUrl = cloudinary.url(certificationData.image.publicId, {
          resource_type: 'image',
          page: 1,
          format: 'jpg',
          secure: true,
        });
      } else {
        const thumbRes = await cloudinary.uploader.upload(certificationData.image.url, {
          folder: 'sabari_portfolio/certifications/previews',
          resource_type: 'image',
          format: 'jpg',
          page: 1,
        });
        certificationData.image.previewUrl = thumbRes.secure_url || thumbRes.url;
      }
    } catch (err) {
      console.warn('[CreateCert] Preview thumbnail generation skipped:', err.message);
    }
  }

  const certification = await Certification.create(certificationData);

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

  // If a new media asset is provided, clean up the previous asset in Cloudinary
  const oldPublicId = certification.image?.publicId;
  const newPublicId = req.body.image?.publicId;

  if (oldPublicId && newPublicId && oldPublicId !== newPublicId) {
    await destroyCloudinaryAsset(oldPublicId);
  } else if (oldPublicId && req.body.image === null) {
    await destroyCloudinaryAsset(oldPublicId);
  }

  if (req.body.image && isPdfCertification(req.body) && !req.body.image.previewUrl && isCloudinaryConfigured()) {
    try {
      if (req.body.image.url.includes('/image/upload/') && req.body.image.publicId) {
        req.body.image.previewUrl = cloudinary.url(req.body.image.publicId, {
          resource_type: 'image',
          page: 1,
          format: 'jpg',
          secure: true,
        });
      } else {
        const thumbRes = await cloudinary.uploader.upload(req.body.image.url, {
          folder: 'sabari_portfolio/certifications/previews',
          resource_type: 'image',
          format: 'jpg',
          page: 1,
        });
        req.body.image.previewUrl = thumbRes.secure_url || thumbRes.url;
      }
    } catch (err) {
      console.warn('[UpdateCert] Preview thumbnail generation skipped:', err.message);
    }
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
  const certification = await Certification.findById(id);

  if (!certification) {
    return sendError(res, 'Certification not found', 404);
  }

  // Clean up associated media asset in Cloudinary
  if (certification.image?.publicId) {
    await destroyCloudinaryAsset(certification.image.publicId);
  }

  await Certification.findByIdAndDelete(id);

  return sendSuccess(res, 'Certification deleted successfully', { id });
});

// Generic helper to verify if a certification has a PDF document
export const isPdfCertification = (certification) => {
  if (!certification?.image?.url) return false;
  if (certification.image?.fileType === 'pdf') return true;
  const url = certification.image.url.toLowerCase();
  const fileName = (certification.image.fileName || '').toLowerCase();
  return (
    url.endsWith('.pdf') ||
    url.includes('.pdf?') ||
    url.includes('/raw/upload/') ||
    fileName.endsWith('.pdf')
  );
};

// @desc    View certification PDF inline in browser
// @route   GET /api/certifications/:id/view
export const viewCertification = asyncHandler(async (req, res) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    return sendError(res, 'Certification not found', 404);
  }

  if (!certification.image?.url) {
    return sendError(res, 'No document or file attached to this certification.', 404);
  }

  if (!isPdfCertification(certification)) {
    return sendError(res, 'The requested certification document is not a PDF.', 400);
  }

  let fileName = certification.image?.fileName || `${certification.title || 'Certification'}.pdf`;
  fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-').trim();
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  try {
    const upstreamRes = await fetch(certification.image.url);
    if (!upstreamRes.ok) {
      return sendError(
        res,
        'Failed to retrieve certification PDF from cloud storage.',
        upstreamRes.status
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return sendError(res, `Failed to stream certification PDF: ${error.message}`, 500);
  }
});

// @desc    Download certification PDF as attachment
// @route   GET /api/certifications/:id/download
export const downloadCertification = asyncHandler(async (req, res) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    return sendError(res, 'Certification not found', 404);
  }

  if (!certification.image?.url) {
    return sendError(res, 'No document or file attached to this certification.', 404);
  }

  if (!isPdfCertification(certification)) {
    return sendError(res, 'The requested certification document is not a PDF.', 400);
  }

  let fileName = certification.image?.fileName || `${certification.title || 'Certification'}.pdf`;
  fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-').trim();
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  try {
    const upstreamRes = await fetch(certification.image.url);
    if (!upstreamRes.ok) {
      return sendError(
        res,
        'Failed to retrieve certification PDF from cloud storage.',
        upstreamRes.status
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return sendError(res, `Failed to stream certification PDF: ${error.message}`, 500);
  }
});

// Generic helper to ensure a certification has a preview URL
export const ensureCertificationPreview = async (cert) => {
  if (!cert || !isPdfCertification(cert) || cert.image?.previewUrl) {
    return cert?.image?.previewUrl || '';
  }

  const { url, publicId } = cert.image;
  let previewUrl = '';

  try {
    if (url.includes('/image/upload/') && publicId) {
      previewUrl = cloudinary.url(publicId, {
        resource_type: 'image',
        page: 1,
        format: 'jpg',
        secure: true,
      });
    } else if (isCloudinaryConfigured()) {
      const uploadRes = await cloudinary.uploader.upload(url, {
        folder: 'sabari_portfolio/certifications/previews',
        resource_type: 'image',
        format: 'jpg',
        page: 1,
      });
      previewUrl = uploadRes.secure_url || uploadRes.url;
    }

    if (previewUrl) {
      cert.image.previewUrl = previewUrl;
      await Certification.findByIdAndUpdate(cert._id, { 'image.previewUrl': previewUrl });
    }
  } catch (err) {
    console.warn(`[Cert Preview] Failed to generate preview for ${cert._id}:`, err.message);
  }

  return previewUrl;
};

// @desc    Get certificate visual preview image
// @route   GET /api/certifications/:id/preview
export const getCertificationPreview = asyncHandler(async (req, res) => {
  const cert = await Certification.findById(req.params.id);
  if (!cert) {
    return sendError(res, 'Certification not found', 404);
  }

  if (!cert.image?.url) {
    return sendError(res, 'No document or file attached to this certification.', 404);
  }

  // For non-PDF certificates, redirect directly to the original image URL
  if (!isPdfCertification(cert)) {
    return res.redirect(cert.image.url);
  }

  // If previewUrl is already populated, redirect to it
  if (cert.image.previewUrl) {
    return res.redirect(cert.image.previewUrl);
  }

  // Otherwise generate on the fly and redirect
  const preview = await ensureCertificationPreview(cert);
  if (preview) {
    return res.redirect(preview);
  }

  return res.redirect(cert.image.url);
});

