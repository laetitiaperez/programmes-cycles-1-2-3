import { normalize } from './normalize.js';
import { extractKeywords } from './markup.js';

export function buildLexique(matieres, classes) {
  const order = new Map(classes.map((c, i) => [c.id, i]));
  return matieres.map(m => {
    const termes = new Map();
    const add = (texte, occ, cls) => {
      let kws;
      try { kws = extractKeywords(texte ?? ''); } catch { return; }
      for (const kw of kws) {
        const key = normalize(kw);
        if (!termes.has(key)) termes.set(key, { terme: kw, occ: new Map() });
        const occs = termes.get(key).occ;
        const k = occ.filId ?? '';
        if (!occs.has(k)) occs.set(k, { ...occ, classes: new Set() });
        for (const c of cls) occs.get(k).classes.add(c);
      }
    };
    add(m.intentions, { domaineId: null, filId: null, filNom: 'Intentions' }, []);
    for (const d of m.domaines) {
      for (const f of d.fils) {
        const occ = { domaineId: d.id, filId: f.id, filNom: f.nom };
        if (f.socle) add(f.socle.texte, occ, f.socle.classes);
        for (const e of f.etapes ?? []) add(e.texte, occ, e.classes);
      }
    }
    const list = [...termes.values()]
      .map(t => ({
        terme: t.terme,
        occurrences: [...t.occ.values()].map(o => ({ ...o, classes: [...o.classes].sort((a, b) => order.get(a) - order.get(b)) })),
      }))
      .sort((a, b) => a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base', numeric: true }));
    return { matiere: { id: m.id, nom: m.nom }, termes: list };
  });
}

export function filterLexique(lex, q) {
  const n = normalize(q);
  if (!n) return lex;
  return lex
    .map(e => ({ ...e, termes: e.termes.filter(t => normalize(t.terme).includes(n)) }))
    .filter(e => e.termes.length);
}
