export const requireTeacher = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only teacher can access this' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
