import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  headcount: { type: String, required: true },
  location: { type: String, required: true },
  jdFile: { type: String },
  jdFileUrl: { type: String, default: '' },
  jdFilePublicId: { type: String, default: '' },
  jdFileOriginalName: { type: String, default: '' },
  jdFileStorageProvider: { type: String, default: '' },
  jdFileStoragePath: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String },
  source: { type: String, enum: ['public_form', 'employer_dashboard'], default: 'public_form' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Recruitment', recruitmentSchema);
