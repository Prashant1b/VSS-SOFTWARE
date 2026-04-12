import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  registerWithOtp,
  sendOtp,
  login,
  loginWithOtp,
  logout,
  getProfile,
  resetPasswordWithOtp,
  UpdateProfile
} from "../Controller/userAuthent.js"

const router = express.Router();
router.post('/send-otp', sendOtp);
router.post('/register', registerWithOtp);
router.post('/login', login);
router.post('/login-otp', loginWithOtp);
router.post('/logout', logout);

// ================= PROFILE =================
router.get('/me', protect, getProfile);
router.put('/me', protect, UpdateProfile);
router.post('/reset-password', resetPasswordWithOtp);

export default router;