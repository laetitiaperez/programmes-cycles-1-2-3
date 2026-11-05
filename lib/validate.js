import { parseMarkup, stripMarkup, extractKeywords } from './markup.js';
import { normalize } from './normalize.js';

const comparable = (t) => { try { return normalize(stripMarkup(t)).replace(/’/g, "'"); } catch { return normalize(t); } };

export const TYPES = ['competence', 'attendu', 'notion', 'repere', 'exemple', 'crpe'];

export function validateData({ classes, textes, matieres, cycles }) {
  const errors = [];
  const err = (w, msg) => errors.push(`${w} : ${msg}`);
  const order = new Map(classes.map((c, i) => [c.id, i]));
  if (order.size !== classes.length) err('classes', 'id en double');
  for (const c of classes) {
    if (![1, 2, 3].includes(c.cycle)) err(`classes/${c.id}`, `cycle invalide ${c.cycle}`);
    if (!(Number.isInteger(c.age) && c.age >= 2 && c.age <= 12)) err(`classes/${c.id}`, 'âge invalide');
  }

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
      for (const id of sources) {
        if (!b.classes.some(c => tx.get(id).classes2026?.includes(c))) err(w, `${id} ne s’applique à aucune des classes ${b.classes.join(', ')} en 2026-27`);
      }
      for (const c of b.classes) {
        if (!sources.some(id => tx.get(id).classes2026?.includes(c))) err(w, `${sources.join(', ')} ne s’applique pas à ${c} en 2026-27`);
      }
    }
    if (b.page !== undefined && !(Number.isInteger(b.page) && b.page > 0)) err(w, 'page invalide');
  }

  // Bloc de couche complète ; classe = null pour les intentions de la matière.
  function checkBlocComplet(w, wb, b, classe) {
    if (typeof b.titre !== 'string' || !b.titre.trim()) err(w, `${wb} : titre manquant`);
    if (!(Number.isInteger(b.page) && b.page > 0)) err(w, `${wb} : page invalide`);
    if (!tx.has(b.source)) err(w, `${wb} : source inconnue « ${b.source} »`);
    else if (classe && !tx.get(b.source).classes2026?.includes(classe)) err(w, `${wb} : ${b.source} ne s’applique pas à ${classe} en 2026-27`);
    if (!Array.isArray(b.items) || !b.items.length) { err(w, `${wb} : aucun item`); return; }
    b.items.forEach(it => checkTexte(`${w}/${wb}`, it));
  }

  function checkComplet(wf, f, m) {
    const filClasses = new Set([f.socle, ...(f.etapes ?? [])].filter(Boolean).flatMap(b => b.classes ?? []));
    const complet = f.complet ?? {};
    for (const [c, k] of Object.entries(complet)) {
      if (!order.has(c)) { err(`${wf}/complet`, `complet : classe inconnue « ${c} »`); continue; }
      const wc = `${wf}/complet ${c}`;
      if (!filClasses.has(c)) err(wf, `complet ${c} : classe absente des étapes du fil`);
      if (!Array.isArray(k.blocs) || !k.blocs.length) { err(wf, `complet ${c} : aucun bloc`); continue; }
      k.blocs.forEach((b, i) => checkBlocComplet(wf, `complet ${c}/bloc ${i + 1}`, b, c));
      for (const r of k.reconduit ?? []) {
        if (!order.has(r.de) || order.get(r.de) >= order.get(c)) { err(wc, `reconduit de ${r.de} : classe non antérieure`); continue; }
        const src = complet[r.de];
        const textes = src ? [...(src.blocs ?? []).flatMap(b => b.items ?? []), ...(src.reconduit ?? []).map(x => x.texte)] : [];
        if (!textes.some(t => comparable(t) === comparable(r.texte))) err(wc, `reconduit de ${r.de} introuvable : « ${r.texte} »`);
      }
    }
    // Une étape commune à plusieurs classes porte sa couche complète à sa première classe.
    if (m.coucheComplete) {
      const requises = new Set([f.socle, ...(f.etapes ?? [])].filter(Boolean).map(b => b.classes?.[0]).filter(Boolean));
      for (const c of requises) if (!complet[c]) err(wf, `${f.id} : complet manquant pour ${c}`);
    }
  }

  const matIds = new Set();
  for (const m of matieres) {
    const w = `matieres/${m.id}`;
    if (matIds.has(m.id)) err(w, 'id de matière en double');
    matIds.add(m.id);
    if (!m.nom) err(w, 'nom manquant');
    checkTexte(`${w}/intentions`, m.intentions);
    (m.intentionsCompletes ?? []).forEach((b, i) => checkBlocComplet(w, `intentions complètes/bloc ${i + 1}`, b, null));
    if (m.intentionsParCycle !== undefined) {
      // Découpage par cycle du texte des intentions : aucun terme nouveau.
      let termes = new Set();
      try { termes = new Set(extractKeywords(m.intentions ?? '').map(normalize)); } catch {}
      for (const [k, t] of Object.entries(m.intentionsParCycle)) {
        if (!['1', '2', '3', 'tous'].includes(k)) { err(w, `intentionsParCycle : clé inconnue « ${k} »`); continue; }
        checkTexte(`${w}/intentionsParCycle ${k}`, t);
        let kws = [];
        try { kws = extractKeywords(t ?? ''); } catch {}
        for (const kw of kws) if (!termes.has(normalize(kw))) err(w, `intentionsParCycle ${k} : [[${kw}]] absent des intentions`);
      }
    }
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
        checkComplet(wf, f, m);
        for (let i = 1; i < etapes.length; i++) {
          const a = order.get(etapes[i - 1].classes?.[0]);
          const b = order.get(etapes[i].classes?.[0]);
          if (a !== undefined && b !== undefined && b < a) { err(wf, 'étapes hors ordre de classes'); break; }
        }
      }
    }
  }
  // Sans clé « cycles » (jeux de test des matières), pas de contrôle des cycles ; avec, les trois sont requis.
  const cycleIds = new Set();
  for (const cy of cycles ?? []) {
    const w = `cycles/${cy.id}`;
    if (![1, 2, 3].includes(cy.id)) { err(w, 'id de cycle invalide'); continue; }
    if (cycleIds.has(cy.id)) err(w, 'id de cycle en double');
    cycleIds.add(cy.id);
    if (typeof cy.nom !== 'string' || !cy.nom.trim()) err(w, 'nom manquant');
    if (checkClasses(w, cy.classes)) {
      for (const c of cy.classes) if (classes[order.get(c)].cycle !== cy.id) err(w, `${c} n’est pas du cycle ${cy.id}`);
    }
    if (!tx.has(cy.source)) err(w, `source inconnue « ${cy.source} »`);
    const blocs = cy.complet?.blocs ?? [];
    if (!blocs.length) err(w, 'aucun bloc de texte complet');
    if (!cy.idees?.length) err(w, 'aucune idée-force');
    blocs.forEach((b, i) => checkBlocComplet(w, `bloc ${i + 1}`, b, null));
    if (!Array.isArray(cy.idees)) { err(w, 'idees doit être une liste'); continue; }
    cy.idees.forEach((idee, i) => {
      checkTexte(`${w}/idée ${i + 1}`, idee.texte);
      if (!(Number.isInteger(idee.bloc) && idee.bloc >= 0 && idee.bloc < blocs.length)) err(`${w}/idée ${i + 1}`, `bloc ${idee.bloc} inexistant`);
    });
  }
  if (cycles) {
    const manquants = [1, 2, 3].filter(id => !cycleIds.has(id));
    if (manquants.length) err('cycles', `cycles manquants : ${manquants.join(', ')}`);
  }
  return errors;
}
