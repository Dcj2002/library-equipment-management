import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { request } from './api.js';
import { SessionGate } from './Account.jsx';
const categories = ['Computer', 'Projector', 'Printer', 'Scanner', 'Audio', 'Other'];
const conditions = ['Good', 'Fair', 'Needs repair'];
const empty = { name: '', assetTag: '', category: 'Computer', location: '', condition: 'Good', notes: '' };
function status(item) { return item.loan ? (new Date(item.loan.dueDate) < new Date() ? 'Overdue' : 'Issued') : item.condition === 'Needs repair' ? 'Maintenance' : 'Available'; }
function App({ user, onHome, onProfile, onBorrowings, onLogout }) {
  const admin = user.role === 'admin';
  const [members, setMembers] = useState([]), [membersLoading, setMembersLoading] = useState(false);
  const [items, setItems] = useState([]), [all, setAll] = useState([]);
  const [query, setQuery] = useState(''), [category, setCategory] = useState(''), [filter, setFilter] = useState(''), [sort, setSort] = useState('newest');
  const [modal, setModal] = useState(null), [form, setForm] = useState(empty);
  const [error, setError] = useState(''), [formError, setFormError] = useState(''), [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const qs = new URLSearchParams({ q: query, category, status: filter, sort });
        const [list, inventory] = await Promise.all([request('/equipment?' + qs, 'GET', null, controller.signal), request('/equipment', 'GET', null, controller.signal)]);
        setItems(list); setAll(inventory);
      } catch (e) { if (e.name !== 'AbortError') setError(e.message === 'Failed to fetch' ? 'Cannot reach API. Start the backend and MongoDB, then retry.' : e.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, category, filter, sort, refresh]);
  useEffect(() => {
    if (!modal) return;
    const old = document.activeElement;
    const first = document.querySelector('dialog input, dialog button'); first?.focus();
    return () => old?.focus();
  }, [modal]);
  useEffect(() => {
    if (modal?.type !== 'issue') return;
    const controller = new AbortController(); setMembersLoading(true); setMembers([]);
    request('/auth/members', 'GET', null, controller.signal).then(setMembers).catch(e => { if (e.name !== 'AbortError') setFormError(e.message); }).finally(() => { if (!controller.signal.aborted) setMembersLoading(false); });
    return () => controller.abort();
  }, [modal]);
  function open(type, item) {
    setFormError(''); setNotice('');
    setForm(type === 'issue' ? { userId: '', dueDate: '' } : item ? { ...item } : { ...empty });
    setModal({ type, item });
  }
  async function act(path, method, body, message) {
    setBusy(true); setFormError('');
    try { await request(path, method, body); setModal(null); setNotice(message); setRefresh(x => x + 1); }
    catch (e) { setFormError(e.message); }
    finally { setBusy(false); }
  }
  function save(e) {
    e.preventDefault();
    const { type, item } = modal;
    if (type === 'issue') {
      const date = new Date(form.dueDate);
      if (!Number.isFinite(date.getTime()) || date <= new Date()) { setFormError('Choose a future due date.'); return; }
      return act('/equipment/' + item._id + '/issue', 'POST', { ...form, dueDate: date.toISOString(), revision: item.revision }, 'Equipment issued successfully.');
    }
    act('/equipment' + (item ? '/' + item._id : ''), item ? 'PUT' : 'POST', form, item ? 'Equipment updated.' : 'Equipment added.');
  }
  const field = (key, label, max, type = 'text') => <label key={key}>{label}<input type={type} required maxLength={max} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>;
  const available = all.filter(x => status(x) === 'Available').length;
  return <div className="app">
    <aside><a className="brand" href="#"><span className="logo">L</span><span>LIBRARY<span className="brand-small">Equipment management</span></span></a><div className="workspace">WORKSPACE</div><button className="nav active" onClick={() => { setFilter(''); setQuery(''); setCategory(''); }}>▦ &nbsp; Equipment overview</button><div className="aside-note">A place for everything.<br/><strong>Keep your library connected.</strong><p>Inventory & borrowing workspace</p></div></aside>
    <main><header><span>Workspace <span className="slash">/</span> Equipment overview</span><div className="account-controls"><button onClick={onHome}>Home</button><button onClick={onBorrowings}>My borrowings</button><button onClick={onProfile}>{user.name} · {admin ? 'Admin' : 'Profile'}</button><button onClick={onLogout}>Log out</button></div></header>
      <section className="heading"><div><div className="eyebrow">YOUR LIBRARY, ORGANIZED</div><h1>Library Equipment Management</h1><p>Track your equipment. Make every resource count.</p></div>{admin && <button className="primary" onClick={() => open('add')}>＋ Add equipment</button>}</section>
      <section className="stats" aria-label="Inventory summary">{[['Total equipment', all.length, 'Every asset in one place'], ['Available', available, 'Ready for the next borrower'], ['On loan', all.filter(x => x.loan).length, 'Currently checked out'], ['Overdue', all.filter(x => status(x) === 'Overdue').length, 'Follow up on these returns']].map(([label, number, detail], i) => <article className={'stat stat-' + i} key={label}><span>{label}</span><strong>{number}</strong><small>{detail}</small></article>)}</section>
      {notice && <p className="success" role="status">{notice}</p>}
      <section className="inventory"><div className="section-top"><div><h2>Equipment inventory</h2><p>Manage assets, availability and borrowing details.</p></div><button onClick={() => setRefresh(x => x + 1)}>↻ Refresh</button></div>
        <div className="toolbar"><label className="search"><span className="sr-only">Search equipment</span><input placeholder="Search name, asset tag or location…" value={query} onChange={e => setQuery(e.target.value)} /></label><label><span className="sr-only">Category</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label><span className="sr-only">Status</span><select value={filter} onChange={e => setFilter(e.target.value)}><option value="">All statuses</option>{['available', 'issued', 'overdue', 'maintenance'].map(s => <option value={s} key={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select></label><label><span className="sr-only">Sort</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="name">Name A–Z</option><option value="assetTag">Asset tag A–Z</option></select></label></div>
        {error ? <div className="empty error" role="alert">{error}<p><button onClick={() => setRefresh(x => x + 1)}>Retry connection</button></p></div> : loading ? <div className="empty" role="status">Loading your inventory…</div> : !items.length ? <div className="empty"><div className="empty-icon">▦</div><h3>{all.length ? 'No matching equipment' : 'Your inventory starts here'}</h3><p>{all.length ? 'Try a different search or filter.' : admin ? 'Add your first piece of equipment to get started.' : 'Equipment added by the library will appear here.'}</p>{!all.length && admin && <button className="primary" onClick={() => open('add')}>＋ Add equipment</button>}</div> : <div className="table-wrap"><table><thead><tr><th>Equipment</th><th>Category</th><th>Location</th><th>Status</th>{admin && <th>Actions</th>}</tr></thead><tbody>{items.map(item => <tr key={item._id}><td><button className="item-name" onClick={() => open('details', item)}>{item.name}</button><small className="tag">{item.assetTag}</small></td><td>{item.category}</td><td>{item.location}</td><td><span className={'badge ' + status(item).toLowerCase()}>{status(item)}</span>{item.loan && <small className="tag">Due {new Date(item.loan.dueDate).toLocaleDateString()}</small>}</td>{admin && <td><div className="actions"><button onClick={() => open('edit', item)}>Edit</button>{item.loan ? <button onClick={() => open('return', item)}>Return</button> : <button disabled={item.condition === 'Needs repair'} onClick={() => open('issue', item)}>Issue</button>}<button className="danger" disabled={!!item.loan} onClick={() => open('delete', item)} title={item.loan ? 'Return equipment before deleting' : 'Delete equipment'}>Delete</button></div></td>}</tr>)}</tbody></table></div>}
        <footer>{!error && !loading ? `${items.length} equipment item${items.length === 1 ? '' : 's'} shown` : 'Inventory workspace'}<span>One record per physical asset</span></footer>
      </section><p className="footnote">Library Equipment Management · Local academic project</p>
    </main>
    {modal && <dialog ref={el => { if (el && !el.open) el.showModal(); }} onCancel={e => { if (busy) e.preventDefault(); else setModal(null); }}><div className="modal-head"><h2>{{ add: 'Add equipment', edit: 'Edit equipment', issue: 'Issue equipment', return: 'Return equipment', delete: 'Delete equipment', details: 'Equipment details' }[modal.type]}</h2><button aria-label="Close dialog" disabled={busy} onClick={() => setModal(null)}>×</button></div>
      {formError && <p role="alert" className="error">{formError}</p>}
      {['add', 'edit', 'issue'].includes(modal.type) ? <form onSubmit={save}><fieldset disabled={busy || membersLoading}>{modal.type === 'issue' ? <><p>Issuing <strong>{modal.item.name}</strong></p><label>Registered borrower<select required value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}><option value="">{membersLoading ? 'Loading members…' : 'Select a member'}</option>{members.map(member => <option value={member._id} key={member._id}>{member.name} — {member.memberId}</option>)}</select></label>{!membersLoading && !members.length && <p>Ask the borrower to register an account first.</p>}{field('dueDate', 'Due date and time', undefined, 'datetime-local')}</> : <>{field('name', 'Equipment name', 100)}{field('assetTag', 'Unique asset tag (e.g. LIB-PC-001)', 40)}<label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>{field('location', 'Location', 100)}<label>Condition<select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>{conditions.map(c => <option key={c}>{c}</option>)}</select></label><label>Notes (optional)<textarea maxLength={500} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label></>}<div className="modal-actions"><button type="button" onClick={() => setModal(null)}>Cancel</button><button className="primary">{busy ? 'Saving…' : modal.type === 'issue' ? 'Confirm issue' : 'Save equipment'}</button></div></fieldset></form> : modal.type === 'details' ? <><dl>{[['Asset tag', form.assetTag], ['Category', form.category], ['Location', form.location], ['Condition', form.condition], ['Status', status(form)], ['Notes', form.notes || 'No notes'], ...(form.loan?.borrower ? [['Borrower', form.loan.borrower], ['Borrower ID', form.loan.borrowerId], ['Issued at', new Date(form.loan.issuedAt).toLocaleString()], ['Due date', new Date(form.loan.dueDate).toLocaleString()]] : [])].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></> : <><p>{modal.type === 'delete' ? 'Permanently delete' : 'Confirm return of'} <strong>{modal.item.name}</strong>?</p><p>{modal.type === 'delete' ? 'This removes the equipment record and cannot be undone.' : 'The current borrower details will be cleared. This version does not keep loan history.'}</p><div className="modal-actions"><button disabled={busy} onClick={() => setModal(null)}>Cancel</button><button className={modal.type === 'delete' ? 'danger solid' : 'primary'} disabled={busy} onClick={() => act('/equipment/' + modal.item._id + (modal.type === 'return' ? '/return' : ''), modal.type === 'return' ? 'POST' : 'DELETE', { revision: modal.item.revision }, modal.type === 'return' ? 'Equipment returned.' : 'Equipment deleted.')}>{busy ? 'Please wait…' : 'Confirm ' + modal.type}</button></div></>}
    </dialog>}
  </div>;
}
createRoot(document.getElementById('root')).render(<SessionGate Inventory={App} />);
