/**
 * Utility to escape all HTML characters in user-supplied strings to prevent HTML injection / XSS.
 */
export const escapeHtml = (unsafeStr) => {
  if (typeof unsafeStr !== 'string') return '';
  return unsafeStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * 1. Contact Form Notification (Sent to Portfolio Owner Sabari M)
 */
export const getContactNotificationTemplate = ({ name, email, subject, message }) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const timestamp = new Date().toUTCString();

  const emailSubject = `[Portfolio Inbound] ${safeSubject} - from ${safeName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0b0f19; color: #e2e8f0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    .header { padding: 24px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 24px; }
    .meta-box { background-color: #1e293b; border-left: 4px solid #06b6d4; padding: 16px; border-radius: 4px; margin-bottom: 20px; }
    .meta-row { margin-bottom: 8px; font-size: 14px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { font-weight: 600; color: #94a3b8; width: 80px; display: inline-block; }
    .meta-value { color: #f1f5f9; }
    .message-box { background-color: #0f172a; border: 1px solid #334155; padding: 18px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #f8fafc; white-space: normal; word-break: break-word; }
    .footer { padding: 16px 24px; background-color: #0b0f19; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Visitor Inquiry</h1>
      <p>Received via Sabari M Portfolio Contact Form</p>
    </div>
    <div class="content">
      <div class="meta-box">
        <div class="meta-row"><span class="meta-label">Sender:</span> <span class="meta-value">${safeName}</span></div>
        <div class="meta-row"><span class="meta-label">Email:</span> <span class="meta-value"><a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: none;">${safeEmail}</a></span></div>
        <div class="meta-row"><span class="meta-label">Subject:</span> <span class="meta-value">${safeSubject}</span></div>
        <div class="meta-row"><span class="meta-label">Time:</span> <span class="meta-value">${timestamp}</span></div>
      </div>
      <h3 style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Message Content:</h3>
      <div class="message-box">
        ${safeMessage}
      </div>
    </div>
    <div class="footer">
      Sabari M Portfolio System &bull; Direct reply will address ${safeEmail}
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
New Visitor Inquiry - Sabari M Portfolio
---------------------------------------
Sender:  ${name}
Email:   ${email}
Subject: ${subject}
Time:    ${timestamp}

Message:
${message}
  `.trim();

  return { subject: emailSubject, html, text };
};

/**
 * 2. Visitor Confirmation (Sent to the visitor)
 */
export const getVisitorConfirmationTemplate = ({ name, subject }) => {
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);

  const emailSubject = `Message Received - Sabari M Portfolio`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { padding: 32px 28px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; font-family: monospace; }
    .logo span { color: #06b6d4; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 500; color: #cbd5e1; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #334155; }
    .highlight-card { background-color: #f1f5f9; border-radius: 6px; padding: 16px; margin: 20px 0; border-left: 4px solid #06b6d4; font-size: 14px; }
    .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">&lt;<span>Sabari M</span> /&gt;</div>
      <h1>Thank You for Reaching Out</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${safeName}</strong>,</p>
      <p>This is an automated confirmation to let you know that your message regarding <em>"${safeSubject}"</em> has been received successfully.</p>
      <div class="highlight-card">
        <strong>Status:</strong> Successfully delivered to inbox.<br/>
        Sabari M will review your inquiry and follow up with you directly.
      </div>
      <p>In the meantime, feel free to explore my latest projects and technical work on the portfolio.</p>
      <p style="margin-top: 28px;">Best regards,<br/><strong>Sabari M</strong><br/><span style="color: #64748b; font-size: 13px;">MERN Stack Developer</span></p>
    </div>
    <div class="footer">
      This is an automated message acknowledging receipt of your contact form submission.
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hello ${name},

Thank you for reaching out!

This is an automated confirmation that your message regarding "${subject}" has been received. Sabari M will review your inquiry and follow up with you directly.

Best regards,
Sabari M
MERN Stack Developer
  `.trim();

  return { subject: emailSubject, html, text };
};

/**
 * 3. Password Reset Email (Sent to Admin)
 */
export const getPasswordResetTemplate = ({ adminName, resetUrl }) => {
  const safeName = escapeHtml(adminName || 'Admin');
  // resetUrl is generated programmatically on the server
  const safeUrl = escapeHtml(resetUrl);

  const emailSubject = `Security Alert: Admin Password Reset Request`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0b0f19; color: #e2e8f0; }
    .container { max-width: 580px; margin: 30px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    .header { padding: 28px; background: #0f172a; border-bottom: 2px solid #8b5cf6; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #f1f5f9; }
    .content { padding: 28px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px; }
    .notice-box { background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 6px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #c7d2fe; }
    .url-fallback { word-break: break-all; font-family: monospace; font-size: 12px; color: #94a3b8; background-color: #0b0f19; padding: 12px; border-radius: 4px; border: 1px solid #1e293b; margin-top: 12px; }
    .footer { padding: 18px 28px; background-color: #0b0f19; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admin Password Reset</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${safeName}</strong>,</p>
      <p>A request was received to reset the password for your portfolio administrator account.</p>
      
      <div class="btn-container">
        <a href="${safeUrl}" class="btn" target="_blank">Reset Administrator Password</a>
      </div>

      <div class="notice-box">
        <strong>Important:</strong> This password reset link is valid for <strong>15 minutes</strong>. If you did not make this request, please disregard this email. Your current password remains secure.
      </div>

      <p style="font-size: 13px; color: #94a3b8;">If the button above does not work, copy and paste this link into your browser:</p>
      <div class="url-fallback">${safeUrl}</div>
    </div>
    <div class="footer">
      Sabari M Portfolio Administration &bull; Automated Security Notification
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Admin Password Reset - Sabari M Portfolio
-----------------------------------------
Hello ${adminName || 'Admin'},

A request was received to reset your portfolio administrator password.

Use the link below to set a new password (valid for 15 minutes):
${resetUrl}

If you did not request this, please ignore this email.

Sabari M Portfolio Security
  `.trim();

  return { subject: emailSubject, html, text };
};
