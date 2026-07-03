
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(
      /^[A-Za-z\s]+$/,
      "Name can only contain letters and spaces"
    ),

  email: z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password cannot exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),

  phone: z
    .string()
    .trim()
    .regex(
      /^(\+977)?9[678]\d{8}$/,
      "Please enter a valid Nepali mobile number"
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

  otp: z
    .string()
    .length(6),

  password: z
    .string()
    .min(8)
    .max(32)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character"),
});



