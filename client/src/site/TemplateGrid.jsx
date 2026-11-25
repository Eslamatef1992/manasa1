import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** One template in a 3D frame: tilts toward the pointer, with a soft glare that follows it. */
function TemplateCard({ tp, index }) {
  const { t, lang } = useLang();
  const card = useRef();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (reduced()) { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    io.observe(card.current);
    return () => io.disconnect();
  }, []);
  const name = lang === 'ar' && tp.name_ar ? tp.name_ar : tp.name_en;
  const cat = lang === 'ar' && tp.category_ar ? tp.category_ar : tp.category_en;

  function move(e) {
    if (reduced() || e.pointerType === 'touch') return;
    const el = card.current; const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 16}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
    el.classList.add('hot');
  }
  function leave() {
    const el = card.current;
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    el.classList.remove('hot');
  }

  return (
    <article
      ref={card}
      className={`tcard ${shown ? 'in' : ''}`}
      style={{ '--i': index % 3 }}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <div className="tcard-3d">
        <div className="tcard-frame">
          <div className="tcard-bar"><i /><i /><i /><span>{name}</span></div>
          <div className="tcard-shot"><img src={tp.image_url} alt={name} loading="lazy" /></div>
          <div className="tcard-glare" aria-hidden="true" />
        </div>
        <div className="tcard-shadow" aria-hidden="true" />
      </div>
      <div className="tcard-meta">
        <div><h3>{name}</h3>{cat && <span>{cat}</span>}</div>
        {tp.demo_url && <a className="btn btn-line sm" href={tp.demo_url} target="_blank" rel="noreferrer">{t.templates.view}</a>}
      </div>
    </article>
  );
}

export default function TemplateGrid({ templates }) {
  return (
    <div className="tgrid">
      {templates.map((tp, i) => <TemplateCard key={tp.id} tp={tp} index={i} />)}
    </div>
  );
}
