import { parseMarkup } from '../lib/markup.js';
import { MATIERES_BIBLIO } from '../lib/carte.js';

export const TYPE_LABELS = {
  competence: 'Compétence', attendu: 'Attendu', notion: 'Notion',
  repere: 'Repère', exemple: 'Exemple', crpe: 'À retenir CRPE',
};

export function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (v === true) n.setAttribute(k, '');
    else n.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) if (c != null && c !== false) n.append(c);
  return n;
}

// Une balise mal formée ne doit jamais casser la page : texte brut en repli.
export function renderMarkup(text, balise = 'mark') {
  const frag = document.createDocumentFragment();
  let tokens;
  try { tokens = parseMarkup(text ?? ''); } catch { frag.append(text ?? ''); return frag; }
  for (const t of tokens) frag.append(t.kind === 'kw' ? el(balise, { class: 'kw' }, t.value) : t.value);
  return frag;
}

export function classesLabel(cls, order) {
  if (cls.length < 2) return cls[0] ?? '';
  const contigu = cls.every((c, i) => i === 0 || order.get(c) === order.get(cls[i - 1]) + 1);
  return contigu ? `${cls[0]}→${cls[cls.length - 1]}` : cls.join(' · ');
}

export function renderLexique(lex, ctx) {
  if (!lex.length) return el('p', { class: 'vide' }, 'Aucun mot-clé pour ces filtres.');
  return lex.map(({ matiere, termes }) => el('section', { class: 'lexique' },
    el('h2', {}, matiere.nom),
    el('dl', {}, termes.map(t => [
      el('dt', {}, el('mark', { class: 'kw' }, t.terme)),
      el('dd', {}, t.occurrences.map((o, i) => [
        i ? ' · ' : null,
        o.filId
          ? el('a', { href: `#vue=carte&m=${encodeURIComponent(matiere.id)}&fil=${encodeURIComponent(o.filId)}` },
              o.filNom, o.classes.length ? ` (${classesLabel(o.classes, ctx.order)})` : '')
          : el('span', {}, o.filNom),
      ])),
    ]))));
}

// Bibliothèque : fiches de révision (HTML + PDF éventuel) puis textes officiels par matière.
// Repliés par défaut ; l'état ouvert/fermé est gardé pendant la session (changements de filtres).
let textesOuverts = false;

export function renderBibliotheque(fiches, textes, matieres, ctx) {
  const nomMatiere = (id) => MATIERES_BIBLIO[id] ?? matieres.find(m => m.id === id)?.nom ?? id;
  const ordre = Object.keys(MATIERES_BIBLIO);
  const parMatiere = new Map();
  for (const t of [...textes].sort((a, b) => ordre.indexOf(a.matiere) - ordre.indexOf(b.matiere))) {
    if (!parMatiere.has(t.matiere)) parMatiere.set(t.matiere, []);
    parMatiere.get(t.matiere).push(t);
  }
  return el('section', { class: 'bibliotheque' },
    el('h2', {}, 'Fiches de révision'),
    fiches.length
      ? el('ul', { class: 'cartes' }, fiches.map(f => el('li', { class: 'carte' },
          el('a', { class: 'carte-titre', href: f.html }, f.titre),
          el('p', {}, f.resume),
          el('p', { class: 'carte-actions' },
            el('a', { href: f.html }, 'Lire la fiche'),
            f.pdf ? [' · ', el('a', { href: f.pdf, download: '' }, 'PDF')] : null))))
      : el('p', { class: 'vide' }, 'Aucune fiche pour ces filtres.'),
    textesOfficiels(textes.length, ctx.q,
    parMatiere.size
      ? [...parMatiere].map(([id, list]) => el('section', { class: 'biblio-matiere' },
          el('h3', {}, nomMatiere(id)),
          el('ul', {}, list.map(t => el('li', {},
            (t.nouveauEn ?? []).length ? el('span', { class: 'badge-new' }, 'NOUVEAU') : null, ' ',
            el('a', { href: t.pdf, target: '_blank', rel: 'noopener' }, t.titre), ' ',
            el('small', {}, `${classesLabel(t.classes2026, ctx.order)} · ${t.bo}`))))))
      : el('p', { class: 'vide' }, 'Aucun texte pour ces filtres.')));
}

// Une recherche en cours ouvre la section pour que les résultats restent visibles.
function textesOfficiels(n, q, contenu) {
  const d = el('details', { class: 'biblio-textes', open: textesOuverts || Boolean(q) },
    el('summary', {}, el('h2', {}, `Textes officiels (${n})`)), contenu);
  d.addEventListener('toggle', () => { if (!q) textesOuverts = d.open; });
  return d;
}
