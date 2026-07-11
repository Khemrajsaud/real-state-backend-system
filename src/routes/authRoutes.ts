
import express from 'express';
import { signup, login,logout ,getAllUsers, getBlockedTokens} from '../controllers/authController';
import {adminLogin} from '../controllers/admin-auth.controller';
import {submitInquiry, getAllInquiries} from '../controllers/inquiry.controller';
import { forgotPasswordOTP, resetPasswordWithOTP } from "../controllers/passwordResetController";
import { validate } from "../middleware/validate";  
import { loginSchema, registerSchema, resetPasswordSchema, verifyOtpSchema } from "../validators/auth.validator";
import {authLimiter,apiLimiter,contactLimiter } from "../middleware/rateLimiter.middleware";
const router = express.Router();


router.post('/signup', authLimiter, validate(registerSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authLimiter, logout);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/inquiry/submit', contactLimiter, submitInquiry);
router.get('/admin/enquiries', apiLimiter, getAllInquiries);
router.post('/otp', authLimiter, validate(verifyOtpSchema), forgotPasswordOTP);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPasswordWithOTP);
router.get("/users", getAllUsers);
router.get("/blocked-tokens", getBlockedTokens);
export default router;


