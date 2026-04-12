import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  students: { type: String, default: '0' },
  rating: { type: String, default: '0' },
  description: { type: String },
  highlights: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Course', courseSchema);
