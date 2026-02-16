import nodemailer from 'nodemailer';
import config from '../config';

// Create reusable transporter using Google SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
};

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP verification email
export const sendOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Finding Moto" <${config.smtpUser}>`,
    to: email,
    subject: 'Verify Your Email - Finding Moto',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 480px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">Finding Moto</h1>
            <p style="color: #C7D2FE; margin: 8px 0 0; font-size: 14px;">Email Verification</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
            <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Please use the following verification code to complete your registration. This code is valid for <strong>10 minutes</strong>.
            </p>
            
            <!-- OTP Box -->
            <div style="background-color: #F9FAFB; border: 2px dashed #D1D5DB; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
              <p style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Verification Code</p>
              <p style="color: #1F2937; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
            </div>
            
            <p style="color: #9CA3AF; font-size: 13px; line-height: 1.5; margin: 0;">
              If you didn't create an account on Finding Moto, you can safely ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Finding Moto. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email after verification
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: string
): Promise<void> => {
  const transporter = createTransporter();

  const roleMessages: Record<string, string> = {
    buyer: 'You can now browse and purchase motorcycles, parts & accessories.',
    seller: 'Your seller account is pending admin approval. We\'ll notify you once it\'s approved.',
    mechanic: 'Your mechanic account is pending admin approval. We\'ll notify you once it\'s approved.',
  };

  const mailOptions = {
    from: `"Finding Moto" <${config.smtpUser}>`,
    to: email,
    subject: 'Welcome to Finding Moto! 🏍️',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 480px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669, #10B981); padding: 32px 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">🏍️</div>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">Welcome to Finding Moto!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
            <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
              Your email has been verified successfully! Your <strong>${role}</strong> account is now set up.
            </p>
            <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              ${roleMessages[role] || 'Welcome aboard!'}
            </p>
            
            <a href="${config.clientUrl}/login" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Go to Login
            </a>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Finding Moto. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send approval notification email
export const sendApprovalEmail = async (
  email: string,
  name: string,
  approved: boolean,
  notes?: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Finding Moto" <${config.smtpUser}>`,
    to: email,
    subject: approved
      ? '✅ Your Account Has Been Approved - Finding Moto'
      : '❌ Account Application Update - Finding Moto',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 480px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${approved ? '#059669, #10B981' : '#DC2626, #EF4444'}); padding: 32px 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">${approved ? '✅' : '❌'}</div>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">
              ${approved ? 'Account Approved!' : 'Application Update'}
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
            ${approved ? `
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Great news! Your account has been approved by our admin team. You can now log in and start using Finding Moto.
              </p>
              <a href="${config.clientUrl}/login" style="display: inline-block; background-color: #059669; color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Log In Now
              </a>
            ` : `
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Unfortunately, your account application was not approved at this time.
              </p>
              ${notes ? `
                <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 0 0 16px;">
                  <p style="color: #991B1B; font-size: 14px; margin: 0;"><strong>Reason:</strong> ${notes}</p>
                </div>
              ` : ''}
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0;">
                If you have questions, please contact our support team.
              </p>
            `}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Finding Moto. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
