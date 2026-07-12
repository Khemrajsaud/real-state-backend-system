
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters"),

  email: z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password cannot exceed 32 characters"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(
      /^[\+]?[0-9]{10,15}$/,
      "Please enter a valid phone number"
    ),

  dob: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "Invalid date"
    ),
});


export const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required"),
});


export const forgotPasswordSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
});


export const verifyOtpSchema = z.object({
  email: z
    .email()
    .trim()
    .toLowerCase(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});


export const resetPasswordSchema = z.object({
  email: z
    .email()
    .trim()
    .toLowerCase(),

  code: z
    .string()
    .length(6),

  newPassword: z
    .string()
    .min(6)
    .max(32),

  confirmPassword: z
    .string()
    .min(6),
});



