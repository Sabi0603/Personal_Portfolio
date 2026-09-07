import transporter, { isEmailConfigured } from '../config/email.js';
import {
  getContactNotificationTemplate,
  getVisitorConfirmationTemplate,
  getPasswordResetTemplate,
} from '../utils/emailTemplates.js';

const getSender = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  return `"Sabari M Portfolio" <${emailUser}>`;
};

/**
 * 1. Dispatch contact inquiry notification to portfolio owner
 */
export const sendContactNotification = async ({ name, email, subject, message }) => {
  if (!isEmailConfigured() || !transporter) {
    console.warn('[Email] Skipping contact notification email: EMAIL_USER or EMAIL_PASS not configured.');
    return { success: false, error: 'Email service not configured.' };
  }

  try {
    const template = getContactNotificationTemplate({ name, email, subject, message });
    const ownerEmail = process.env.EMAIL_USER.trim();

    const info = await transporter.sendMail({
      from: getSender(),
      to: ownerEmail,
      replyTo: email.trim(),
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Error] Failed to send contact notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. Dispatch automatic confirmation receipt to visitor
 */
export const sendVisitorConfirmation = async ({ name, email, subject }) => {
  if (!isEmailConfigured() || !transporter) {
    console.warn('[Email] Skipping visitor confirmation email: EMAIL_USER or EMAIL_PASS not configured.');
    return { success: false, error: 'Email service not configured.' };
  }

  try {
    const template = getVisitorConfirmationTemplate({ name, subject });

    const info = await transporter.sendMail({
      from: getSender(),
      to: email.trim(),
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Error] Failed to send visitor confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 3. Dispatch password reset link to administrator
 */
export const sendPasswordResetEmail = async ({ toEmail, resetUrl, adminName }) => {
  if (!isEmailConfigured() || !transporter) {
    console.warn('[Email] Skipping password reset email: EMAIL_USER or EMAIL_PASS not configured.');
    return { success: false, error: 'Email service not configured.' };
  }

  try {
    const template = getPasswordResetTemplate({ adminName, resetUrl });

    const info = await transporter.sendMail({
      from: getSender(),
      to: toEmail.trim(),
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Error] Failed to send password reset email:', error.message);
    return { success: false, error: error.message };
  }
};
