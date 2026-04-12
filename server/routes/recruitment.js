import express from 'express';
import multer from 'multer';
import path from 'path';
import Recruitment from '../models/Recruitment.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('jdFile'), async (req, res) => {
  try {
    const data = {
      ...req.body,
      jdFile: req.file ? req.file.filename : null,
    };
    const recruitment = new Recruitment(data);
    await recruitment.save();
    res.status(201).json({ success: true, message: 'Hiring requirement submitted successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const recruitments = await Recruitment.find().sort({ createdAt: -1 });
    res.json(recruitments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
