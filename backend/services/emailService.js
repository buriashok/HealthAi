import nodemailer from 'nodemailer';

// Create transporter — uses Gmail App Password by default
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password, NOT your real password
    },
  });
};

/**
 * Send a 6-digit OTP verification email.
 */
export const sendOTP = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"HealthAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 HealthAI — Your Verification Code',
    html: `
      <div style="font-family: 'Source Sans Pro', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #39d353; margin: 0;">HealthAI</h1>
          <p style="color: #94a3b8;">Your AI Health Companion</p>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 16px;">Your verification code is:</p>
          <div style="font-size: 2.5rem; font-weight: 700; letter-spacing: 8px; color: #39d353; padding: 16px; background: #0f172a; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #94a3b8; margin: 16px 0 0; font-size: 0.9rem;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
        <p style="color: #64748b; font-size: 0.8rem; text-align: center; margin-top: 24px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send a password reset link email.
 */
export const sendPasswordReset = async (email, resetLink) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"HealthAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 HealthAI — Reset Your Password',
    html: `
      <div style="font-family: 'Source Sans Pro', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #39d353; margin: 0;">HealthAI</h1>
          <p style="color: #94a3b8;">Password Reset Request</p>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 12px; text-align: center;">
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 0.85rem;">This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #64748b; font-size: 0.75rem; word-break: break-all;">
            If the button doesn't work, copy this link:<br/>${resetLink}
          </p>
        </div>
        <p style="color: #64748b; font-size: 0.8rem; text-align: center; margin-top: 24px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
