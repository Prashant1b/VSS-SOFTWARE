import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import Placement from '../models/Placement.js';
import Course from '../models/Course.js';
import Testimonial from '../models/Testimonial.js';
import HiringDrive from '../models/HiringDrive.js';
import SiteStat from '../models/SiteStat.js';
import Partner from '../models/Partner.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Enrollment from '../models/Enrollment.js';
import Recruitment from '../models/Recruitment.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// ==================== DASHBOARD STATS ====================
router.get('/dashboard', async (req, res) => {
  try {
    const [users, contacts, enrollments, recruitments, placements, courses] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Enrollment.countDocuments(),
      Recruitment.countDocuments(),
      Placement.countDocuments(),
      Course.countDocuments(),
    ]);
    res.json({ success: true, stats: { users, contacts, enrollments, recruitments, placements, courses } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USERS ====================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PLACEMENTS ====================
router.get('/placements', async (req, res) => {
  try {
    const data = await Placement.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/placements', async (req, res) => {
  try {
    const item = new Placement(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/placements/:id', async (req, res) => {
  try {
    const item = await Placement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/placements/:id', async (req, res) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Placement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== COURSES ====================
router.get('/courses', async (req, res) => {
  try {
    const data = await Course.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const item = new Course(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const item = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TESTIMONIALS ====================
router.get('/testimonials', async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const item = new Testimonial(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== HIRING DRIVES ====================
router.get('/hiring-drives', async (req, res) => {
  try {
    const data = await HiringDrive.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/hiring-drives', async (req, res) => {
  try {
    const item = new HiringDrive(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/hiring-drives/:id', async (req, res) => {
  try {
    const item = await HiringDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/hiring-drives/:id', async (req, res) => {
  try {
    await HiringDrive.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Hiring drive deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SITE STATS ====================
router.get('/stats', async (req, res) => {
  try {
    const data = await SiteStat.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/stats', async (req, res) => {
  try {
    const item = new SiteStat(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/stats/:id', async (req, res) => {
  try {
    const item = await SiteStat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/stats/:id', async (req, res) => {
  try {
    await SiteStat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PARTNERS ====================
router.get('/partners', async (req, res) => {
  try {
    const data = await Partner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/partners', async (req, res) => {
  try {
    const item = new Partner(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/partners/:id', async (req, res) => {
  try {
    const item = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/partners/:id', async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Partner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CONTACTS (read-only for admin) ====================
router.get('/contacts', async (req, res) => {
  try {
    const data = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ENROLLMENTS ====================
router.get('/enrollments', async (req, res) => {
  try {
    const data = await Enrollment.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/enrollments/:id', async (req, res) => {
  try {
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enrollment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== RECRUITMENTS ====================
router.get('/recruitments', async (req, res) => {
  try {
    const data = await Recruitment.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/recruitments/:id', async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Recruitment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
