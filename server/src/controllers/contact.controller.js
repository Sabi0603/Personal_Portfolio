import ContactMessage from '../models/ContactMessage.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  sendContactNotification,
  sendVisitorConfirmation,
} from '../services/email.service.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// @desc    Submit contact message from public portfolio
// @route   POST /api/contact
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return sendError(res, 'Please provide name, email, subject, and message', 400);
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return sendError(res, 'Please provide a valid email address', 400);
  }

  if (message.trim().length < 10) {
    return sendError(res, 'Message must be at least 10 characters long', 400);
  }

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const contact = await ContactMessage.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    ipAddress,
    userAgent,
  });

  // Safe non-blocking email dispatch (MongoDB save succeeds regardless of email outcome)
  Promise.allSettled([
    sendContactNotification({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
    }),
    sendVisitorConfirmation({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
    }),
  ]).catch((err) => {
    console.warn('[Email Warning] Background notification dispatch error:', err.message);
  });

  return sendSuccess(
    res,
    'Thank you! Your message has been received successfully.',
    { id: contact._id, createdAt: contact.createdAt },
    201
  );
});

// @desc    Get all contact messages for admin (supports optional pagination, filter, search)
// @route   GET /api/admin/messages
export const getAllMessagesAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isRead !== undefined && req.query.isRead !== '') {
    filter.isRead = req.query.isRead === 'true';
  }
  if (req.query.search && req.query.search.trim()) {
    const s = req.query.search.trim();
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { subject: { $regex: s, $options: 'i' } },
      { message: { $regex: s, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(req.query.page, 10);
  const limitNum = parseInt(req.query.limit, 10);
  const total = await ContactMessage.countDocuments(filter);
  const unreadCount = await ContactMessage.countDocuments({ isRead: false });

  let query = ContactMessage.find(filter).sort({ createdAt: -1 }).select('-__v');
  if (pageNum > 0 && limitNum > 0) {
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
  }

  const messages = await query;

  return sendSuccess(res, 'Messages fetched successfully', {
    messages,
    unreadCount,
    total,
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 ? limitNum : total,
    totalPages: limitNum > 0 ? Math.ceil(total / limitNum) || 1 : 1,
  });
});

// @desc    Get single contact message by ID
// @route   GET /api/admin/messages/:id
export const getMessageByIdAdmin = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id).select('-__v');
  if (!message) {
    return sendError(res, 'Message not found', 404);
  }
  return sendSuccess(res, 'Message fetched successfully', message);
});

// @desc    Mark contact message as read/unread
// @route   PATCH /api/admin/messages/:id/read
export const markMessageReadAdmin = asyncHandler(async (req, res) => {
  const { isRead } = req.body;
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: isRead ?? true },
    { new: true }
  );

  if (!message) {
    return sendError(res, 'Message not found', 404);
  }

  return sendSuccess(res, `Message marked as ${message.isRead ? 'read' : 'unread'}`, message);
});

// @desc    Record reply to contact message
// @route   PATCH /api/admin/messages/:id/reply
export const replyToMessageAdmin = asyncHandler(async (req, res) => {
  const { replyMessage } = req.body;
  if (!replyMessage || !replyMessage.trim()) {
    return sendError(res, 'Reply message cannot be empty', 400);
  }

  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    {
      replied: true,
      replyMessage: replyMessage.trim(),
      repliedAt: new Date(),
    },
    { new: true }
  );

  if (!message) {
    return sendError(res, 'Message not found', 404);
  }

  return sendSuccess(res, 'Reply recorded successfully', message);
});

// @desc    Delete contact message
// @route   DELETE /api/admin/messages/:id
export const deleteMessageAdmin = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) {
    return sendError(res, 'Message not found', 404);
  }

  return sendSuccess(res, 'Message deleted successfully', { id: req.params.id });
});
