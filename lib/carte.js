import { normalize } from './normalize.js';
import { stripMarkup } from './markup.js';

// Noms et ordre d'affichage des matières (Bibliothèque, textes en vigueur), y compris celles pas encore saisies.
export const MATIERES_BIBLIO = {
  c1: 'École maternelle', francais: 'Français', maths: 'Mathématiques', hg: 'Histoire-géographie',
  sciences: 'Sciences et technologie', emc: 'Enseignement moral et civique', eps: 'Éducation physique et sportive',
  arts: 'Enseignements artistiques', lv: 'Langues vivantes', evar: 'Vie affective et relationnelle (EVAR)',
};

const blocsDuFil = (fil) => [fil.socle, ...(fil.etapes ?? [])].filter(Boolean);

export function classesDuFil(fil, order) {
  const cls = new Set(blocsDuFil(fil).flatMap(b => b.classes ?? []));
  return [...cls].filter(c => order.has(c)).sort((a, b) => order.get(a) - order.get(b));
}

function entree(fil, classe) {
  return {
    etapes: (fil.etapes ?? []).filter(e => e.classes.includes(classe)),
    socle: fil.socle?.classes.includes(classe) ? fil.socle : null,
    complet: fil.complet?.[classe] ?? null,
  };
}

export function friseDuFil(fil, classes) {
  const order = new Map(classes.map((c, i) => [c.id, i]));
  const info = new Map(classes.map(c => [c.id, c]));
  return classesDuFil(fil, order).map(classe => ({
    classe, cycle: info.get(classe).cycle, age: info.get(classe).age, ...entree(fil, classe),
  }));
}

export function vueClasse(matieres, classe) {
  return matieres.map(matiere => ({
    matiere,
    domaines: matiere.domaines.map(domaine => ({
      domaine,
      fils: domaine.fils.filter(f => blocsDuFil(f).some(b => b.classes.includes(classe)))
        .map(fil => ({ fil, ...entree(fil, classe) })),
    })).filter(d => d.fils.length),
  })).filter(m => m.domaines.length);
}

function brut(t) {
  try { return stripMarkup(t ?? ''); } catch { return String(t ?? ''); }
}
const comparable = (t) => normalize(brut(t)).replace(/’/g, "'");

export function rechercher(matieres, q) {
  const n = comparable(q);
  if (n.length < 2) return [];
  const vus = new Set();
  const resultats = [];
  const ajouter = (m, d, f, classe, texte) => {
    const cle = `${m.id}/${f.id}/${classe ?? ''}`;
    if (vus.has(cle) || !comparable(texte).includes(n)) return;
    vus.add(cle);
    const extrait = brut(texte);
    resultats.push({
      matiereId: m.id, domaineId: d.id, filId: f.id, filNom: f.nom, classe,
      extrait: extrait.length > 160 ? `${extrait.slice(0, 159)}…` : extrait,
    });
  };
  for (const m of matieres) for (const d of m.domaines) for (const f of d.fils) {
    ajouter(m, d, f, null, f.nom);
    if (f.socle) ajouter(m, d, f, null, f.socle.texte);
    for (const e of f.etapes ?? []) ajouter(m, d, f, e.classes[0], e.texte);
    for (const [c, k] of Object.entries(f.complet ?? {})) {
      for (const b of k.blocs ?? []) for (const it of b.items ?? []) ajouter(m, d, f, c, it);
    }
  }
  return resultats;
}

export function grouperTextes(textes) {
  const ordre = Object.keys(MATIERES_BIBLIO);
  const rang = (id) => (ordre.includes(id) ? ordre.indexOf(id) : ordre.length);
  const groupes = new Map();
  for (const t of [...textes].sort((a, b) => rang(a.matiere) - rang(b.matiere))) {
    if (!groupes.has(t.matiere)) groupes.set(t.matiere, []);
    groupes.get(t.matiere).push(t);
  }
  return [...groupes].map(([matiere, list]) => ({ matiere, textes: list }));
}
