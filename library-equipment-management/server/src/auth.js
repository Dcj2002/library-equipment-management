import { Router } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import rateLimit from 'express-rate-limit';
import User from './User.js';
import Session from './Session.js';
import Equipment from './Equipment.js';
import { hashPassword, verifyPassword } from './passwords.js';
import { profileInput, registrationInput, publicUser } from './auth-validation.js';
export const authRouter = Router();
const cookieName = 'lem_session';
const age = 7 * 24 * 60 * 60 * 1000;
const digest = value => createHash('sha256').update(value).digest('hex');
const cookieOptions = () => ({ httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api' });
function tokenFrom(req) {
  const raw = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  return raw && /^[a-f0-9]{64}$/.test(raw) ? raw : null;
}
async function createSession(req, res, user) {
  const previous = tokenFrom(req);
  if (previous) await Session.deleteOne({ tokenHash: digest(previous) });
  const token = randomBytes(32).toString('hex');
  await Session.create({ tokenHash: digest(token), userId: user._id, expiresAt: new Date(Date.now() + age) });
  res.cookie(cookieName, token, { ...cookieOptions(), maxAge: age });
}
export async function requireUser(req, res, next) {
  const token = tokenFrom(req);
  if (!token) return res.status(401).json({ message: 'Please log in to continue' });
  const session = await Session.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } }).lean();
  const user = session ? await User.findById(session.userId).lean() : null;
  if (!user) return res.status(401).json({ message: 'Session expired. Please log in again.' });
  req.user = user;
  next();
}
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only an administrator can manage equipment' });
  next();
}
// Local single-server rate limits. A shared store is required for multiple API processes.
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many login attempts. Try again in 15 minutes.' } });
const registerLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many registrations. Try again later.' } });
// A dummy hash makes password work similar for missing and existing users.
const dummyHash = hashPassword(randomBytes(32).toString('hex'));
authRouter.post('/register', registerLimit, async (req, res) => {
  const body = req.body || {};
  const { errors, clean } = registrationInput(body);
  if (errors.length) return res.status(400).json({ message: errors.join('. ') });
  const user = await User.create({ ...clean, role: 'user', passwordHash: await hashPassword(body.password) });
  await createSession(req, res, user);
  res.status(201).json({ user: publicUser(user) });
});
authRouter.post('/login', loginLimit, async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 128) return res.status(400).json({ message: 'Enter your email and password' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  const matches = await verifyPassword(password, user?.passwordHash || await dummyHash);
  if (!user || !matches) return res.status(401).json({ message: 'Incorrect email or password' });
  await createSession(req, res, user);
  res.json({ user: publicUser(user) });
});
authRouter.post('/logout', async (req, res) => {
  const token = tokenFrom(req);
  if (token) await Session.deleteOne({ tokenHash: digest(token) });
  res.clearCookie(cookieName, cookieOptions());
  res.json({ message: 'Logged out' });
});
authRouter.get('/me', requireUser, (req, res) => res.json({ user: publicUser(req.user) }));
authRouter.put('/me', requireUser, async (req, res) => {
  const { errors, clean } = profileInput(req.body || {});
  if (errors.length) return res.status(400).json({ message: errors.join('. ') });
  const user = await User.findByIdAndUpdate(req.user._id, { $set: clean }, { new: true, runValidators: true });
  res.json({ user: publicUser(user) });
});
authRouter.get('/my-borrowings', requireUser, async (req, res) => {
  res.json(await Equipment.find({ 'loan.userId': req.user._id }).sort({ 'loan.dueDate': 1 }).lean());
});
authRouter.get('/members', requireUser, requireAdmin, async (req, res) => {
  res.json((await User.find().sort({ name: 1 }).lean()).map(publicUser));
});
