import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true },
  category: { type: String, enum: ['career', 'ai', 'hiring'], required: true },
  action: { type: String, required: true, trim: true },
  fileName: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileOriginalName: { type: String, default: '' },
  fileStorageProvider: { type: String, default: '' },
  fileStoragePath: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Resource', resourceSchema);
