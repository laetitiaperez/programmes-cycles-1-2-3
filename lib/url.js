import { classesDuFil } from './carte.js';

export const VUES = ['accueil', 'carte', 'classe', 'lexique', 'biblio', 'recherche'];
const KEYS = ['m', 'd', 'fil', 'c', 'q'];
export const DEFAULT_STATE = Object.freeze({ vue: 'accueil', m: '', d: '', fil: '', c: '', q: '' });

// Anciens liens du site (vue=matiere, f=<fil>, filtres cy/t) : traduits vers la carte.
export function parseHash(hash) {
  const p = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const s = { ...DEFAULT_STATE };
  for (const k of KEYS) s[k] = p.get(k) ?? '';
  if (!s.fil && p.get('f')) s.fil = p.get('f');
  const vue = p.get('vue');
  if (VUES.includes(vue)) s.vue = vue;
  else if (vue === 'matiere' || (!vue && s.m)) s.vue = 'carte';
  return s;
}

export function toHash(s) {
  const p = new URLSearchParams();
  if (s.vue && s.vue !== 'accueil') p.set('vue', s.vue);
  for (const k of KEYS) if (s[k]) p.set(k, s[k]);
  const str = p.toString();
  return str ? `#${str}` : '';
}

export function sanitizeState(s, { classes, matieres }) {
  const out = { ...s };
  const order = new Map(classes.map((c, i) => [c.id, i]));
  const m = matieres.find(x => x.id === out.m);
  if (!m) out.m = '';
  if (!m?.domaines.some(d => d.id === out.d)) out.d = '';
  const dom = m?.domaines.find(d => d.fils.some(f => f.id === out.fil));
  const fil = dom?.fils.find(f => f.id === out.fil);
  if (fil) out.d = dom.id;
  else out.fil = '';
  if (!order.has(out.c)) out.c = '';
  if (out.vue === 'carte') {
    if (!m) return { ...DEFAULT_STATE, q: out.q };
    if (out.c && !(fil && classesDuFil(fil, order).includes(out.c))) out.c = '';
  }
  if (out.vue === 'recherche' && !out.q) out.vue = 'accueil';
  return out;
}
