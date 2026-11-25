# Manasa by Teknulugy (منصّة)

Marketing website + admin panel for **Manasa**, Teknulugy's yearly e-commerce platform.
Live at **https://web.teknulugycard.com**, admin at **https://web.teknulugycard.com/admin**.

- **Website:** 3D hero (React Three Fiber), Arabic/English with RTL, integrations orbit, apps, templates, pricing, FAQ, contact form.
- **Admin (`/admin`):** leads from the contact form (status, notes, WhatsApp/call, CSV export), templates gallery,
  client logos strip, settings (price, WhatsApp, emails, integrations list), password change.
- **Contact form:** saved in the database and emailed to the address in *Settings → Send new leads to*
  (default `eslam@teknulugy.com`) via SMTP. Honeypot + rate limit against spam.

Stack: Node 22 · Express 5 · SQLite (better-sqlite3) · Nodemailer · React 19 · Vite · three.js. One process serves the API, uploads and the built site.

## Local development
```bash
cp .env.example .env        # set JWT_SECRET, leave SMTP empty to skip emails
npm install
npm run dev:api             # API on :4100
npm run dev:web             # site on :5173 (proxies /api to :4100)
```

## Server (82.29.178.28) — first time
Requires `/opt/node22` (already installed for TekCard) and PM2.
```bash
ss -tlnp | grep ':4100\s'          # must print nothing (port free)
cd /var/www
git clone https://github.com/Eslamatef1992/manasa.git
cd manasa
./deploy.sh                          # first run creates .env and stops
nano .env                            # ADMIN_PASSWORD + SMTP_* (see below)
./deploy.sh
curl -s http://127.0.0.1:4100/api/health   # {"ok":true}

cp deploy/nginx-manasa.conf /etc/nginx/sites-available/manasa.conf
ln -sf /etc/nginx/sites-available/manasa.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```
No DNS or SSL work needed: `*.teknulugycard.com` already points to the server and the wildcard certificate covers `web.`.

### Email (SMTP)
Use a mailbox on teknulugy.com, e.g. `noreply@teknulugy.com`. For Hostinger email:
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@teknulugy.com
SMTP_PASS=<mailbox password>
MAIL_FROM="Manasa Website <noreply@teknulugy.com>"
```
Then `pm2 restart manasa --update-env` and use **Admin → Settings → Send test email**.

## Updating
```bash
cd /var/www/manasa && ./deploy.sh
```

## Backups
```bash
tar czf manasa-backup-$(date +%F).tgz -C /var/www/manasa data uploads .env
```
