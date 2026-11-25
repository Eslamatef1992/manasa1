const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'manasa.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  business TEXT DEFAULT '',
  message TEXT DEFAULT '',
  lang TEXT DEFAULT 'en',
  status TEXT DEFAULT 'new',
  notes TEXT DEFAULT '',
  email_sent INTEGER DEFAULT 0,
  ip TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  category_en TEXT DEFAULT '',
  category_ar TEXT DEFAULT '',
  image TEXT DEFAULT '',
  demo_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT DEFAULT '',
  url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

const DEFAULT_SETTINGS = {
  price: '150',
  currency_en: 'KWD',
  currency_ar: 'د.ك',
  whatsapp: '',
  leads_email: 'eslam@teknulugy.com',
  instagram: '',
  contact_email: 'eslam@teknulugy.com',
  integrations: JSON.stringify({
    payments: ['KNET', 'Tap', 'MyFatoorah', 'UPayments', 'Hesabe', 'Bookeey', 'Stripe', 'PayPal', 'Apple Pay', 'Google Pay', 'Tabby', 'Tamara', 'Deema', 'Sadad', 'SkipCash', 'Amwal', 'Klickpay', 'Tali'],
    shipping: ['Aramex', 'DHL Express', 'Armada', 'Mashkor', 'Hadheir Delivery'],
    marketing: ['Google Analytics', 'Meta Pixel', 'TikTok Pixel', 'Snapchat Pixel', 'Google Merchant Center', 'WhatsApp Business'],
    operations: ['Teknulugy ERP', 'POS', 'Inventory System', 'Accounting'],
  }),
};

function seed() {
  const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) ins.run(k, v);

  if (db.prepare('SELECT COUNT(*) c FROM admins').get().c === 0) {
    const email = (process.env.ADMIN_EMAIL || 'eslam@teknulugy.com').toLowerCase();
    db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)')
      .run(email, bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10));
    console.log(`[seed] admin created: ${email}`);
  }

  // First run: starter templates from the store screenshots in server/seed
  if (db.prepare('SELECT COUNT(*) c FROM templates').get().c === 0) {
    const starters = [
      ['qaya', 'Honey & organic', 'العسل والمنتجات الطبيعية', 'Food', 'أغذية'],
      ['thek', 'Fragrance house', 'دار العطور', 'Perfumes', 'عطور'],
      ['corny', 'Snacks with delivery slots', 'سناكات مع مواعيد توصيل', 'Food & delivery', 'أغذية وتوصيل'],
      ['7yaak', 'Multi-category market', 'متجر متعدد الأقسام', 'Marketplace', 'متجر شامل'],
      ['khaleet', 'Beauty & body care', 'الجمال والعناية', 'Beauty', 'تجميل'],
      ['premiumphone', 'Electronics store', 'متجر إلكترونيات', 'Electronics', 'إلكترونيات'],
    ];
    const t = db.prepare('INSERT INTO templates (name_en, name_ar, category_en, category_ar, image, sort_order) VALUES (?,?,?,?,?,?)');
    starters.forEach(([file, en, ar, cen, car], i) => {
      const src = path.join(__dirname, 'seed', `${file}.webp`);
      if (!fs.existsSync(src)) return;
      const name = `tpl-seed-${file}.webp`;
      fs.copyFileSync(src, path.join(UPLOAD_DIR, name));
      t.run(en, ar, cen, car, name, i);
    });
  }
}

function getSettings() {
  const out = {};
  for (const r of db.prepare('SELECT key, value FROM settings').all()) out[r.key] = r.value;
  try { out.integrations = JSON.parse(out.integrations || '{}'); } catch { out.integrations = {}; }
  return out;
}

module.exports = { db, seed, getSettings, UPLOAD_DIR, ROOT };
