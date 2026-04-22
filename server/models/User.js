import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, trim: true, match: [/^\d{10}$/, 'Mobile number must be 10 digits'] },
  role: { type: String, enum: ['student', 'employer', 'teacher', 'admin'], default: 'student' },
  previousRoleBeforeAdmin: { type: String, enum: ['student', 'employer', 'teacher'] },
  institution: { type: String },
  enrolledCourses: [{ type: String }],
  activeSessionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $type: 'string' } },
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
