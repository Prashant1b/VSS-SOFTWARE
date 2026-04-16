import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vss_jwt_secret_key_change_in_production';


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

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}


