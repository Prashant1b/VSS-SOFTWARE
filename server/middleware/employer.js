export const requireEmployer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!['employer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only employer can access this' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
