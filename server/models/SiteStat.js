import mongoose from 'mongoose';

const siteStatSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  value: { type: Number, required: true },
  suffix: { type: String, default: '' },
  order: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('SiteStat', siteStatSchema);
