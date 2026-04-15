import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import main from './config/db.js';
import redisClient from './config/redis.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import recruitmentRoutes from './routes/recruitment.js';
import enrollmentRoutes from './routes/enrollment.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser());



app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);


  const Initaliseconnection=async()=>{
      try{
          await Promise.all([main(), redisClient.connect()]);
          console.log("DB connected")
                  app.listen(process.env.PORT, () => {
                  console.log("Server is listen on the port: " + process.env.PORT)
            })
      }
      catch(err){
          console.log("DB error " + err.message)
      }
  }

  Initaliseconnection();
