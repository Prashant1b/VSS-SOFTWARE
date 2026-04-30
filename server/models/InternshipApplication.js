import mongoose from 'mongoose';

const internshipApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  college: { type: String, required: true, trim: true },
  track: { type: String, required: true, trim: true },
  duration: {
    type: String,
    enum: ['1-month', '3-month', '6-month'],
    required: true,
  },
  planType: {
    type: String,
    enum: ['free', 'paid', 'talent_free_review'],
    required: true,
  },
  portfolio: { type: String, default: '' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['submitted', 'interview_pending', 'interview_cleared', 'interview_rejected', 'payment_pending', 'paid'],
    default: 'submitted',
  },
  interviewStatus: {
    type: String,
    enum: ['not_required', 'pending', 'cleared', 'rejected'],
    default: 'not_required',
  },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentOrderId: { type: String },
  paymentId: { type: String },
  paymentSignature: { type: String },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

internshipApplicationSchema.index({ email: 1, duration: 1, createdAt: -1 });

export default mongoose.model('InternshipApplication', internshipApplicationSchema);
