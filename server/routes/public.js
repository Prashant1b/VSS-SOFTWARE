import express from 'express';
import Placement from '../models/Placement.js';
import Course from '../models/Course.js';
import Testimonial from '../models/Testimonial.js';
import HiringDrive from '../models/HiringDrive.js';
import SiteStat from '../models/SiteStat.js';
import Partner from '../models/Partner.js';

const router = express.Router();

// Public endpoints — no auth required

router.get('/placements', async (req, res) => {
  try {
    const data = await Placement.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const data = await Course.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const data = await Testimonial.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/hiring-drives', async (req, res) => {
  try {
    const data = await HiringDrive.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const data = await SiteStat.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/partners', async (req, res) => {
  try {
    const data = await Partner.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
