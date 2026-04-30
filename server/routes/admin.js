import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getHiringDrives,
  createHiringDrive,
  updateHiringDrive,
  deleteHiringDrive,
  getSiteStats,
  createSiteStat,
  updateSiteStat,
  deleteSiteStat,
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getContacts,
  deleteContact,
  getEnrollments,
  updateEnrollment,
  deleteEnrollment,
  getRecruitments,
  deleteRecruitment,
  getInternships,
  updateInternship,
  deleteInternship,
  getInternshipDomains,
  createInternshipDomain,
  updateInternshipDomain,
  deleteInternshipDomain,
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from '../Controller/adminController.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/placements', getPlacements);
router.post('/placements', createPlacement);
router.put('/placements/:id', updatePlacement);
router.delete('/placements/:id', deletePlacement);

router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

router.get('/hiring-drives', getHiringDrives);
router.post('/hiring-drives', createHiringDrive);
router.put('/hiring-drives/:id', updateHiringDrive);
router.delete('/hiring-drives/:id', deleteHiringDrive);

router.get('/stats', getSiteStats);
router.post('/stats', createSiteStat);
router.put('/stats/:id', updateSiteStat);
router.delete('/stats/:id', deleteSiteStat);

router.get('/partners', getPartners);
router.post('/partners', createPartner);
router.put('/partners/:id', updatePartner);
router.delete('/partners/:id', deletePartner);

router.get('/batches', getBatches);
router.post('/batches', createBatch);
router.put('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);

router.get('/contacts', getContacts);
router.delete('/contacts/:id', deleteContact);

router.get('/enrollments', getEnrollments);
router.patch('/enrollments/:id', updateEnrollment);
router.delete('/enrollments/:id', deleteEnrollment);

router.get('/recruitments', getRecruitments);
router.delete('/recruitments/:id', deleteRecruitment);

router.get('/internships', getInternships);
router.patch('/internships/:id', updateInternship);
router.delete('/internships/:id', deleteInternship);

router.get('/internship-domains', getInternshipDomains);
router.post('/internship-domains', createInternshipDomain);
router.put('/internship-domains/:id', updateInternshipDomain);
router.delete('/internship-domains/:id', deleteInternshipDomain);

export default router;
