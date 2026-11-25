import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './admin.css';

const tokenKey = 'manasa_admin_token';
const getToken = () => { try { return localStorage.getItem(tokenKey); } catch { return null; } };
const setToken = (t) => { try { t ? localStorage.setItem(tokenKey, t) : localStorage.removeItem(tokenKey); } catch { /* ignore */ } };

async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { Authorization: `Bearer ${getToken() || ''}` };
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') { setToken(null); window.location.href = '/admin/login'; }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const toForm = (obj, file, fileField) => {
  const f = new FormData();
  Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null) f.append(k, String(v)); });
  if (file) f.append(fileField, file);
  return f;
};

/* ------------------------------ login ------------------------------ */
function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { const d = await api('/auth/login', { method: 'POST', body: { email, password } }); setToken(d.token); nav('/admin'); }
    catch (er) { setErr(er.message); } finally { setBusy(false); }
  }
  return (
    <div className="ad-login">
      <form className="ad-card" onSubmit={submit}>
        <Brand />
        <p className="ad-mute">Sign in to manage the Manasa website.</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <p className="ad-err">{err}</p>}
        <button className="ad-btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

function Brand() {
  return (
    <div className="ad-brand">
      <span className="wm"><i /><i /><i /></span>
      <span><b>Manasa</b><small>Admin</small></span>
    </div>
  );
}

/* ------------------------------ layout ------------------------------ */
function Shell({ children }) {
  const nav = useNavigate();
  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <Brand />
        <nav>
          <NavLink to="/admin" end>Overview</NavLink>
          <NavLink to="/admin/leads">Leads</NavLink>
          <NavLink to="/admin/templates">Templates</NavLink>
          <NavLink to="/admin/clients">Clients</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
        <a className="ad-site" href="/" target="_blank" rel="noreferrer">Open website</a>
        <button className="ad-btn ghost" onClick={() => { setToken(null); nav('/admin/login'); }}>Sign out</button>
      </aside>
      <main className="ad-main">{children}</main>
    </div>
  );
}

/* ------------------------------ overview ------------------------------ */
function Overview() {
  const [o, setO] = useState(null);
  useEffect(() => { api('/admin/overview').then(setO).catch(() => {}); }, []);
  return (
    <>
      <h1>Overview</h1>
      <div className="ad-stats">
        <Stat n={o?.leads_new} label="New leads" to="/admin/leads" />
        <Stat n={o?.leads_total} label="All leads" />
        <Stat n={o?.leads_won} label="Won" />
        <Stat n={o?.templates} label="Templates" to="/admin/templates" />
        <Stat n={o?.clients} label="Client logos" to="/admin/clients" />
      </div>
    </>
  );
}
function Stat({ n, label, to }) {
  const body = <><b>{n ?? '–'}</b><span>{label}</span></>;
  return to ? <NavLink className="ad-stat" to={to}>{body}</NavLink> : <div className="ad-stat">{body}</div>;
}

/* ------------------------------ leads ------------------------------ */
const STATUS = { new: 'New', contacted: 'Contacted', won: 'Won', lost: 'Lost' };
function Leads() {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const load = () => api(`/admin/leads?status=${status}&q=${encodeURIComponent(q)}`).then((d) => setLeads(d.leads)).catch(() => {});
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [status, q]);

  async function update(l, patch) {
    const { lead } = await api(`/admin/leads/${l.id}`, { method: 'PATCH', body: patch });
    setLeads((ls) => ls.map((x) => (x.id === lead.id ? lead : x)));
  }
  async function remove(l) {
    if (!confirm(`Delete the lead from ${l.name}?`)) return;
    await api(`/admin/leads/${l.id}`, { method: 'DELETE' });
    setLeads((ls) => ls.filter((x) => x.id !== l.id)); setOpen(null);
  }
  async function exportCsv() {
    const res = await fetch('/api/admin/leads.csv', { headers: { Authorization: `Bearer ${getToken()}` } });
    const a = document.createElement('a'); a.href = URL.createObjectURL(await res.blob()); a.download = 'manasa-leads.csv'; a.click();
  }

  return (
    <>
      <div className="ad-head"><h1>Leads</h1><button className="ad-btn" onClick={exportCsv}>Export CSV</button></div>
      <div className="ad-filters">
        <input placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="ad-seg">
          <button className={!status ? 'on' : ''} onClick={() => setStatus('')}>All</button>
          {Object.entries(STATUS).map(([k, v]) => <button key={k} className={status === k ? 'on' : ''} onClick={() => setStatus(k)}>{v}</button>)}
        </div>
      </div>
      <div className="ad-card flush">
        {leads.length === 0 ? <p className="ad-empty">No leads yet. Messages from the website contact form appear here.</p> : (
          <table className="ad-table">
            <thead><tr><th>Name</th><th>Contact</th><th>Business</th><th>Received</th><th>Status</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className={open === l.id ? 'sel' : ''} onClick={() => setOpen(open === l.id ? null : l.id)}>
                  <td><b>{l.name}</b>{!l.email_sent && <span className="ad-tag warn" title="Email notification was not sent">no email</span>}</td>
                  <td className="ltr">{l.phone}<small>{l.email}</small></td>
                  <td>{l.business}</td>
                  <td>{new Date(l.created_at.replace(' ', 'T') + 'Z').toLocaleString()}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select value={l.status} onChange={(e) => update(l, { status: e.target.value })} className={`st-${l.status}`}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {open && (() => {
        const l = leads.find((x) => x.id === open);
        if (!l) return null;
        const wa = l.phone.replace(/[^\d]/g, '');
        return (
          <div className="ad-card ad-detail">
            <div className="ad-head"><h2>{l.name}</h2><button className="ad-btn ghost" onClick={() => setOpen(null)}>Close</button></div>
            {l.message && <p className="ad-msg">{l.message}</p>}
            <div className="ad-row">
              {wa && <a className="ad-btn primary" href={`https://wa.me/${wa.length === 8 ? '965' + wa : wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
              {l.phone && <a className="ad-btn" href={`tel:${l.phone}`}>Call</a>}
              {l.email && <a className="ad-btn" href={`mailto:${l.email}`}>Email</a>}
              <button className="ad-btn danger" onClick={() => remove(l)}>Delete</button>
            </div>
            <label>Notes<textarea rows={4} defaultValue={l.notes} onBlur={(e) => e.target.value !== l.notes && update(l, { notes: e.target.value })} placeholder="Call summary, quote sent, follow-up date…" /></label>
            <p className="ad-mute small">Notes save when you click outside the box.</p>
          </div>
        );
      })()}
    </>
  );
}

/* ------------------------------ templates ------------------------------ */
const EMPTY_TPL = { name_en: '', name_ar: '', category_en: '', category_ar: '', demo_url: '', visible: true };
function Templates() {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null); // object being edited (id or new)
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api('/admin/templates').then((d) => setItems(d.templates));
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault(); setErr('');
    try {
      const { id, image_url, image, sort_order, ...fields } = edit;
      const form = toForm(fields, file, 'image');
      if (id) await api(`/admin/templates/${id}`, { method: 'PUT', form });
      else await api('/admin/templates', { method: 'POST', form });
      setEdit(null); setFile(null); load();
    } catch (er) { setErr(er.message); }
  }
  async function remove(t) {
    if (!confirm(`Delete template "${t.name_en}"?`)) return;
    await api(`/admin/templates/${t.id}`, { method: 'DELETE' }); load();
  }
  async function move(i, d) {
    const ids = items.map((x) => x.id); const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await api('/admin/templates/reorder', { method: 'POST', body: { ids } }); load();
  }
  async function toggle(t) {
    await api(`/admin/templates/${t.id}`, { method: 'PUT', form: toForm({ visible: !t.visible }) }); load();
  }

  return (
    <>
      <div className="ad-head"><h1>Templates</h1><button className="ad-btn primary" onClick={() => { setEdit({ ...EMPTY_TPL }); setFile(null); }}>Add template</button></div>
      {edit && (
        <form className="ad-card ad-form" onSubmit={save}>
          <h2>{edit.id ? 'Edit template' : 'New template'}</h2>
          <div className="ad-grid2">
            <label>Name (English) *<input value={edit.name_en} onChange={(e) => setEdit({ ...edit, name_en: e.target.value })} required /></label>
            <label>Name (Arabic)<input dir="rtl" value={edit.name_ar} onChange={(e) => setEdit({ ...edit, name_ar: e.target.value })} /></label>
            <label>Category (English)<input value={edit.category_en} onChange={(e) => setEdit({ ...edit, category_en: e.target.value })} placeholder="Perfumes" /></label>
            <label>Category (Arabic)<input dir="rtl" value={edit.category_ar} onChange={(e) => setEdit({ ...edit, category_ar: e.target.value })} placeholder="عطور" /></label>
            <label>Demo link<input value={edit.demo_url} onChange={(e) => setEdit({ ...edit, demo_url: e.target.value })} placeholder="https://…" /></label>
            <label>Screenshot (16:10, at least 1600 px wide)<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></label>
          </div>
          <label className="ad-check"><input type="checkbox" checked={edit.visible} onChange={(e) => setEdit({ ...edit, visible: e.target.checked })} />Show on website</label>
          {err && <p className="ad-err">{err}</p>}
          <div className="ad-row"><button className="ad-btn primary">Save template</button><button type="button" className="ad-btn ghost" onClick={() => setEdit(null)}>Cancel</button></div>
        </form>
      )}
      <div className="ad-tiles">
        {items.map((t, i) => (
          <div className={`ad-tile ${t.visible ? '' : 'off'}`} key={t.id}>
            {t.image_url ? <img src={t.image_url} alt="" /> : <div className="ad-noimg">No screenshot</div>}
            <div className="ad-tile-body">
              <b>{t.name_en}</b><span dir="rtl">{t.name_ar}</span>
              <small>{t.category_en}{t.visible ? '' : ' (hidden)'}</small>
            </div>
            <div className="ad-tile-actions">
              <button className="ad-btn sm" onClick={() => move(i, -1)} aria-label="Move earlier">↑</button>
              <button className="ad-btn sm" onClick={() => move(i, 1)} aria-label="Move later">↓</button>
              <button className="ad-btn sm" onClick={() => toggle(t)}>{t.visible ? 'Hide' : 'Show'}</button>
              <button className="ad-btn sm" onClick={() => { setEdit({ ...t }); setFile(null); window.scrollTo(0, 0); }}>Edit</button>
              <button className="ad-btn sm danger" onClick={() => remove(t)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------ clients ------------------------------ */
function Clients() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api('/admin/clients').then((d) => setItems(d.clients));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault(); setErr('');
    try { await api('/admin/clients', { method: 'POST', form: toForm(form, file, 'logo') }); setForm({ name: '', url: '' }); setFile(null); e.target.reset(); load(); }
    catch (er) { setErr(er.message); }
  }
  async function saveField(c, fields) { await api(`/admin/clients/${c.id}`, { method: 'PUT', form: toForm(fields) }); load(); }
  async function replaceLogo(c, f) { await api(`/admin/clients/${c.id}`, { method: 'PUT', form: toForm({}, f, 'logo') }); load(); }
  async function toggle(c) { await api(`/admin/clients/${c.id}`, { method: 'PUT', form: toForm({ visible: !c.visible }) }); load(); }
  async function remove(c) { if (!confirm(`Remove ${c.name}?`)) return; await api(`/admin/clients/${c.id}`, { method: 'DELETE' }); load(); }
  async function move(i, d) {
    const ids = items.map((x) => x.id); const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await api('/admin/clients/reorder', { method: 'POST', body: { ids } }); load();
  }

  return (
    <>
      <h1>Client logos</h1>
      <p className="ad-mute">Shown in the moving strip under the hero. PNG or SVG with a transparent background looks best.</p>
      <form className="ad-card ad-form inline" onSubmit={add}>
        <label>Client name *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Website<input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></label>
        <label>Logo<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></label>
        <button className="ad-btn primary">Add client</button>
        {err && <p className="ad-err">{err}</p>}
      </form>
      <div className="ad-logos">
        {items.length === 0 && <p className="ad-empty">No clients yet. The strip stays hidden on the website until you add one.</p>}
        {items.map((c, i) => (
          <div className={`ad-logo ${c.visible ? '' : 'off'}`} key={c.id}>
            <div className="ad-logo-img">{c.logo_url ? <img src={c.logo_url} alt="" /> : <span>{c.name}</span>}</div>
            <input defaultValue={c.name} aria-label="Client name" onBlur={(e) => e.target.value.trim() && e.target.value !== c.name && saveField(c, { name: e.target.value.trim() })} />
            <input defaultValue={c.url} placeholder="https://… (optional)" aria-label="Client website" onBlur={(e) => e.target.value !== c.url && saveField(c, { url: e.target.value.trim() })} />
            <div className="ad-row wrap">
              <button className="ad-btn sm" onClick={() => move(i, -1)} aria-label="Move earlier">↑</button>
              <button className="ad-btn sm" onClick={() => move(i, 1)} aria-label="Move later">↓</button>
              <label className="ad-btn sm">Logo<input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && replaceLogo(c, e.target.files[0])} /></label>
              <button className="ad-btn sm" onClick={() => toggle(c)}>{c.visible ? 'Hide' : 'Show'}</button>
              <button className="ad-btn sm danger" onClick={() => remove(c)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------ settings ------------------------------ */
const GROUPS = { payments: 'Payments', shipping: 'Delivery', marketing: 'Marketing', operations: 'Back office' };
function Settings() {
  const [s, setS] = useState(null);
  const [smtp, setSmtp] = useState(null);
  const [msg, setMsg] = useState(null);
  const [pw, setPw] = useState({ current: '', next: '' });
  useEffect(() => { api('/admin/settings').then((d) => { setS(d.settings); setSmtp(d.smtp); }); }, []);
  if (!s) return <h1>Settings</h1>;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    try { const d = await api('/admin/settings', { method: 'PUT', body: s }); setS(d.settings); setMsg({ ok: true, text: 'Settings saved. The website updates within a minute.' }); }
    catch (er) { setMsg({ ok: false, text: er.message }); }
  }
  async function testEmail() {
    try { const d = await api('/admin/test-email', { method: 'POST' }); setMsg({ ok: true, text: `Test email sent to ${d.to}.` }); }
    catch (er) { setMsg({ ok: false, text: `Email failed: ${er.message}` }); }
  }
  async function changePw(e) {
    e.preventDefault();
    try { await api('/auth/password', { method: 'POST', body: pw }); setPw({ current: '', next: '' }); setMsg({ ok: true, text: 'Password changed.' }); }
    catch (er) { setMsg({ ok: false, text: er.message }); }
  }

  return (
    <>
      <h1>Settings</h1>
      {msg && <p className={msg.ok ? 'ad-ok' : 'ad-err'}>{msg.text}</p>}
      <form className="ad-card ad-form" onSubmit={save}>
        <h2>Plan and contact</h2>
        <div className="ad-grid3">
          <label>Yearly price<input value={s.price} onChange={set('price')} inputMode="decimal" /></label>
          <label>Currency (English)<input value={s.currency_en} onChange={set('currency_en')} /></label>
          <label>Currency (Arabic)<input dir="rtl" value={s.currency_ar} onChange={set('currency_ar')} /></label>
          <label>WhatsApp number<input value={s.whatsapp} onChange={set('whatsapp')} placeholder="965xxxxxxxx" /></label>
          <label>Email shown on website<input value={s.contact_email} onChange={set('contact_email')} /></label>
          <label>Instagram link<input value={s.instagram} onChange={set('instagram')} placeholder="https://instagram.com/…" /></label>
        </div>
        <h2>Lead notifications</h2>
        <div className="ad-grid3">
          <label>Send new leads to<input value={s.leads_email} onChange={set('leads_email')} /></label>
          <div className="ad-smtp">
            <span className={smtp?.ok ? 'ad-tag ok' : 'ad-tag warn'}>{smtp?.ok ? 'Email sending is set up' : 'Email sending is not set up'}</span>
            {!smtp?.ok && <small>{smtp?.error}</small>}
            <button type="button" className="ad-btn sm" onClick={testEmail}>Send test email</button>
          </div>
        </div>
        <h2>Integrations shown on the website</h2>
        <p className="ad-mute small">One name per line.</p>
        <div className="ad-grid4">
          {Object.entries(GROUPS).map(([k, label]) => (
            <label key={k}>{label}
              <textarea rows={8} value={(s.integrations?.[k] || []).join('\n')}
                onChange={(e) => setS({ ...s, integrations: { ...s.integrations, [k]: e.target.value.split('\n') } })} />
            </label>
          ))}
        </div>
        <div className="ad-row"><button className="ad-btn primary">Save settings</button></div>
      </form>
      <form className="ad-card ad-form narrow" onSubmit={changePw}>
        <h2>Change password</h2>
        <label>Current password<input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></label>
        <label>New password<input type="password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></label>
        <div className="ad-row"><button className="ad-btn">Change password</button></div>
      </form>
    </>
  );
}

/* ------------------------------ router ------------------------------ */
// Reads the token at render time, so signing in takes effect immediately.
function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/admin/login" replace />;
}

export default function Admin() {
  useEffect(() => {
    document.documentElement.dir = 'ltr'; document.documentElement.lang = 'en';
    document.title = 'Manasa Admin';
  }, []);
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={<RequireAuth>
        <Shell>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="leads" element={<Leads />} />
            <Route path="templates" element={<Templates />} />
            <Route path="clients" element={<Clients />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Shell>
      </RequireAuth>} />
    </Routes>
  );
}
