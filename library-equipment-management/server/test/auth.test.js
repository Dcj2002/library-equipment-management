import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/passwords.js';
import { registrationInput, profileInput, publicUser } from '../src/auth-validation.js';
import { requireAdmin } from '../src/auth.js';

test('password hashes use random salts and reject incorrect passwords', async () => {
  const a = await hashPassword('A valid example password');
  const b = await hashPassword('A valid example password');
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('A valid example password', a), true);
  assert.equal(await verifyPassword('wrong', a), false);
  assert.equal(await verifyPassword('wrong', 'malformed'), false);
});
test('registration normalizes identity and excludes elevated fields', () => {
  const result = registrationInput({ name: ' Nimal ', email: 'NIMAL@EXAMPLE.COM ', memberId: ' st-1 ', password: 'long enough password', role: 'admin', passwordHash: 'injected' });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.clean, { name: 'Nimal', email: 'nimal@example.com', memberId: 'ST-1' });
});
test('registration rejects weak passwords, invalid IDs and object input', () => {
  assert.equal(registrationInput({ name: { $ne: null }, email: 'invalid', memberId: '<id>', password: 'short' }).errors.length, 4);
});
test('profile update allowlist cannot change role, password or member ID', () => {
  const result = profileInput({ name: 'Nimal', email: 'nimal@example.com', role: 'admin', memberId: 'someone-else', passwordHash: 'x' });
  assert.deepEqual(result.clean, { name: 'Nimal', email: 'nimal@example.com' });
});
test('public account response excludes password material', () => {
  const result = publicUser({ _id: 'abc', name: 'Nimal', email: 'n@example.com', memberId: 'S1', role: 'user', passwordHash: 'secret' });
  assert.equal(result.passwordHash, undefined);
});
test('server-side administrator guard rejects users', () => {
  let code, message, called = false;
  const res = { status(v) { code = v; return this; }, json(v) { message = v; } };
  requireAdmin({ user: { role: 'user' } }, res, () => { called = true; });
  assert.equal(code, 403); assert.equal(called, false); assert.ok(message.message);
  requireAdmin({ user: { role: 'admin' } }, res, () => { called = true; });
  assert.equal(called, true);
});
