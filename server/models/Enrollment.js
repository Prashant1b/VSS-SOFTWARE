import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  courseSlug: { type: String },
  classMode: {
    type: String,
    enum: ['online', 'hybrid', 'offline'],
  },
  classModeLabel: { type: String, default: '' },
  classLocation: { type: String, default: '' },
  classLocationUrl: { type: String, default: '' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  batchName: { type: String, default: '' },
  institution: { type: String },
  message: { type: String },
  source: {
    type: String,
    enum: ['website_lead', 'dashboard_enrollment'],
    default: 'website_lead',
  },
  status: {
    type: String,
    enum: ['lead', 'demo_booked', 'payment_pending', 'paid', 'payment_failed'],
    default: 'lead',
  },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentOrderId: { type: String },
  paymentId: { type: String },
  paymentSignature: { type: String },
  paidAt: { type: Date },
  demoSlotAt: { type: Date },
  demoTimezone: { type: String, default: 'Asia/Kolkata' },
  demoNotes: { type: String },
  demoVideoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

enrollmentSchema.index(
  { user: 1, courseSlug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $exists: true, $type: 'objectId' },
      courseSlug: { $exists: true, $type: 'string' },
    },
  }
);

export default mongoose.model('Enrollment', enrollmentSchema);
