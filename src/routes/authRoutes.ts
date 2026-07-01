
import express from 'express';
import { signup, login,logout } from '../controllers/authController';
import {adminLogin} from '../controllers/admin-auth.controller';
import {submitInquiry, getAllInquiries} from '../controllers/inquiry.controller';

import { forgotPasswordOTP, resetPasswordWithOTP } from "../controllers/passwordResetController";
const router = express.Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/admin/login', adminLogin);
router.post('/inquiry/submit', submitInquiry)
router.get('/admin/enquiries', getAllInquiries);
router.post('/auth/otp', forgotPasswordOTP);
router.post('/auth/reset-password', resetPasswordWithOTP);
export default router;
