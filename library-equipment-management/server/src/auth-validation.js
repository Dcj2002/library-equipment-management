export function profileInput(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const errors = [];
  if (!name || name.length > 100) errors.push('Name is required (maximum 100 characters)');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Enter a valid email address');
  return { errors, clean: { name, email } };
}
export function registrationInput(body = {}) {
  const { errors, clean } = profileInput(body);
  const memberId = typeof body.memberId === 'string' ? body.memberId.trim().toUpperCase() : '';
  if (!/^[A-Z0-9-]{1,50}$/.test(memberId)) errors.push('Student/staff ID: use 1–50 letters, numbers or hyphens');
  if (typeof body.password !== 'string' || body.password.length < 12 || body.password.length > 128) errors.push('Password must contain 12–128 characters');
  // Explicit allowlist: role supplied by a browser is never accepted.
  return { errors, clean: { ...clean, memberId } };
}
export function publicUser(user) {
  return { _id: String(user._id), name: user.name, email: user.email, memberId: user.memberId, role: user.role, createdAt: user.createdAt };
}
