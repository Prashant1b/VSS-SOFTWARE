import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  headcount: { type: String, required: true },
  location: { type: String, required: true },
  jdFile: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Recruitment', recruitmentSchema);
