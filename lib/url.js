export const VUES = ['matiere', 'classe', 'lexique', 'biblio'];
const KEYS = ['m', 'cy', 'c', 'q', 'f'];
export const DEFAULT_STATE = Object.freeze({ vue: 'matiere', m: '', cy: '', c: '', t: [], q: '', f: '' });

export function parseHash(hash) {
  const p = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const s = { ...DEFAULT_STATE };
  if (VUES.includes(p.get('vue'))) s.vue = p.get('vue');
  for (const k of KEYS) s[k] = p.get(k) ?? '';
  s.t = (p.get('t') ?? '').split(',').filter(Boolean);
  return s;
}

export function toHash(s) {
  const p = new URLSearchParams();
  if (s.vue && s.vue !== 'matiere') p.set('vue', s.vue);
  for (const k of KEYS) if (s[k]) p.set(k, s[k]);
  if (s.t?.length) p.set('t', s.t.join(','));
  const str = p.toString();
  return str ? `#${str}` : '';
}

export function sanitizeState(s, { classes, matiereIds, types }) {
  const out = { ...s, t: s.t.filter(t => types.includes(t)) };
  if (!matiereIds.includes(out.m)) out.m = '';
  const cls = classes.find(c => c.id === out.c);
  if (cls) out.cy = String(cls.cycle);
  else {
    out.c = '';
    if (!['1', '2', '3'].includes(out.cy)) out.cy = '';
  }
  return out;
}
