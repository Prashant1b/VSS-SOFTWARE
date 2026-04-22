import Recruitment from '../models/Recruitment.js';

export const createRecruitment = async (req, res) => {
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
};

export const createEmployerRecruitment = async (req, res) => {
  try {
    const data = {
      ...req.body,
      user: req.user._id,
      email: req.body.email || req.user.email,
      phone: req.body.phone || req.user.phone,
      jdFile: req.file ? req.file.filename : null,
      source: 'employer_dashboard',
    };

    const recruitment = new Recruitment(data);
    await recruitment.save();
    res.status(201).json({ success: true, message: 'Job requirement posted successfully!', data: recruitment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listRecruitments = async (req, res) => {
  try {
    const recruitments = await Recruitment.find().sort({ createdAt: -1 });
    res.json(recruitments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listEmployerRecruitments = async (req, res) => {
  try {
    const scope = req.user.role === 'admin' ? {} : { user: req.user._id };
    const recruitments = await Recruitment.find(scope).sort({ createdAt: -1 });
    res.json({ success: true, data: recruitments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
