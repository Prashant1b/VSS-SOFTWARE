import express from 'express';
import {
  createInternshipPaymentOrder,
  downloadInternshipReceipt,
  getInternshipDomains,
  submitInternshipApplication,
  verifyInternshipPayment,
} from '../Controller/internshipController.js';

const router = express.Router();

router.get('/domains', getInternshipDomains);
router.post('/apply', submitInternshipApplication);
router.post('/create-order', createInternshipPaymentOrder);
router.post('/verify-payment', verifyInternshipPayment);
router.get('/receipt/:id', downloadInternshipReceipt);

export default router;
