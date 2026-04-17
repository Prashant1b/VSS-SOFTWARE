import express from 'express';
import {
  getPublicPlacements,
  getPublicCourses,
  getPublicTestimonials,
  getPublicHiringDrives,
  getPublicStats,
  getPublicPartners,
} from '../Controller/publicController.js';

const router = express.Router();

router.get('/placements', getPublicPlacements);
router.get('/courses', getPublicCourses);
router.get('/testimonials', getPublicTestimonials);
router.get('/hiring-drives', getPublicHiringDrives);
router.get('/stats', getPublicStats);
router.get('/partners', getPublicPartners);

export default router;
