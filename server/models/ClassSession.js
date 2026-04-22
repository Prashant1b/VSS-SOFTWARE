import mongoose from 'mongoose';

const classSessionSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  courseSlug: { type: String, required: true, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sessionType: { type: String, enum: ['live', 'recorded'], required: true },
  scheduledFor: { type: Date, default: null },
  durationMinutes: { type: Number, default: 60, min: 0 },
  liveRoomName: { type: String, default: '' },
  liveStatus: { type: String, enum: ['idle', 'scheduled', 'live', 'ended'], default: 'idle' },
  liveStartedAt: { type: Date, default: null },
  liveEndedAt: { type: Date, default: null },
  liveMeetingUrl: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  notesUrl: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

classSessionSchema.index({ batch: 1, sessionType: 1, scheduledFor: 1 });

export default mongoose.model('ClassSession', classSessionSchema);
