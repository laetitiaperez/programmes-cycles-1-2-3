import { normalize } from './normalize.js';
import { stripMarkup } from './markup.js';

export function selectedClasses(classes, { cycle, classe } = {}) {
  if (classe) return new Set([classe]);
  if (cycle) return new Set(classes.filter(c => c.cycle === Number(cycle)).map(c => c.id));
  return null;
}

const touches = (sel, list) => !sel || list.some(c => sel.has(c));
function plain(t) {
  try { return normalize(stripMarkup(t ?? '')); } catch { return normalize(t); }
}
const has = (q, t) => plain(t).includes(q);

// Un fil est visible si une étape passe les filtres, ou si seul son socle
// s'applique (sans filtre de type) : le socle vaut pour la classe choisie.
export function filterFil(fil, classes, crit = {}) {
  const sel = selectedClasses(classes, crit);
  const q = normalize(crit.q);
  const types = crit.types?.length ? new Set(crit.types) : null;
  const socle = fil.socle && touches(sel, fil.socle.classes) ? fil.socle : null;
  const whole = !q || has(q, fil.nom) || (socle !== null && has(q, socle.texte));
  let etapes = (fil.etapes ?? []).filter(e => touches(sel, e.classes) && (!types || types.has(e.type)));
  if (!whole) etapes = etapes.filter(e => has(q, e.texte));
  if (etapes.length || (socle && whole && !types)) return { ...fil, socle, etapes };
  return null;
}

export function filterMatiere(m, classes, crit = {}) {
  const domaines = m.domaines
    .map(d => ({ ...d, fils: d.fils.map(f => filterFil(f, classes, crit)).filter(Boolean) }))
    .filter(d => d.fils.length);
  return domaines.length ? { ...m, domaines } : null;
}
