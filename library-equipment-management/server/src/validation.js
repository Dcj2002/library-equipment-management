export const categories = ['Computer', 'Projector', 'Printer', 'Scanner', 'Audio', 'Other',
  'Books - Mathematics', 'Books - Electronics', 'Books - Civil Engineering',
  'Books - Mechanical Engineering', 'Books - Computer Engineering'];
export const photoKeys = ['', 'computer', 'headphones', 'printer', 'projector', 'scanner', 'none', 'book-mathematics', 'book-electronics', 'book-civil-engineering', 'book-mechanical-engineering', 'book-computer-engineering'];
export const conditions = ['Good', 'Fair', 'Needs repair'];
export function validateEquipment(body) {
  const errors = [];
  const clean = {};
  for (const [key, max] of Object.entries({ name: 100, assetTag: 40, category: 30, location: 100, condition: 30, notes: 500 })) {
    if (typeof body[key] !== 'string') { errors.push(`${key} must be text`); continue; }
    clean[key] = body[key].trim();
    if ((key !== 'notes' && !clean[key]) || clean[key].length > max) errors.push(`${key} is required and must be at most ${max} characters`);
  }
  if (body.photoKey !== undefined) {
    if (typeof body.photoKey !== 'string' || !photoKeys.includes(body.photoKey)) errors.push('Choose a valid equipment photo');
    else clean.photoKey = body.photoKey;
  }
  if (!categories.includes(clean.category)) errors.push('Choose a valid category');
  if (!conditions.includes(clean.condition)) errors.push('Choose a valid condition');
  if (clean.assetTag && !/^[A-Za-z0-9-]+$/.test(clean.assetTag)) errors.push('Asset tag: use letters, numbers and hyphens');
  if (clean.assetTag) clean.assetTag = clean.assetTag.toUpperCase();
  return { errors, clean };
}
export function validateLoan(body) {
  const borrower = typeof body.borrower === 'string' ? body.borrower.trim() : '';
  const borrowerId = typeof body.borrowerId === 'string' ? body.borrowerId.trim() : '';
  const dueDate = new Date(body.dueDate);
  const errors = [];
  if (!borrower || borrower.length > 100) errors.push('Borrower name is required (maximum 100 characters)');
  if (!borrowerId || borrowerId.length > 50) errors.push('Borrower ID is required (maximum 50 characters)');
  if (!Number.isFinite(dueDate.getTime()) || dueDate <= new Date()) errors.push('Due date must be in the future');
  return { errors, loan: { borrower, borrowerId, dueDate, issuedAt: new Date() } };
}
