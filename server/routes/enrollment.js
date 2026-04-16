import express from 'express';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const enrollment = new Enrollment({
      ...req.body,
      source: 'website_lead',
      status: 'lead',
    });
    await enrollment.save();
    res.status(201).json({ success: true, message: 'Enrollment request submitted successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const enrollments = await Enrollment.find().sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
