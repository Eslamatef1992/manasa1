import { lazy, Suspense, useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import Orbit from './Orbit.jsx';
import Icon from './Icons.jsx';

const HeroScene = lazy(() => import('../three/HeroScene.jsx'));

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

function Wordmark({ light }) {
  const { lang } = useLang();
  return (
    <a href="#top" className={`wordmark ${light ? 'light' : ''}`} aria-label="Manasa by Teknulugy">
      <span className="wm-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="wm-text">
        <b>{lang === 'ar' ? 'منصّة' : 'Manasa'}</b>
        <small>{lang === 'ar' ? 'من Teknulugy' : 'by Teknulugy'}</small>
      </span>
    </a>
  );
}

function Header() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = ['features', 'integrations', 'apps', 'templates', 'pricing', 'faq'];
  return (
    <header className={`site-head ${solid ? 'solid' : ''}`}>
      <div className="wrap head-row">
        <Wordmark />
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          {links.map((k) => <a key={k} href={`#${k}`} onClick={() => setOpen(false)}>{t.nav[k]}</a>)}
        </nav>
        <div className="head-actions">
          <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{t.langSwitch}</button>
          <a className="btn btn-dark hide-sm" href="#contact">{t.cta}</a>
          <button className="menu-btn" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}><span /><span /></button>
        </div>
      </div>
    </header>
  );
}

function Hero({ settings }) {
  const { t, lang } = useLang();
  const [three, setThree] = useState(false);
  useEffect(() => { setThree(webglOk()); }, []);
  const cur = lang === 'ar' ? settings?.currency_ar || 'د.ك' : settings?.currency_en || 'KWD';
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>{t.hero.title}</h1>
          <p className="lead">{t.hero.sub}</p>
          <div className="hero-ctas">
            <a className="btn btn-brand" href="#contact">{t.hero.primary}</a>
            <a className="btn btn-line" href="#templates">{t.hero.secondary}</a>
          </div>
          <div className="price-tag" aria-label={`${settings?.price || 150} ${cur} ${t.hero.priceA}`}>
            <span className="pt-amount">{settings?.price || 150}<small>{cur}</small></span>
            <span className="pt-meta"><b>{t.hero.priceA}</b><span>{t.hero.priceB}</span></span>
          </div>
        </div>
        <div className="hero-stage">
          {three ? (
            <Suspense fallback={<StaticStage />}><HeroScene /></Suspense>
          ) : <StaticStage />}
        </div>
      </div>
    </section>
  );
}

/** Shown while the 3D scene loads, and on devices without WebGL. */
function StaticStage() {
  return (
    <div className="static-stage" aria-hidden="true">
      <img src="/screens/thek.webp" alt="" className="ss s1" />
      <img src="/screens/qaya.webp" alt="" className="ss s2" />
      <img src="/screens/premiumphone.webp" alt="" className="ss s3" />
      <div className="ss-podium" />
    </div>
  );
}

function Clients({ clients }) {
  const { t } = useLang();
  if (!clients?.length) return null;
  const row = [...clients, ...clients];
  return (
    <section className="clients" aria-label={t.clients}>
      <div className="wrap"><p className="clients-title">{t.clients}</p></div>
      <div className="marquee">
        <div className="marquee-track">
          {row.map((c, i) => (
            <a key={i} href={c.url || undefined} target="_blank" rel="noreferrer" className="client" aria-hidden={i >= clients.length}>
              {c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy" /> : <span>{c.name}</span>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Integrations({ integrations }) {
  const { t } = useLang();
  return (
    <section className="section integrations" id="integrations">
      <div className="wrap">
        <div className="sec-head">
          <h2>{t.integrations.title}</h2>
          <p>{t.integrations.sub}</p>
        </div>
        <Orbit integrations={integrations} />
      </div>
    </section>
  );
}

function Features() {
  const { t } = useLang();
  return (
    <section className="section features" id="features">
      <div className="wrap feat-grid">
        <div className="feat-unlimited">
          <h2>{t.features.title}</h2>
          <div className="unl-box">
            <p className="unl-title">{t.features.unlimitedTitle}</p>
            <ul>
              {t.features.unlimited.map((x) => <li key={x}><span className="inf" aria-hidden="true">∞</span>{x}</li>)}
            </ul>
          </div>
        </div>
        <ul className="feat-list">
          {t.features.list.map(([ic, title, body]) => (
            <li key={title}>
              <span className="feat-ic"><Icon name={ic} /></span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Apps() {
  const { t } = useLang();
  const [dash, admin, mobile] = t.apps.items;
  return (
    <section className="section apps" id="apps">
      <div className="wrap">
        <div className="sec-head">
          <h2>{t.apps.title}</h2>
          <p>{t.apps.sub}</p>
        </div>
        <div className="apps-stage">
          <figure className="device laptop">
            <div className="screen"><img src="/screens/dashboard.webp" alt="" loading="lazy" /></div>
            <div className="base" />
            <figcaption><h3>{dash[0]}</h3><p>{dash[1]}</p></figcaption>
          </figure>
          <figure className="device panel">
            <div className="screen admin-mock" aria-hidden="true">
              <div className="am-side"><i /><i /><i /><i /><i /></div>
              <div className="am-main">
                <div className="am-top"><b /><span /></div>
                {['#1048', '#1047', '#1046', '#1045', '#1044'].map((n, i) => (
                  <div className="am-row" key={n}>
                    <span className="am-id">{n}</span><span className="am-bar" style={{ width: `${40 + (i * 13) % 35}%` }} />
                    <span className={`am-pill p${i % 3}`} />
                  </div>
                ))}
              </div>
            </div>
            <figcaption><h3>{admin[0]}</h3><p>{admin[1]}</p></figcaption>
          </figure>
          <figure className="device phone">
            <div className="screen phone-mock" aria-hidden="true">
              <div className="pm-notch" />
              <div className="pm-time">9:41</div>
              {t.apps.notif.map((n, i) => (
                <div className="pm-note" key={n} style={{ animationDelay: `${i * 0.6}s` }}>
                  <span className="pm-app" />
                  <div><b>{n}</b><span>{['#1048', '12.500 KWD', 'Salmiya'][i]}</span></div>
                </div>
              ))}
            </div>
            <figcaption><h3>{mobile[0]}</h3><p>{mobile[1]}</p></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const { t } = useLang();
  return (
    <section className="section steps">
      <div className="wrap">
        <h2>{t.steps.title}</h2>
        <ol className="step-list">
          {t.steps.items.map(([h, p], i) => (
            <li key={h}><span className="step-n">{i + 1}</span><h3>{h}</h3><p>{p}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Templates({ templates }) {
  const { t, lang } = useLang();
  if (!templates?.length) return null;
  return (
    <section className="section templates" id="templates">
      <div className="wrap sec-head">
        <h2>{t.templates.title}</h2>
        <p>{t.templates.sub}</p>
      </div>
      <div className="tpl-strip" tabIndex={0} aria-label={t.templates.title}>
        {templates.map((tp) => {
          const name = lang === 'ar' && tp.name_ar ? tp.name_ar : tp.name_en;
          const cat = lang === 'ar' && tp.category_ar ? tp.category_ar : tp.category_en;
          return (
            <article className="tpl" key={tp.id}>
              <div className="tpl-frame">
                <div className="tpl-bar"><i /><i /><i /></div>
                <img src={tp.image_url} alt={name} loading="lazy" />
              </div>
              <div className="tpl-meta">
                <div><h3>{name}</h3>{cat && <span>{cat}</span>}</div>
                {tp.demo_url && <a className="btn btn-line sm" href={tp.demo_url} target="_blank" rel="noreferrer">{t.templates.view}</a>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Pricing({ settings }) {
  const { t, lang } = useLang();
  const cur = lang === 'ar' ? settings?.currency_ar || 'د.ك' : settings?.currency_en || 'KWD';
  return (
    <section className="section pricing" id="pricing">
      <div className="wrap price-grid">
        <div className="price-copy"><h2>{t.pricing.title}</h2><p>{t.pricing.lead}</p></div>
        <div className="ticket">
          <div className="ticket-top">
            <span className="big-price">{settings?.price || 150}</span>
            <span className="big-cur"><b>{cur}</b>{t.pricing.per}</span>
          </div>
          <div className="ticket-cut" aria-hidden="true" />
          <ul>{t.pricing.items.map((x) => <li key={x}><Icon name="check" size={18} stroke={2.2} />{x}</li>)}</ul>
          <a className="btn btn-brand full" href="#contact">{t.pricing.cta}</a>
          <p className="fine">{t.pricing.note}</p>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useLang();
  return (
    <section className="section faq" id="faq">
      <div className="wrap faq-grid">
        <h2>{t.faq.title}</h2>
        <div>
          {t.faq.items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<Icon name="plus" size={20} /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ settings }) {
  const { t, lang } = useLang();
  const c = t.contact;
  const [form, setForm] = useState({ name: '', phone: '', email: '', business: '', message: '', company_website: '' });
  const [state, setState] = useState({ busy: false, done: false, err: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setState({ busy: false, done: false, err: c.err.name });
    if (!form.phone.trim() && !form.email.trim()) return setState({ busy: false, done: false, err: c.err.contact });
    setState({ busy: true, done: false, err: '' });
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, lang }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.err[d.error] || c.err.other);
      setState({ busy: false, done: true, err: '' });
    } catch (err) {
      setState({ busy: false, done: false, err: err.message || c.err.other });
    }
  }

  const wa = (settings?.whatsapp || '').replace(/[^\d]/g, '');
  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <div className="sec-head"><h2>{c.title}</h2><p>{c.sub}</p></div>
        <div className="contact-grid">
          {state.done ? (
            <div className="form done" role="status"><Icon name="check" size={34} stroke={2.2} /><p>{c.done}</p></div>
          ) : (
            <form className="form" onSubmit={submit} noValidate>
              <div className="row2">
                <label>{c.name}<input value={form.name} onChange={set('name')} placeholder={c.namePh} autoComplete="name" required /></label>
                <label>{c.phone}<input value={form.phone} onChange={set('phone')} placeholder={c.phonePh} inputMode="tel" autoComplete="tel" dir="ltr" /></label>
              </div>
              <div className="row2">
                <label>{c.email}<input type="email" value={form.email} onChange={set('email')} placeholder={c.emailPh} autoComplete="email" dir="ltr" /></label>
                <label>{c.business}<input value={form.business} onChange={set('business')} placeholder={c.businessPh} /></label>
              </div>
              <label>{c.message}<textarea rows={4} value={form.message} onChange={set('message')} placeholder={c.messagePh} /></label>
              <label className="hp" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.company_website} onChange={set('company_website')} /></label>
              {state.err && <p className="form-err" role="alert">{state.err}</p>}
              <button className="btn btn-brand" disabled={state.busy}>{state.busy ? c.sending : c.send}</button>
            </form>
          )}
          <aside className="direct">
            <h3>{c.direct}</h3>
            {wa && (
              <a className="btn btn-light full" href={`https://wa.me/${wa}?text=${encodeURIComponent(c.waText)}`} target="_blank" rel="noreferrer">
                <Icon name="wa" size={20} />{c.whatsapp}
              </a>
            )}
            {settings?.contact_email && (
              <a className="btn btn-ghost-light full" href={`mailto:${settings.contact_email}`}><Icon name="mail" size={20} />{c.emailUs}</a>
            )}
            <img className="direct-logo" src="/brand/teknulugy-white.png" alt="Teknulugy" />
          </aside>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-foot">
      <div className="wrap foot-row">
        <Wordmark light />
        <nav>{['features', 'integrations', 'templates', 'pricing', 'contact'].map((k) => <a key={k} href={`#${k}`}>{t.nav[k]}</a>)}</nav>
        <p>© {new Date().getFullYear()} Teknulugy. {t.footer.rights}</p>
      </div>
    </footer>
  );
}

export default function Site() {
  const [data, setData] = useState({ settings: null, templates: [], clients: [] });
  useEffect(() => { fetch('/api/site').then((r) => r.json()).then(setData).catch(() => {}); }, []);
  return (
    <>
      <a className="skip" href="#features">Skip to content</a>
      <Header />
      <main>
        <Hero settings={data.settings} />
        <Clients clients={data.clients} />
        <Features />
        <Integrations integrations={data.settings?.integrations} />
        <Apps />
        <Steps />
        <Templates templates={data.templates} />
        <Pricing settings={data.settings} />
        <Faq />
        <Contact settings={data.settings} />
      </main>
      <Footer />
    </>
  );
}
