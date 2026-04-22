import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  courseSlug: { type: String, required: true, trim: true },
  courseTitle: { type: String, required: true, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  startDate: { type: Date, default: null },
  liveClassUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

batchSchema.index({ courseSlug: 1, teacher: 1, title: 1 }, { unique: true });

export default mongoose.model('Batch', batchSchema);
