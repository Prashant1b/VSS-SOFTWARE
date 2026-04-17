import express from 'express';
import { createRecruitment, listRecruitments } from '../Controller/recruitmentController.js';
import recruitmentUpload from '../middleware/recruitmentUpload.js';

const router = express.Router();

router.post('/', recruitmentUpload.single('jdFile'), createRecruitment);
router.get('/', listRecruitments);

export default router;
