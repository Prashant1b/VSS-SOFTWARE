import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireTeacher } from '../middleware/teacher.js';
import {
  getTeacherOverview,
  getTeacherCourses,
  getTeacherBatches,
  getTeacherClassesIndex,
  createTeacherBatch,
  updateTeacherBatch,
  deleteTeacherBatch,
  getTeacherClasses,
  createTeacherClass,
  updateTeacherClass,
  deleteTeacherClass,
  startTeacherLiveClass,
  endTeacherLiveClass,
  removeLiveParticipant,
} from '../Controller/teacherController.js';

const router = express.Router();

router.use(protect, requireTeacher);

router.get('/overview', getTeacherOverview);
router.get('/courses', getTeacherCourses);
router.get('/batches', getTeacherBatches);
router.get('/classes', getTeacherClassesIndex);
router.post('/batches', createTeacherBatch);
router.put('/batches/:id', updateTeacherBatch);
router.delete('/batches/:id', deleteTeacherBatch);
router.get('/batches/:batchId/classes', getTeacherClasses);
router.post('/classes', createTeacherClass);
router.put('/classes/:id', updateTeacherClass);
router.delete('/classes/:id', deleteTeacherClass);
router.post('/classes/:id/live/start', startTeacherLiveClass);
router.post('/classes/:id/live/end', endTeacherLiveClass);
router.delete('/classes/:id/live/participants/:identity', removeLiveParticipant);

export default router;
