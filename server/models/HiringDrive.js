import mongoose from 'mongoose';

const hiringDriveSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true, enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'] },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('HiringDrive', hiringDriveSchema);
