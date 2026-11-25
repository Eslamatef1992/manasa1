const nodemailer = require('nodemailer');

let transport = null;
function getTransport() {
  if (transport) return transport;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transport;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sendLeadEmail(lead, to) {
  const t = getTransport();
  if (!t) return { sent: false, reason: 'SMTP is not configured' };
  const rows = [
    ['Name', lead.name], ['Phone', lead.phone], ['Email', lead.email],
    ['Business', lead.business], ['Language', lead.lang === 'ar' ? 'Arabic' : 'English'],
  ].filter(([, v]) => v);
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#17693a;margin:0 0 12px">New Manasa enquiry</h2>
    <table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) =>
      `<tr><td style="padding:6px 10px;color:#5b6b60;width:110px">${k}</td><td style="padding:6px 10px;font-weight:600">${esc(v)}</td></tr>`).join('')}</table>
    ${lead.message ? `<p style="white-space:pre-line;background:#f3f6f2;padding:12px;border-radius:8px">${esc(lead.message)}</p>` : ''}
    ${lead.phone ? `<p><a href="https://wa.me/${esc(lead.phone.replace(/[^\d]/g, ''))}">Reply on WhatsApp</a></p>` : ''}
  </div>`;
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    replyTo: lead.email || undefined,
    subject: `Manasa enquiry: ${lead.name}${lead.business ? ` (${lead.business})` : ''}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (lead.message ? `\n\n${lead.message}` : ''),
    html,
  });
  return { sent: true };
}

async function verifySmtp() {
  const t = getTransport();
  if (!t) return { ok: false, error: 'SMTP_HOST / SMTP_USER / SMTP_PASS not set in .env' };
  try { await t.verify(); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; }
}

module.exports = { sendLeadEmail, verifySmtp };
