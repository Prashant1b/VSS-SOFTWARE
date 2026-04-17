import express from 'express';
import { createEnrollment, listEnrollments } from '../Controller/enrollmentController.js';

const router = express.Router();

router.post('/', createEnrollment);
router.get('/', listEnrollments);

export default router;
