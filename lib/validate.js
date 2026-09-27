import { parseMarkup } from './markup.js';

export const TYPES = ['competence', 'attendu', 'notion', 'repere', 'exemple', 'crpe'];

export function validateData({ classes, textes, matieres }) {
  const errors = [];
  const err = (w, msg) => errors.push(`${w} : ${msg}`);
  const order = new Map(classes.map((c, i) => [c.id, i]));
  if (order.size !== classes.length) err('classes', 'id en double');
  for (const c of classes) if (![1, 2, 3].includes(c.cycle)) err(`classes/${c.id}`, `cycle invalide ${c.cycle}`);

  function checkClasses(w, list) {
    if (!Array.isArray(list) || !list.length) { err(w, 'classes manquantes'); return false; }
    let ok = true;
    for (const c of list) if (!order.has(c)) { err(w, `classe inconnue « ${c} »`); ok = false; }
    if (ok) {
      for (let i = 1; i < list.length; i++) {
        if (order.get(list[i]) <= order.get(list[i - 1])) { err(w, 'classes hors ordre ou en double'); return false; }
      }
    }
    return ok;
  }

  const tx = new Map();
  for (const t of textes) {
    const w = `textes/${t.id}`;
    if (tx.has(t.id)) err(w, 'id en double');
    tx.set(t.id, t);
    for (const k of ['id', 'titre', 'matiere', 'bo', 'pdf']) {
      if (typeof t[k] !== 'string' || !t[k]) err(w, `champ « ${k} » manquant`);
    }
    if (!/^https:\/\//.test(t.pdf ?? '')) err(w, 'pdf doit être une URL https');
    if (checkClasses(w, t.classes2026)) {
      if (!Array.isArray(t.nouveauEn)) err(w, 'nouveauEn doit être une liste');
      else for (const c of t.nouveauEn) if (!t.classes2026.includes(c)) err(w, `nouveauEn contient ${c}, absent de classes2026`);
    }
  }

  function checkTexte(w, texte) {
    if (typeof texte !== 'string' || !texte.trim()) { err(w, 'texte manquant'); return; }
    try { parseMarkup(texte); } catch (e) { err(w, e.message); }
  }

  function checkBloc(w, b, isEtape) {
    const clsOk = checkClasses(w, b.classes);
    checkTexte(w, b.texte);
    if (isEtape && !TYPES.includes(b.type)) err(w, `type inconnu « ${b.type} »`);
    const sources = b.sources ?? [];
    if (!Array.isArray(sources)) { err(w, 'sources doit être une liste'); return; }
    if (!sources.length && b.type !== 'crpe') err(w, 'sources manquantes');
    let srcOk = true;
    for (const id of sources) if (!tx.has(id)) { err(w, `source inconnue « ${id} »`); srcOk = false; }
    if (clsOk && srcOk && sources.length) {
      for (const c of b.classes) {
        if (!sources.some(id => tx.get(id).classes2026?.includes(c))) err(w, `${sources.join(', ')} ne s’applique pas à ${c} en 2026-27`);
      }
    }
    if (b.page !== undefined && !(Number.isInteger(b.page) && b.page > 0)) err(w, 'page invalide');
  }

  const matIds = new Set();
  for (const m of matieres) {
    const w = `matieres/${m.id}`;
    if (matIds.has(m.id)) err(w, 'id de matière en double');
    matIds.add(m.id);
    if (!m.nom) err(w, 'nom manquant');
    checkTexte(`${w}/intentions`, m.intentions);
    if (m.nomMaternelle !== undefined && typeof m.nomMaternelle !== 'string') err(w, 'nomMaternelle doit être un texte');
    if (!Array.isArray(m.domaines) || !m.domaines.length) { err(w, 'aucun domaine'); continue; }
    const domIds = new Set();
    const filIds = new Set();
    for (const d of m.domaines) {
      const wd = `${w}/${d.id}`;
      if (domIds.has(d.id)) err(wd, 'id de domaine en double');
      domIds.add(d.id);
      if (!d.nom) err(wd, 'nom manquant');
      if (!Array.isArray(d.fils) || !d.fils.length) { err(wd, 'aucun fil'); continue; }
      for (const f of d.fils) {
        const wf = `${wd}/${f.id}`;
        if (filIds.has(f.id)) err(wf, 'id de fil en double');
        filIds.add(f.id);
        if (!f.nom) err(wf, 'nom manquant');
        const etapes = f.etapes ?? [];
        if (!f.socle && !etapes.length) err(wf, 'fil vide');
        if (f.socle) checkBloc(`${wf}/socle`, f.socle, false);
        etapes.forEach((e, i) => checkBloc(`${wf}/étape ${i + 1}`, e, true));
        for (let i = 1; i < etapes.length; i++) {
          const a = order.get(etapes[i - 1].classes?.[0]);
          const b = order.get(etapes[i].classes?.[0]);
          if (a !== undefined && b !== undefined && b < a) { err(wf, 'étapes hors ordre de classes'); break; }
        }
      }
    }
  }
  return errors;
}
