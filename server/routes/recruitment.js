import express from 'express';
import {
  createRecruitment,
  createEmployerRecruitment,
  listEmployerRecruitments,
  listRecruitments,
} from '../Controller/recruitmentController.js';
import recruitmentUpload from '../middleware/recruitmentUpload.js';
import { protect } from '../middleware/auth.js';
import { requireEmployer } from '../middleware/employer.js';

const router = express.Router();

router.post('/', recruitmentUpload.single('jdFile'), createRecruitment);
router.get('/', listRecruitments);
router.post('/employer', protect, requireEmployer, recruitmentUpload.single('jdFile'), createEmployerRecruitment);
router.get('/my', protect, requireEmployer, listEmployerRecruitments);

export default router;
