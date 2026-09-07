import nodemailer from 'nodemailer';

// Helper to check if Gmail SMTP credentials are fully provided
export const isEmailConfigured = () => {
  return Boolean(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER.trim() !== '' &&
    process.env.EMAIL_PASS.trim() !== ''
  );
};

let transporter = null;

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
    // Prevent indefinite network hangs and DNS latency
    connectionTimeout: 10000, // 10 seconds to establish connection
    greetingTimeout: 5000,    // 5 seconds for greeting
    socketTimeout: 15000,     // 15 seconds socket inactivity timeout
    family: 4,               // Prefer IPv4 to avoid Windows dual-stack IPv6 DNS hangs
  });
} else {
  console.warn(
    '[Email] Missing EMAIL_USER or EMAIL_PASS in environment variables. Email notification services will be bypassed safely until configured.'
  );
}

export default transporter;
