import React, { useEffect, useState } from 'react';
import { request } from './api.js';
import HomePage from './HomePage.jsx';
function AuthForm({ onLogin, initialMode, onHome, onSwitch }) {
  const mode = initialMode;
  const [form, setForm] = useState({ name: '', email: '', memberId: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const register = mode === 'register';
  function input(key, label, type, max, autoComplete) {
    return <label>{label}<input required type={type} maxLength={max} minLength={key === 'password' && register ? 12 : undefined} autoComplete={autoComplete} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>;
  }
  async function submit(e) {
    e.preventDefault(); setError('');
    if (register && form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setBusy(true);
    try {
      const body = register ? { name: form.name, email: form.email, memberId: form.memberId, password: form.password } : { email: form.email, password: form.password };
      const result = await request('/auth/' + mode, 'POST', body);
      onLogin(result.user);
    } catch (e) { setError(e.message === 'Failed to fetch' ? 'Cannot connect. Start the backend and open http://localhost:5173.' : e.message); }
    finally { setBusy(false); }
  }
  return <div className="auth-page"><section className="auth-intro"><span className="logo">L</span><div className="eyebrow">LIBRARY EQUIPMENT MANAGEMENT</div><h1>Your library.<br/>Your resources.<br/>One workspace.</h1><p>Find equipment, manage your profile and keep track of what you borrow.</p></section><section className="auth-card"><button className="auth-back" onClick={onHome}>← Home</button><h2>{register ? 'Create your account' : 'Welcome back'}</h2><p>{register ? 'Register as a library member to get started.' : 'Log in to your library workspace.'}</p>{error && <p className="error" role="alert">{error}</p>}<form onSubmit={submit}><fieldset disabled={busy}>{register && input('name', 'Full name', 'text', 100, 'name')}{input('email', 'Email address', 'email', 254, 'email')}{register && input('memberId', 'Student / staff ID (letters, numbers, hyphens)', 'text', 50, 'off')}{input('password', register ? 'Password (12–128 characters)' : 'Password', 'password', 128, register ? 'new-password' : 'current-password')}{register && input('confirm', 'Confirm password', 'password', 128, 'new-password')}<button className="primary auth-submit">{busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}</button></fieldset></form><p className="auth-switch">{register ? 'Already registered?' : 'New to the library?'} <button disabled={busy} onClick={() => { onSwitch(register ? 'login' : 'register'); setError(''); setForm({ ...form, password: '', confirm: '' }); }}>{register ? 'Log in' : 'Create an account'}</button></p></section></div>;
}
function Profile({ user, onChange }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  async function save(e) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const result = await request('/auth/me', 'PUT', form); onChange(result.user); setMessage('Profile updated.'); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <section className="profile-card"><div className="profile-summary"><span className="profile-avatar">{user.name[0]?.toUpperCase()}</span><div><h2>{user.name}</h2><span className="badge available">{user.role === 'admin' ? 'Administrator' : 'Library member'}</span></div></div>{error && <p className="error" role="alert">{error}</p>}{message && <p className="success" role="status">{message}</p>}<form onSubmit={save}><fieldset disabled={busy}><label>Full name<input required maxLength={100} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Email<input type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Student / staff ID<input value={user.memberId} readOnly /></label><p>Member ID stays fixed so borrowing records remain consistent.</p><button className="primary">{busy ? 'Saving…' : 'Save profile'}</button></fieldset></form></section>;
}
function Borrowings() {
  const [items, setItems] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    request('/auth/my-borrowings', 'GET', null, controller.signal).then(setItems).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  return <section className="inventory"><div className="section-top"><div><h2>My current borrowings</h2><p>Ask a library administrator to issue or return equipment.</p></div><button onClick={() => setRefresh(x => x + 1)}>Refresh</button></div>{error ? <p className="error" role="alert">{error}</p> : loading ? <p className="empty">Loading borrowings…</p> : !items.length ? <p className="empty">You have no equipment on loan.</p> : <div className="table-wrap"><table><thead><tr><th>Equipment</th><th>Asset tag</th><th>Due date</th><th>Status</th></tr></thead><tbody>{items.map(item => { const overdue = new Date(item.loan.dueDate) < new Date(); return <tr key={item._id}><td>{item.name}</td><td>{item.assetTag}</td><td>{new Date(item.loan.dueDate).toLocaleString()}</td><td><span className={'badge ' + (overdue ? 'overdue' : 'issued')}>{overdue ? 'Overdue' : 'Issued'}</span></td></tr>; })}</tbody></table></div>}</section>;
}
const pages = ['home', 'login', 'register', 'workspace', 'profile', 'borrowings'];
function currentPage() {
  const route = window.location.hash.slice(1);
  return pages.includes(route) ? route : 'home';
}
export function SessionGate({ Inventory }) {
  const [user, setUser] = useState(null), [checking, setChecking] = useState(true), [error, setError] = useState(''), [page, setPage] = useState(currentPage), [retry, setRetry] = useState(0);
  function navigate(next) { window.location.hash = next; setPage(next); }
  useEffect(() => {
    function routeChanged() {
      const hash = window.location.hash.slice(1);
      // Section anchors belong to the home page and keep their scroll position.
      if (pages.includes(hash)) { setPage(hash); window.scrollTo(0, 0); }
      else if (['features', 'how-it-works', 'home-top', 'home-content', 'equipment-categories'].includes(hash)) setPage('home');
      else { setPage('home'); window.scrollTo(0, 0); }
    }
    window.addEventListener('hashchange', routeChanged);
    return () => window.removeEventListener('hashchange', routeChanged);
  }, []);
  useEffect(() => {
    const controller = new AbortController(); setChecking(true); setError('');
    request('/auth/me', 'GET', null, controller.signal).then(data => setUser(data.user)).catch(e => { if (e.name !== 'AbortError' && e.status !== 401) setError('Cannot connect to the API. Start the backend and MongoDB, then retry.'); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    function expire() { setUser(null); navigate('login'); }
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, []);
  useEffect(() => {
    if (user && !checking && ['login', 'register'].includes(page)) navigate('workspace');
  }, [user, checking, page]);
  async function logout() {
    try { await request('/auth/logout', 'POST', {}); setUser(null); navigate('home'); setError(''); }
    catch { window.alert('Logout failed. Check the API and try again.'); }
  }
  // The introduction remains readable when the API is offline or a session check is pending.
  if (page === 'home') return <HomePage user={user} />;
  if (checking) return <div className="empty">Opening your workspace…</div>;
  if (error) return <div className="empty error" role="alert">{error}<p><button onClick={() => setRetry(x => x + 1)}>Retry</button> <button onClick={() => navigate('home')}>Back to home</button></p></div>;
  if (!user) return <AuthForm key={page === 'register' ? 'register' : 'login'} initialMode={page === 'register' ? 'register' : 'login'} onHome={() => navigate('home')} onSwitch={navigate} onLogin={value => { setUser(value); navigate('workspace'); }} />;
  if (page === 'workspace' || page === 'login' || page === 'register') return <Inventory user={user} onHome={() => navigate('home')} onProfile={() => navigate('profile')} onBorrowings={() => navigate('borrowings')} onLogout={logout} />;
  return <main className="account-page"><header><div className="actions"><button onClick={() => navigate('home')}>Home</button><button onClick={() => navigate('workspace')}>← Equipment overview</button></div><button onClick={logout}>Log out</button></header><section className="heading"><div><div className="eyebrow">YOUR LIBRARY ACCOUNT</div><h1>{page === 'profile' ? 'My profile' : 'My borrowings'}</h1></div><div className="actions"><button onClick={() => navigate('profile')}>My profile</button><button onClick={() => navigate('borrowings')}>My borrowings</button></div></section>{page === 'profile' ? <Profile user={user} onChange={setUser} /> : <Borrowings />}</main>;
}
