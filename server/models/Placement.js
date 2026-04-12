import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  before: { type: String, required: true },
  after: { type: String, required: true },
  salary: { type: String, required: true },
  initials: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Placement', placementSchema);
