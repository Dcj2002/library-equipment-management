import mongoose from 'mongoose';
import { categories, conditions } from './validation.js';
const loanSchema = new mongoose.Schema({
  borrower: { type: String, required: true, maxlength: 100 },
  borrowerId: { type: String, required: true, maxlength: 50 },
  issuedAt: { type: Date, required: true },
  dueDate: { type: Date, required: true }
}, { _id: false });
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  assetTag: { type: String, required: true, unique: true, uppercase: true, maxlength: 40 },
  category: { type: String, required: true, enum: categories },
  location: { type: String, required: true, maxlength: 100 },
  condition: { type: String, required: true, enum: conditions },
  notes: { type: String, default: '', maxlength: 500 },
  loan: { type: loanSchema, default: null },
  revision: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('Equipment', schema);
