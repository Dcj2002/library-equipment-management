import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in server/.env');
// One shared connection for this local, long-running academic server; driver pool defaults are retained.
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const { default: Equipment } = await import('./Equipment.js');
  const { default: User } = await import('./User.js');
  const { default: Session } = await import('./Session.js');
  await Promise.all([Equipment.init(), User.init(), Session.init()]); // Ensure the unique asset-tag index exists before accepting writes.
  const server = app.listen(Number(process.env.PORT) || 5000, '127.0.0.1', () => console.log('API ready at http://localhost:' + (process.env.PORT || 5000)));
  async function shutdown() { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1); }
