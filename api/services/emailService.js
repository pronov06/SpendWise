import nodemailer from "nodemailer";

// ─── Create Email Transporter (Lazy - created when needed) ───
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      family: 4, // Force IPv4 instead of IPv6
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

// ─── Send OTP Email ───────────────────────────────────────
export const sendOTPEmail = async (email, otp) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@spendwise.app",
      to: email,
      subject: "SpendWise - Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">SpendWise</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Expense Tracker</p>
          </div>
          <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello,<br><br>
              Thank you for registering with SpendWise! Use the OTP below to verify your email address.
            </p>
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">Enter this code:</p>
              <h1 style="color: #667eea; letter-spacing: 8px; font-size: 36px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 14px; margin: 20px 0;">
              This code will expire in 10 minutes.
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2025 SpendWise. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// ─── Send Password Reset Email ────────────────────────────
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@spendwise.app",
      to: email,
      subject: "SpendWise - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">SpendWise</h1>
          </div>
          <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to proceed.
            </p>
            <a href="${resetLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link:<br>
              <code style="background: white; padding: 10px; border-radius: 4px; display: block; word-break: break-all; margin-top: 10px;">${resetLink}</code>
            </p>
            <p style="color: #999; font-size: 14px;">
              This link will expire in 1 hour.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// ─── Send Welcome Email ────────────────────────────────────
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@spendwise.app",
      to: email,
      subject: "Welcome to SpendWise!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to SpendWise! 💰</h1>
          </div>
          <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Hello ${name}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Welcome to SpendWise, your smart expense tracker. Start managing your finances today!
            </p>
            <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #333; margin-top: 0;">Quick Tips:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>📊 Track your expenses and incomes</li>
                <li>💵 Set and monitor budgets</li>
                <li>👥 Split expenses with friends</li>
                <li>📈 View spending analytics</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px;">
              Need help? Check out our documentation or contact support.
            </p>
          </div>
        </div>
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
  }
};

// ─── Verify Email Configuration ────────────────────────────
export const verifyEmailConfig = async () => {
  try {
    // Verify connection
    console.log(`🔄 Verifying email connection to ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}...`);
    await getTransporter().verify();
    console.log("✅ Email service configured and ready");
    return true;
  } catch (error) {
    console.error(`❌ Email configuration error (${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}):`, error.message);
    console.error("💡 Tip: Check if Mailtrap credentials are correct or if your network can reach sandbox.smtp.mailtrap.io");
    return false;
  }
};

// ─── Send Group Split Email ──────────────────────────────
export const sendGroupSplitEmail = async (memberEmail, memberName, groupName, settlements, totalExpenses, expensesList) => {
  try {
    const settlementsHtml = settlements.length > 0 
      ? settlements.map(s => `
          <div style="background: #fff; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid ${s.from === memberName ? '#e53e3e' : '#38a169'};">
            <strong>${s.from}</strong> owes <strong>${s.to}</strong>: ₹${s.amount.toFixed(2)}
          </div>
        `).join('')
      : '<p style="color: #38a169; font-weight: bold;">All settled up! 🎉</p>';

    const expensesHtml = expensesList.map(e => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${e.amount.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px; color: #666;">${e.paidByName}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@spendwise.app",
      to: memberEmail,
      subject: `SpendWise - Expense Split for "${groupName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f7f6; padding: 20px; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Group Expense Split</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Group: ${groupName}</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #333; margin-top: 0;">Hello ${memberName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Here are the split details and settlements for the group <strong>${groupName}</strong>.
            </p>

            <div style="margin: 25px 0; background: #f0fdfa; padding: 20px; border-radius: 8px;">
              <h3 style="color: #134e4a; margin-top: 0; font-size: 16px;">Current Settlements</h3>
              ${settlementsHtml}
            </div>

            <h3 style="color: #333; font-size: 16px; border-bottom: 2px solid #f0fdfa; padding-bottom: 10px;">Bill Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="text-align: left; background: #f9fafb;">
                  <th style="padding: 8px; color: #4b5563; font-size: 12px;">Description</th>
                  <th style="padding: 8px; color: #4b5563; font-size: 12px;">Amount</th>
                  <th style="padding: 8px; color: #4b5563; font-size: 12px;">Paid By</th>
                </tr>
              </thead>
              <tbody>
                ${expensesHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p style="margin: 0; color: #666; font-size: 14px;">Total Group Expenses</p>
              <h2 style="margin: 0; color: #14b8a6;">₹${totalExpenses.toFixed(2)}</h2>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated split report from SpendWise. Track more at <a href="${process.env.FRONTEND_URL}" style="color: #14b8a6; text-decoration: none;">spendwise.app</a>
            </p>
          </div>
        </div>
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`✅ Split email sent to ${memberEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send split email to ${memberEmail}:`, error.message);
  }
};

// ─── Send Feedback Email to Admin ─────────────────────────
export const sendFeedbackEmailToAdmin = async (user, feedback) => {
  try {
    const adminEmail = process.env.EMAIL_USER; // Admin receives the email

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@spendwise.app",
      to: adminEmail,
      subject: `New SpendWise Feedback: ${feedback.type.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">New User Feedback Received!</h2>
          <p><strong>User:</strong> ${user.name || 'Unknown'} (${user.email || 'Unknown Email'})</p>
          <p><strong>Feedback Type:</strong> ${feedback.type}</p>
          <p><strong>Rating:</strong> ${feedback.rating} / 5</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; margin-top: 15px;">
            <p style="color: #555; font-style: italic; margin: 0;">"${feedback.message}"</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Received on: ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`✅ Feedback email sent to admin (${adminEmail})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send feedback email to admin:`, error.message);
  }
};
