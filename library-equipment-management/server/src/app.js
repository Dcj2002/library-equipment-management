import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import Equipment from './Equipment.js';
import User from './User.js';
import { authRouter, requireUser, requireAdmin } from './auth.js';
import { validateEquipment, validateLoan } from './validation.js';
export const app = express();
app.use(helmet());
const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin, credentials: true }));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin !== origin) return res.status(403).json({ message: 'Request origin is not allowed. Open the frontend using ' + origin });
  next();
});
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRouter);
app.use('/api/equipment', requireUser, (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return requireAdmin(req, res, next);
});
// Keep availability visible while redacting other members' borrower information.
function visibleItem(item, user) {
  if (item.loan && user.role !== 'admin' && String(item.loan.userId) !== String(user._id)) {
    return { ...item, notes: '', loan: { dueDate: item.loan.dueDate, issuedAt: item.loan.issuedAt } };
  }
  return item;
}
app.param('id', (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) return res.status(400).json({ message: 'Invalid equipment ID' });
  next();
});
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
app.get('/api/equipment', async (req, res) => {
  const filter = {};
  const q = String(req.query.q || '').slice(0, 100);
  if (q) filter.$or = ['name', 'assetTag', 'location'].map(key => ({ [key]: { $regex: escape(q), $options: 'i' } }));
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.status === 'issued') filter.loan = { $ne: null };
  if (req.query.status === 'available') { filter.loan = null; filter.condition = { $ne: 'Needs repair' }; }
  if (req.query.status === 'maintenance') { filter.loan = null; filter.condition = 'Needs repair'; }
  if (req.query.status === 'overdue') filter['loan.dueDate'] = { $lt: new Date() };
  const sorts = { newest: { createdAt: -1 }, name: { name: 1 }, assetTag: { assetTag: 1 } };
  const sort = Object.hasOwn(sorts, req.query.sort || '') ? sorts[req.query.sort] : sorts.newest;
  const items = await Equipment.find(filter).sort(sort).lean();
  res.json(items.map(item => visibleItem(item, req.user)));
});
app.get('/api/equipment/:id', async (req, res) => {
  const item = await Equipment.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Equipment not found' });
  res.json(visibleItem(item, req.user));
});
app.post('/api/equipment', async (req, res) => {
  const { errors, clean } = validateEquipment(req.body || {});
  if (errors.length) return res.status(400).json({ message: errors.join('. ') });
  res.status(201).json(await Equipment.create(clean));
});
// Revision checks make stale edits/deletes fail instead of silently overwriting another user's work.
app.use('/api/equipment/:id', (req, res, next) => {
  if (req.method === 'GET') return next();
  if (!Number.isInteger(req.body?.revision) || req.body.revision < 0) return res.status(400).json({ message: 'A valid revision is required' });
  next();
});
async function changed(res, id, operation) {
  const item = await operation;
  if (item) return res.json(item);
  const exists = await Equipment.exists({ _id: id });
  return res.status(exists ? 409 : 404).json({ message: exists ? 'Item changed or this action is unavailable. Refresh and try again.' : 'Equipment not found' });
}
app.put('/api/equipment/:id', async (req, res) => {
  const { errors, clean } = validateEquipment(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join('. ') });
  return changed(res, req.params.id, Equipment.findOneAndUpdate(
    { _id: req.params.id, revision: req.body.revision },
    { $set: clean, $inc: { revision: 1 } }, { new: true, runValidators: true }));
});
app.delete('/api/equipment/:id', async (req, res) => {
  const item = await Equipment.findOneAndDelete({ _id: req.params.id, revision: req.body.revision, loan: null });
  if (!item) return res.status(409).json({ message: 'Cannot delete: item is issued, already deleted, or changed. Refresh first.' });
  res.json({ message: 'Equipment deleted' });
});
app.post('/api/equipment/:id/issue', async (req, res) => {
  if (typeof req.body.userId !== 'string' || !/^[a-f\d]{24}$/i.test(req.body.userId)) return res.status(400).json({ message: 'Select a registered borrower' });
  const borrower = await User.findById(req.body.userId).lean();
  if (!borrower) return res.status(400).json({ message: 'Registered borrower not found' });
  const { errors, loan } = validateLoan({ borrower: borrower.name, borrowerId: borrower.memberId, dueDate: req.body.dueDate });
  loan.userId = borrower._id;
  if (errors.length) return res.status(400).json({ message: errors.join('. ') });
  return changed(res, req.params.id, Equipment.findOneAndUpdate(
    { _id: req.params.id, revision: req.body.revision, loan: null, condition: { $ne: 'Needs repair' } },
    { $set: { loan }, $inc: { revision: 1 } }, { new: true, runValidators: true }));
});
app.post('/api/equipment/:id/return', async (req, res) => changed(res, req.params.id, Equipment.findOneAndUpdate(
  { _id: req.params.id, revision: req.body.revision, loan: { $ne: null } },
  { $set: { loan: null }, $inc: { revision: 1 } }, { new: true })));
app.use((req, res) => res.status(404).json({ message: 'API route not found' }));
app.use((error, req, res, next) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const message = field === 'email' ? 'Email already registered' : field === 'memberId' ? 'Student/staff ID already registered' : 'Asset tag already exists';
    return res.status(409).json({ message });
  }
  if (error.name === 'ValidationError' || error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid data. Check your fields and JSON format.' });
  if (error.status === 413) return res.status(413).json({ message: 'Request too large' });
  console.error(error.message);
  res.status(500).json({ message: 'Server error. Please try again.' });
});
