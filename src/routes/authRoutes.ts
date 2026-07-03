
import express from 'express';
import { signup, login,logout } from '../controllers/authController';
import {adminLogin} from '../controllers/admin-auth.controller';
import {submitInquiry, getAllInquiries} from '../controllers/inquiry.controller';
import { forgotPasswordOTP, resetPasswordWithOTP } from "../controllers/passwordResetController";
import { validate } from "../middleware/validate";  
import { registerSchema } from "../validators/auth.validator";
import {limiter} from "../middleware/rateLimiter.middleware";
const router = express.Router();


router.post('/signup', limiter, validate(registerSchema), signup);
router.post('/login', limiter, login);
router.post('logout', limiter, logout);
router.post('/admin/login', limiter, adminLogin);
router.post('/inquiry/submit', limiter, submitInquiry);
router.get('/admin/enquiries', limiter, getAllInquiries);
router.post('/auth/otp', limiter, forgotPasswordOTP);
router.post('/auth/reset-password', limiter, resetPasswordWithOTP);
export default router;
