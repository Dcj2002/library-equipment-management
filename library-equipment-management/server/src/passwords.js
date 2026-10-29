import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
// A memory-hard salted password hash. Algorithm parameters are versioned in the stored hash.
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64, options);
  return `scrypt-v1:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [version, salt, hex] = (encoded || '').split(':');
  if (version !== 'scrypt-v1' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  const key = await derive(password, salt, 64, options);
  return timingSafeEqual(key, Buffer.from(hex, 'hex'));
}
