import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vss_jwt_secret_key_change_in_production';

export function generateToken(userId) {
  return jwt.sign( { id: user._id , role: user.role}, JWT_SECRET, { expiresIn: '7d' });
}

export async function protect(req, res, next){
     try{
         const token=req.cookies.token;
         if(!token) throw new Error("Token is missing");
          const payload=jwt.verify(token , process.env.key);
            const {_id}=payload;
            if(!_id) throw new Error("Id is missing");
            const user=await User.findById(_id);
            if(!user) throw new Error("User doesn't exists");
            // aab ham check karnege ki redis ke block list me to nhi hai
            const isblocked=await redisClient.exists(`blocked_${token}`);
            const isBlockedLegacy = await redisClient.exists(`token:${token}`);
            if(isblocked || isBlockedLegacy) throw new Error("Invalid token");
            req.user=user;
            next();
     } 
     catch(err){
        res.status(401).send("Error "+ err.message);
     }
}


