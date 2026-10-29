// HTTP route tests use in-memory model substitutes, not a real MongoDB server.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { app } from '../src/app.js';
import User from '../src/User.js';
import Session from '../src/Session.js';
import Equipment from '../src/Equipment.js';

test('HTTP auth flow, role boundaries, borrower privacy, and logout invalidation', async t => {
  const users = new Map(), sessions = new Map();
  let nextId = 1;
  const id = () => String(nextId++).padStart(24, '0');
  const query = value => ({ select: async () => value, lean: async () => value, sort() { return this; } });
  t.mock.method(User, 'create', async data => {
    if ([...users.values()].some(u => u.email === data.email || u.memberId === data.memberId)) {
      const e = new Error('duplicate'); e.code = 11000; e.keyPattern = { email: 1 }; throw e;
    }
    const user = { ...data, _id: id(), createdAt: new Date() }; users.set(user._id, user); return user;
  });
  t.mock.method(User, 'findOne', filter => query([...users.values()].find(u => u.email === filter.email) || null));
  t.mock.method(User, 'findById', value => query(users.get(String(value)) || null));
  t.mock.method(User, 'findByIdAndUpdate', async (value, update) => { const user = users.get(String(value)); Object.assign(user, update.$set); return user; });
  t.mock.method(Session, 'create', async data => { sessions.set(data.tokenHash, data); return data; });
  t.mock.method(Session, 'findOne', filter => query(sessions.get(filter.tokenHash)?.expiresAt > filter.expiresAt.$gt ? sessions.get(filter.tokenHash) : null));
  t.mock.method(Session, 'deleteOne', async filter => { sessions.delete(filter.tokenHash); });
  let capturedFilter;
  t.mock.method(Equipment, 'find', filter => { capturedFilter = filter; return query([{ _id: '123456789012345678901234', name: 'Projector', notes: 'private', loan: { userId: '999999999999999999999999', borrower: 'Another member', borrowerId: 'PRIVATE', dueDate: new Date(Date.now()+86400000), issuedAt: new Date() } }]); });
  const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function send(path, method='GET', body, cookie='', origin='http://localhost:5173') {
    const response = await fetch(base + '/api' + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie') };
  }
  assert.equal((await send('/equipment')).status, 401);
  assert.equal((await send('/auth/register', 'POST', {}, '', 'https://untrusted.example')).status, 403);
  const register = await send('/auth/register', 'POST', { name: 'Nimal', email: 'nimal@example.com', memberId: 'S1', password: 'valid long password', role: 'admin' });
  assert.equal(register.status, 201); assert.equal(register.data.user.role, 'user'); assert.equal(register.data.user.passwordHash, undefined);
  assert.match(register.cookie, /HttpOnly/); assert.match(register.cookie, /SameSite=Strict/);
  let cookie = register.cookie.split(';')[0];
  assert.notEqual([...users.values()][0].passwordHash, 'valid long password');
  assert.ok(sessions.has(createHash('sha256').update(cookie.split('=')[1]).digest('hex')));
  assert.equal((await send('/auth/register', 'POST', { name: 'Nimal', email: 'nimal@example.com', memberId: 'S1', password: 'valid long password' })).status, 409);
  assert.equal((await send('/auth/login', 'POST', { email: 'nimal@example.com', password: 'wrong' })).status, 401);
  assert.equal((await send('/auth/login', 'POST', { email: 'nobody@example.com', password: 'wrong' })).status, 401);
  const login = await send('/auth/login', 'POST', { email: 'NIMAL@example.com', password: 'valid long password' }, cookie);
  assert.equal(login.status, 200);
  const oldCookie = cookie; cookie = login.cookie.split(';')[0];
  assert.notEqual(cookie, oldCookie);
  assert.equal((await send('/auth/me', 'GET', null, oldCookie)).status, 401);
  assert.equal((await send('/auth/me', 'GET', null, cookie)).data.user.name, 'Nimal');
  for (const [path, method] of [['/equipment','POST'],['/equipment/123456789012345678901234','PUT'],['/equipment/123456789012345678901234','DELETE'],['/equipment/123456789012345678901234/issue','POST'],['/equipment/123456789012345678901234/return','POST']]) {
    assert.equal((await send(path, method, { revision: 0 }, cookie)).status, 403);
  }
  assert.equal((await send('/auth/members', 'GET', null, cookie)).status, 403);
  const updated = await send('/auth/me', 'PUT', { name: 'Nimal Updated', email: 'new@example.com', role: 'admin', memberId: 'STOLEN' }, cookie);
  assert.equal(updated.data.user.name, 'Nimal Updated'); assert.equal(updated.data.user.role, 'user'); assert.equal(updated.data.user.memberId, 'S1');
  const inventory = await send('/equipment', 'GET', null, cookie);
  assert.equal(inventory.status, 200); assert.equal(inventory.data[0].loan.borrower, undefined); assert.equal(inventory.data[0].loan.borrowerId, undefined);
  await send('/auth/my-borrowings', 'GET', null, cookie);
  assert.equal(String(capturedFilter['loan.userId']), register.data.user._id);
  assert.equal((await send('/auth/logout', 'POST', {}, cookie)).status, 200);
  assert.equal((await send('/auth/me', 'GET', null, cookie)).status, 401);
});
