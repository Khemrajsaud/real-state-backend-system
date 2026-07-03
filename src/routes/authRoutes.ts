
import express from 'express';
import { signup, login,logout ,getAllUsers, getBlockedTokens} from '../controllers/authController';
import {adminLogin} from '../controllers/admin-auth.controller';
import {submitInquiry, getAllInquiries} from '../controllers/inquiry.controller';
import { forgotPasswordOTP, resetPasswordWithOTP } from "../controllers/passwordResetController";
import { validate } from "../middleware/validate";  
import { registerSchema } from "../validators/auth.validator";
import {authLimiter,apiLimiter,contactLimiter       } from "../middleware/rateLimiter.middleware";
const router = express.Router();


router.post('/signup', authLimiter, validate(registerSchema), signup);
router.post('/login', authLimiter, login);
router.post('/logout', authLimiter, logout);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/inquiry/submit', contactLimiter, submitInquiry);
router.get('/admin/enquiries', apiLimiter, getAllInquiries);
router.post('/auth/otp', authLimiter, forgotPasswordOTP);
router.post('/auth/reset-password', authLimiter, resetPasswordWithOTP);
router.get("/users", getAllUsers);
router.get("/blocked-tokens", getBlockedTokens);
export default router;
