import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyCourseEnrollments,
  getCourseEnrollmentStatus,
  scheduleDemoSlot,
  createPaymentOrder,
  verifyCoursePayment,
  downloadCourseReceipt,
} from '../Controller/courseEnrollmentController.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyCourseEnrollments);
router.get('/status/:courseSlug', getCourseEnrollmentStatus);
router.post('/demo-slot', scheduleDemoSlot);
router.post('/create-order', createPaymentOrder);
router.post('/verify-payment', verifyCoursePayment);
router.get('/receipt/:id', downloadCourseReceipt);

export default router;
