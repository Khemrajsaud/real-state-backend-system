import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import prisma from "../services/prisma";

export const forgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  try {
    // 1. Verify user exists using uppercase model definition 'User'
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "No user found with this email address." });
      return;
    }

    // 2. Generate secure 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // 3. Set a 10-minute expiration timestamp
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    // 4. Update fields to match schema exactly: otpCode and otpExpiry
    await prisma.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpiry: expiryDate,
      },
    });

    // Check for missing email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials are not configured in environment variables.");
      res.status(500).json({ error: "Email service is not configured." });
      return;
    }

    // TEMPORARY DEBUG: Log the email user to verify it's loaded correctly.
    // REMOVE THIS IN PRODUCTION.
    console.log(`[DEBUG] Attempting to send email from: ${process.env.EMAIL_USER}`);
    // 5. Initialize Nodemailer Mail Config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add this for better debugging in development
      debug: process.env.NODE_ENV === "development",
    });

    // 6. Define the layout configuration of the email body
    const mailOptions = {
      from: `"Real Estate Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your account password. Use the verification OTP code below to finalize your changes:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; border-radius: 4px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 12px;">This OTP code is valid for the next <b>10 minutes</b>. If you did not make this request, please safely disregard this message.</p>
        </div>
      `,
    };


    // 7. Fire the email request over SMTP
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "A secure verification 6-digit OTP code has been sent to your Gmail inbox." 
    });

  } catch (error: any) {
    console.error("Failed to execute password workflow:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};







export const resetPasswordWithOTP = async (req: Request, res: Response): Promise<void> => {
  // Matches your exact frontend layout input fields
  const { email, code, newPassword, confirmPassword } = req.body;

  if (!email || !code || !newPassword || !confirmPassword) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "New passwords do not match." });
    return;
  }

  try {
    // Find the user verifying email, matching active OTP, and ensuring it hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        email,
        otpCode: code.toString(),
        otpExpiry: {
          gt: new Date(), // Code must be valid right now
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification code." });
      return;
    }

    // Hash the brand new password securely
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the record and immediately clean out the OTP values
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        otpCode: null,
        otpExpiry: null,
      },
    });

    res.status(200).json({ message: "Password updated successfully! You can now log in." });
  } catch (error: any) {
    console.error("Failed to reset password:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};