import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

export async function protect(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error("Token is missing");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) throw new Error("User doesn't exist");

    const isBlocked = await redisClient.exists(`blocked_${token}`);
    const isBlockedLegacy = await redisClient.exists(`token:${token}`);
    if (isBlocked || isBlockedLegacy) throw new Error("Invalid token");
    if (!payload.sid || user.activeSessionId !== payload.sid) {
      throw new Error('Session expired. Please login again');
    }

    req.user = user;
    req.token = token;
    req.tokenPayload = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}


