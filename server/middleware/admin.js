import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = payload;

    if (!id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can access this' });
    }
    const isBlocked = await redisClient.exists(`blocked_${token}`);
    const isBlockedLegacy = await redisClient.exists(`token:${token}`);

    if (isBlocked || isBlockedLegacy) {
      return res.status(401).json({ message: 'Token is blocked' });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      message: err.message || 'Unauthorized'
    });
  }
};