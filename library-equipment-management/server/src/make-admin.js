import 'dotenv/config';
import mongoose from 'mongoose';
import User from './User.js';
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) { console.error('Usage: npm run make-admin --workspace server -- your-email@example.com'); process.exit(1); }
if (!process.env.MONGODB_URI) { console.error('Set server/.env MONGODB_URI first'); process.exit(1); }
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate({ email }, { $set: { role: 'admin' } }, { new: true });
  if (!user) { console.error('Account not found. Register on the website first.'); process.exitCode = 1; }
  else console.log('Administrator role granted to the registered account. Refresh the website.');
} catch { console.error('Unable to update account. Check the database connection.'); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
