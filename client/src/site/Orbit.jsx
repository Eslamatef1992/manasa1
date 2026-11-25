import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';

const GROUP_KEYS = ['payments', 'shipping', 'marketing', 'operations'];

/**
 * Integrations orbiting the store in two tilted rings. Positions are projected in JS each frame
 * (x = R·sin θ, depth = cos θ) so chips scale and fade with depth while their text stays upright.
 */
export default function Orbit({ integrations }) {
  const { t, lang } = useLang();
  const [group, setGroup] = useState('all');
  const stage = useRef();
  const chips = useRef([]);
  const paused = useRef(false);

  const items = useMemo(() => {
    const all = GROUP_KEYS.flatMap((g) => (integrations?.[g] || []).map((name) => ({ name, g })));
    const inner = all.filter((x) => x.g === 'payments');
    const outer = all.filter((x) => x.g !== 'payments');
    return [
      ...inner.map((x, i) => ({ ...x, ring: 0, a0: (i / Math.max(1, inner.length)) * Math.PI * 2 })),
      ...outer.map((x, i) => ({ ...x, ring: 1, a0: (i / Math.max(1, outer.length)) * Math.PI * 2 })),
    ];
  }, [integrations]);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf; let last = performance.now(); let angle = 0;
    const tick = (now) => {
      const dt = Math.min(64, now - last); last = now;
      if (!paused.current && !reduced) angle += dt * 0.00012;
      const el = stage.current;
      if (el) {
        const w = el.clientWidth; const h = el.clientHeight;
        const radii = [[w * 0.27, h * 0.2], [w * 0.45, h * 0.36]];
        items.forEach((it, i) => {
          const node = chips.current[i];
          if (!node) return;
          const dir = it.ring === 0 ? 1 : -0.7;
          const a = it.a0 + angle * dir;
          const [rx, ry] = radii[it.ring];
          const depth = Math.cos(a); // 1 = front, -1 = back
          const x = Math.sin(a) * rx;
          const y = depth * ry;
          const s = 0.72 + (depth + 1) * 0.18;
          node.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`;
          node.style.zIndex = String(Math.round((depth + 1) * 100));
          node.style.setProperty('--depth', ((depth + 1) / 2).toFixed(3));
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  return (
    <div className="orbit-wrap">
      <div className="orbit-tabs" role="tablist" aria-label={t.integrations.title}>
        <button role="tab" aria-selected={group === 'all'} className={group === 'all' ? 'on' : ''} onClick={() => setGroup('all')}>
          {lang === 'ar' ? 'الكل' : 'All'}
        </button>
        {GROUP_KEYS.map((g) => (
          <button key={g} role="tab" aria-selected={group === g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>
            {t.integrations.groups[g]}
          </button>
        ))}
      </div>
      <div
        className="orbit"
        ref={stage}
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        <div className="orbit-ring r0" />
        <div className="orbit-ring r1" />
        <div className="orbit-core">
          <img src="/brand/teknulugy-white.png" alt="" />
          <strong>{t.integrations.core}</strong>
        </div>
        {items.map((it, i) => (
          <span
            key={`${it.g}-${it.name}`}
            ref={(n) => { chips.current[i] = n; }}
            className={`chip g-${it.g} ${group === 'all' || group === it.g ? '' : 'dim'}`}
          >
            {it.name}
          </span>
        ))}
      </div>
      {/* accessible, static list for screen readers and very small screens */}
      <ul className="orbit-list">
        {GROUP_KEYS.map((g) => (
          <li key={g}><b>{t.integrations.groups[g]}</b> {(integrations?.[g] || []).join(', ')}</li>
        ))}
      </ul>
    </div>
  );
}
