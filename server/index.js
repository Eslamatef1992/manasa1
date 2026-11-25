require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env'), quiet: true });
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const { db, seed, getSettings, UPLOAD_DIR, ROOT } = require('./db');
const { sendLeadEmail, verifySmtp } = require('./mailer');

const PORT = process.env.PORT || 4100;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DIST = path.join(ROOT, 'dist');

seed();

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '1mb' }));

const fileUrl = (f) => (f ? `/uploads/${f}` : '');
const auth = (req, res, next) => {
  try { req.admin = jwt.verify((req.headers.authorization || '').replace(/^Bearer /, ''), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Please sign in again' }); }
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, f, cb) => cb(null, /^image\/(jpe?g|png|webp|gif|svg\+xml)$/i.test(f.mimetype)),
});
async function saveImage(file, prefix, { width, height, fit = 'inside' }) {
  const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
  await sharp(file.buffer, { density: 200 }).rotate().resize(width, height, { fit, withoutEnlargement: true, position: 'top' })
    .webp({ quality: 82 }).toFile(path.join(UPLOAD_DIR, name));
  return name;
}
const removeFile = (f) => f && fs.rm(path.join(UPLOAD_DIR, f), () => {});

// tiny in-memory rate limit for the public form: 5 per 10 minutes per IP
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

const api = express.Router();

/* ---------- public ---------- */
api.get('/health', (req, res) => res.json({ ok: true }));

api.get('/site', (req, res) => {
  const s = getSettings();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    settings: {
      price: s.price, currency_en: s.currency_en, currency_ar: s.currency_ar,
      whatsapp: s.whatsapp, instagram: s.instagram, contact_email: s.contact_email,
      integrations: s.integrations,
    },
    templates: db.prepare('SELECT * FROM templates WHERE visible = 1 ORDER BY sort_order, id').all()
      .map((t) => ({ ...t, image_url: fileUrl(t.image) })),
    clients: db.prepare('SELECT * FROM clients WHERE visible = 1 ORDER BY sort_order, id').all()
      .map((c) => ({ ...c, logo_url: fileUrl(c.logo) })),
  });
});

api.post('/leads', async (req, res) => {
  const b = req.body || {};
  if (b.company_website) return res.json({ ok: true }); // honeypot: bots fill hidden field
  const lead = {
    name: String(b.name || '').trim().slice(0, 120),
    phone: String(b.phone || '').trim().slice(0, 40),
    email: String(b.email || '').trim().slice(0, 160),
    business: String(b.business || '').trim().slice(0, 120),
    message: String(b.message || '').trim().slice(0, 3000),
    lang: b.lang === 'ar' ? 'ar' : 'en',
  };
  if (!lead.name) return res.status(400).json({ error: 'name' });
  if (!lead.phone && !lead.email) return res.status(400).json({ error: 'contact' });
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return res.status(400).json({ error: 'email' });
  if (limited(req.ip)) return res.status(429).json({ error: 'rate' });

  const r = db.prepare(`INSERT INTO leads (name, phone, email, business, message, lang, ip)
    VALUES (@name,@phone,@email,@business,@message,@lang,@ip)`).run({ ...lead, ip: req.ip });
  res.status(201).json({ ok: true });

  // email after responding, so the visitor never waits on SMTP
  try {
    const to = getSettings().leads_email || 'eslam@teknulugy.com';
    const out = await sendLeadEmail(lead, to);
    if (out.sent) db.prepare('UPDATE leads SET email_sent = 1 WHERE id = ?').run(r.lastInsertRowid);
    else console.warn('[mail] lead saved, email skipped:', out.reason);
  } catch (e) { console.error('[mail] failed:', e.message); }
});

/* ---------- admin ---------- */
api.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const a = db.prepare('SELECT * FROM admins WHERE email = ?').get(String(email || '').toLowerCase().trim());
  if (!a || !bcrypt.compareSync(String(password || ''), a.password_hash)) return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: jwt.sign({ id: a.id, email: a.email }, JWT_SECRET, { expiresIn: '7d' }), email: a.email });
});

api.post('/auth/password', auth, (req, res) => {
  const { current, next } = req.body || {};
  const a = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(String(current || ''), a.password_hash)) return res.status(400).json({ error: 'Current password is wrong' });
  if (String(next || '').length < 8) return res.status(400).json({ error: 'Use at least 8 characters' });
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 10), a.id);
  res.json({ ok: true });
});

api.get('/admin/overview', auth, (req, res) => {
  const c = (sql) => db.prepare(sql).get().c;
  res.json({
    leads_total: c('SELECT COUNT(*) c FROM leads'),
    leads_new: c("SELECT COUNT(*) c FROM leads WHERE status = 'new'"),
    leads_won: c("SELECT COUNT(*) c FROM leads WHERE status = 'won'"),
    templates: c('SELECT COUNT(*) c FROM templates'),
    clients: c('SELECT COUNT(*) c FROM clients'),
  });
});

// Leads
const STATUSES = ['new', 'contacted', 'won', 'lost'];
api.get('/admin/leads', auth, (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  const q = `%${String(req.query.q || '').trim()}%`;
  res.json({
    leads: db.prepare(`SELECT * FROM leads WHERE (? IS NULL OR status = ?)
      AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR business LIKE ?) ORDER BY id DESC LIMIT 500`)
      .all(status, status, q, q, q, q),
  });
});
api.patch('/admin/leads/:id', auth, (req, res) => {
  const l = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!l) return res.status(404).json({ error: 'Not found' });
  const status = STATUSES.includes(req.body.status) ? req.body.status : l.status;
  const notes = req.body.notes !== undefined ? String(req.body.notes).slice(0, 5000) : l.notes;
  db.prepare('UPDATE leads SET status = ?, notes = ? WHERE id = ?').run(status, notes, l.id);
  res.json({ lead: db.prepare('SELECT * FROM leads WHERE id = ?').get(l.id) });
});
api.delete('/admin/leads/:id', auth, (req, res) => {
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
api.get('/admin/leads.csv', auth, (req, res) => {
  const rows = db.prepare('SELECT id, created_at, name, phone, email, business, status, message, notes FROM leads ORDER BY id DESC').all();
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [Object.keys(rows[0] || { id: 1 }).join(','), ...rows.map((r) => Object.values(r).map(cell).join(','))].join('\n');
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="manasa-leads.csv"');
  res.send('﻿' + csv); // BOM so Excel shows Arabic correctly
});

// Templates
const tplOut = (t) => ({ ...t, visible: !!t.visible, image_url: fileUrl(t.image) });
api.get('/admin/templates', auth, (req, res) => {
  res.json({ templates: db.prepare('SELECT * FROM templates ORDER BY sort_order, id').all().map(tplOut) });
});
api.post('/admin/templates', auth, upload.single('image'), async (req, res) => {
  try {
    const b = req.body || {};
    if (!String(b.name_en || '').trim()) return res.status(400).json({ error: 'English name is required' });
    const image = req.file ? await saveImage(req.file, 'tpl', { width: 1600, height: 1000, fit: 'cover' }) : '';
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) m FROM templates').get().m;
    const r = db.prepare(`INSERT INTO templates (name_en, name_ar, category_en, category_ar, image, demo_url, sort_order, visible)
      VALUES (?,?,?,?,?,?,?,?)`).run(b.name_en.trim(), b.name_ar || '', b.category_en || '', b.category_ar || '', image, b.demo_url || '', max + 1, b.visible === 'false' ? 0 : 1);
    res.status(201).json({ template: tplOut(db.prepare('SELECT * FROM templates WHERE id = ?').get(r.lastInsertRowid)) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
api.put('/admin/templates/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const t = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    const b = req.body || {};
    let image = t.image;
    if (req.file) { image = await saveImage(req.file, 'tpl', { width: 1600, height: 1000, fit: 'cover' }); removeFile(t.image); }
    db.prepare(`UPDATE templates SET name_en=?, name_ar=?, category_en=?, category_ar=?, image=?, demo_url=?, visible=? WHERE id=?`)
      .run(b.name_en ?? t.name_en, b.name_ar ?? t.name_ar, b.category_en ?? t.category_en, b.category_ar ?? t.category_ar,
        image, b.demo_url ?? t.demo_url, b.visible === undefined ? t.visible : (b.visible === 'false' || b.visible === false ? 0 : 1), t.id);
    res.json({ template: tplOut(db.prepare('SELECT * FROM templates WHERE id = ?').get(t.id)) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
api.delete('/admin/templates/:id', auth, (req, res) => {
  const t = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (t) { removeFile(t.image); db.prepare('DELETE FROM templates WHERE id = ?').run(t.id); }
  res.json({ ok: true });
});

// Clients
const cliOut = (c) => ({ ...c, visible: !!c.visible, logo_url: fileUrl(c.logo) });
api.get('/admin/clients', auth, (req, res) => {
  res.json({ clients: db.prepare('SELECT * FROM clients ORDER BY sort_order, id').all().map(cliOut) });
});
api.post('/admin/clients', auth, upload.single('logo'), async (req, res) => {
  try {
    const b = req.body || {};
    if (!String(b.name || '').trim()) return res.status(400).json({ error: 'Name is required' });
    const logo = req.file ? await saveImage(req.file, 'logo', { width: 480, height: 240 }) : '';
    const max = db.prepare('SELECT COALESCE(MAX(sort_order), -1) m FROM clients').get().m;
    const r = db.prepare('INSERT INTO clients (name, logo, url, sort_order, visible) VALUES (?,?,?,?,?)')
      .run(b.name.trim(), logo, b.url || '', max + 1, b.visible === 'false' ? 0 : 1);
    res.status(201).json({ client: cliOut(db.prepare('SELECT * FROM clients WHERE id = ?').get(r.lastInsertRowid)) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
api.put('/admin/clients/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const c = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    const b = req.body || {};
    let logo = c.logo;
    if (req.file) { logo = await saveImage(req.file, 'logo', { width: 480, height: 240 }); removeFile(c.logo); }
    db.prepare('UPDATE clients SET name=?, logo=?, url=?, visible=? WHERE id=?')
      .run(b.name ?? c.name, logo, b.url ?? c.url, b.visible === undefined ? c.visible : (b.visible === 'false' || b.visible === false ? 0 : 1), c.id);
    res.json({ client: cliOut(db.prepare('SELECT * FROM clients WHERE id = ?').get(c.id)) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
api.delete('/admin/clients/:id', auth, (req, res) => {
  const c = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (c) { removeFile(c.logo); db.prepare('DELETE FROM clients WHERE id = ?').run(c.id); }
  res.json({ ok: true });
});

// Reorder templates/clients: body { ids: [3,1,2] }
api.post('/admin/:kind/reorder', auth, (req, res) => {
  const table = { templates: 'templates', clients: 'clients' }[req.params.kind];
  if (!table || !Array.isArray(req.body.ids)) return res.status(400).json({ error: 'Bad request' });
  const st = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
  db.transaction(() => req.body.ids.forEach((id, i) => st.run(i, id)))();
  res.json({ ok: true });
});

// Settings
const EDITABLE = ['price', 'currency_en', 'currency_ar', 'whatsapp', 'leads_email', 'instagram', 'contact_email'];
api.get('/admin/settings', auth, async (req, res) => {
  res.json({ settings: getSettings(), smtp: await verifySmtp() });
});
api.put('/admin/settings', auth, (req, res) => {
  const b = req.body || {};
  const st = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  db.transaction(() => {
    for (const k of EDITABLE) if (b[k] !== undefined) st.run(k, String(b[k]).trim());
    if (b.integrations && typeof b.integrations === 'object') {
      const clean = {};
      for (const [k, list] of Object.entries(b.integrations)) {
        clean[k] = (Array.isArray(list) ? list : []).map((x) => String(x).trim()).filter(Boolean).slice(0, 60);
      }
      st.run('integrations', JSON.stringify(clean));
    }
  })();
  res.json({ settings: getSettings() });
});
api.post('/admin/test-email', auth, async (req, res) => {
  try {
    const to = getSettings().leads_email;
    const out = await sendLeadEmail({ name: 'Test from Manasa admin', phone: '', email: '', business: 'Test', message: 'If you can read this, contact-form emails work.', lang: 'en' }, to);
    if (!out.sent) return res.status(400).json({ error: out.reason });
    res.json({ ok: true, to });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

// Built React app (site + /admin), with SPA fallback
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h', setHeaders: (res, p) => { if (p.includes(`${path.sep}assets${path.sep}`)) res.set('Cache-Control', 'public, max-age=31536000, immutable'); } }));
  app.use((req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, '127.0.0.1', () => console.log(`Manasa on :${PORT}`));
