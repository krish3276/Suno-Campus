const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  // For development, log to console
  if (process.env.NODE_ENV === "development" && !process.env.EMAIL_USER) {
    return null; // Will use console logging instead
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, fullName) => {
  try {
    const transporter = createTransporter();

    // If no transporter (development mode), just log
    if (!transporter) {
      console.log("\n" + "=".repeat(60));
      console.log("📧 EMAIL SERVICE - DEVELOPMENT MODE");
      console.log("=".repeat(60));
      console.log(`To: ${email}`);
      console.log(`Name: ${fullName}`);
      console.log(`Subject: Verify Your SunoCampus Email`);
      console.log(`\n🔐 Your OTP Code: ${otp}`);
      console.log(`⏰ Valid for: 10 minutes`);
      console.log("=".repeat(60) + "\n");
      return { success: true, mode: "development" };
    }

    // Email content
    const mailOptions = {
      from: `"SunoCampus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your SunoCampus Email - OTP Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 SunoCampus</h1>
              <p>Verify Your College Email</p>
            </div>
            <div class="content">
              <h2>Hello ${fullName}!</h2>
              <p>Thank you for registering with SunoCampus. To complete your registration, please verify your college email address.</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">⏰ Valid for 10 minutes</p>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
              
              <p>Welcome to the SunoCampus community! 🎉</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} SunoCampus. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${fullName}!

Thank you for registering with SunoCampus. 

Your verification code is: ${otp}

This OTP is valid for 10 minutes only.

If you didn't request this, please ignore this email.

Welcome to the SunoCampus community!

---
This is an automated email. Please do not reply.
© ${new Date().getFullYear()} SunoCampus. All rights reserved.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Send welcome email after verification
exports.sendWelcomeEmail = async (email, fullName) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log(`\n📧 [DEV] Welcome email would be sent to ${email}`);
      return { success: true, mode: "development" };
    }

    const mailOptions = {
      from: `"SunoCampus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to SunoCampus! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to SunoCampus!</h1>
            </div>
            <div class="content">
              <h2>Hi ${fullName}! 👋</h2>
              <p>Your email has been successfully verified! You can now access all features of SunoCampus.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">📱 <strong>Social Feed</strong> - Share updates and connect with peers</div>
              <div class="feature">📅 <strong>Events</strong> - Discover and register for campus events</div>
              <div class="feature">👥 <strong>Network</strong> - Build your college community</div>
              <div class="feature">🎯 <strong>Opportunities</strong> - Find internships and workshops</div>
              
              <p style="margin-top: 20px;">Start exploring and make the most of your campus experience!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to SunoCampus, ${fullName}! Your email has been verified successfully. Start exploring campus events, connect with peers, and build your network!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    // Don't throw error for welcome email - it's not critical
    return { success: false };
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken, fullName) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    if (!transporter) {
      console.log("\n" + "=".repeat(60));
      console.log("📧 EMAIL SERVICE - DEVELOPMENT MODE");
      console.log("=".repeat(60));
      console.log(`To: ${email}`);
      console.log(`Name: ${fullName}`);
      console.log(`Subject: Password Reset Request`);
      console.log(`\n🔗 Reset URL: ${resetUrl}`);
      console.log(`🔑 Reset Token: ${resetToken}`);
      console.log(`⏰ Valid for: 30 minutes`);
      console.log("=".repeat(60) + "\n");
      return { success: true, mode: "development" };
    }

    const mailOptions = {
      from: `"SunoCampus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SunoCampus - Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 14px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${fullName},</h2>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <p style="text-align:center;"><a href="${resetUrl}" class="button">Reset Password</a></p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break:break-all; background:#fff; padding:10px; border-radius:5px; font-size:14px;">${resetUrl}</p>
              <p><strong>This link expires in 30 minutes.</strong></p>
              <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SunoCampus. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${fullName},\n\nWe received a request to reset your password.\n\nReset link: ${resetUrl}\n\nThis link expires in 30 minutes.\n\nIf you did not request this, please ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
