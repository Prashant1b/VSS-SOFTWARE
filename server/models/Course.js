import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  categoryLabel: { type: String, default: '' },
  cardHeadline: { type: String, default: 'Course' },
  duration: { type: String, required: true },
  durationLabel: { type: String, default: '' },
  price: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  originalPrice: { type: String, default: '' },
  mode: { type: String, default: 'Online / Offline' },
  students: { type: String, default: '0' },
  projectsCount: { type: String, default: '' },
  nextBatchLabel: { type: String, default: '' },
  accentTone: { type: String, enum: ['violet', 'blue', 'sky'], default: 'violet' },
  rating: { type: String, default: '0' },
  description: { type: String },
  demoVideoUrl: { type: String, default: '' },
  features: [{ type: String }],
  techStack: [{ type: String }],
  highlights: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Course', courseSchema);
