import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  memberId: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 50 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }
}, { timestamps: true });
export default mongoose.model('User', schema);
