import express from 'express';
import {
  createInternshipPaymentOrder,
  getInternshipDomains,
  submitInternshipApplication,
  verifyInternshipPayment,
} from '../Controller/internshipController.js';

const router = express.Router();

router.get('/domains', getInternshipDomains);
router.post('/apply', submitInternshipApplication);
router.post('/create-order', createInternshipPaymentOrder);
router.post('/verify-payment', verifyInternshipPayment);

export default router;
