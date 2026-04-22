import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMyClassrooms, getCourseClassroom, getLiveClassAccess } from '../Controller/classroomController.js';

const router = express.Router();

router.use(protect);

router.get('/my-courses', getMyClassrooms);
router.get('/course/:courseSlug', getCourseClassroom);
router.post('/live/:classId/access', getLiveClassAccess);

export default router;
