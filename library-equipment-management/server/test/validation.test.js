import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEquipment, validateLoan } from '../src/validation.js';
const item = { name: ' Projector ', assetTag: 'pr-01', category: 'Projector', location: 'Room A', condition: 'Good', notes: '' };
test('normalizes fields and asset tag', () => {
  const result = validateEquipment(item); assert.deepEqual(result.errors, []); assert.equal(result.clean.name, 'Projector'); assert.equal(result.clean.assetTag, 'PR-01');
});
test('rejects missing fields, invalid enums and object injection', () => {
  assert.ok(validateEquipment({ ...item, name: '', category: 'Unknown', location: { $ne: null } }).errors.length >= 3);
});
test('rejects unsafe asset tag and overlong notes', () => {
  assert.ok(validateEquipment({ ...item, assetTag: '<tag>', notes: 'x'.repeat(501) }).errors.length >= 2);
});
test('rejects past and invalid loan dates and missing borrower', () => {
  assert.ok(validateLoan({ borrower: '', borrowerId: '', dueDate: 'invalid' }).errors.length === 3);
  assert.ok(validateLoan({ borrower: 'Nimal', borrowerId: 'S1', dueDate: '2000-01-01' }).errors.length);
});
test('accepts future loan and ignores untrusted additional fields', () => {
  const r = validateLoan({ borrower: 'Nimal', borrowerId: 'S1', dueDate: new Date(Date.now()+86400000).toISOString(), admin: true });
  assert.deepEqual(r.errors, []); assert.equal(r.loan.admin, undefined);
});

test('accepts photo choices and keeps legacy requests compatible', () => {
  for (const photoKey of ['', 'computer', 'headphones', 'printer', 'projector', 'scanner', 'none']) {
    const result = validateEquipment({ ...item, photoKey });
    assert.deepEqual(result.errors, []);
    assert.equal(result.clean.photoKey, photoKey);
  }
  assert.equal(Object.hasOwn(validateEquipment(item).clean, 'photoKey'), false);
});
test('rejects arbitrary photo paths and non-string values', () => {
  for (const photoKey of ['../../secret', 'https://example.com/photo.jpg', { $ne: null }, 1]) {
    assert.ok(validateEquipment({ ...item, photoKey }).errors.includes('Choose a valid equipment photo'));
  }
});
