import { parseMarkup } from '../lib/markup.js';
import { estNouveau, sourcesDivergentes } from '../lib/textes.js';

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
export function renderMarkup(text) {
  const frag = document.createDocumentFragment();
  let tokens;
  try { tokens = parseMarkup(text ?? ''); } catch { frag.append(text ?? ''); return frag; }
  for (const t of tokens) frag.append(t.kind === 'kw' ? el('mark', { class: 'kw' }, t.value) : t.value);
  return frag;
}

export function classesLabel(cls, order) {
  if (cls.length < 2) return cls[0] ?? '';
  const contigu = cls.every((c, i) => i === 0 || order.get(c) === order.get(cls[i - 1]) + 1);
  return contigu ? `${cls[0]}→${cls[cls.length - 1]}` : cls.join(' · ');
}

function sourceLinks(bloc, ctx, divergent) {
  return (bloc.sources ?? []).map(id => {
    const t = ctx.textes.get(id);
    if (!t) return null;
    const href = bloc.page ? `${t.pdf}#page=${bloc.page}` : t.pdf;
    const label = `${divergent ? `${t.titre} · ` : ''}PDF${bloc.page ? ` p.${bloc.page}` : ''}`;
    return el('a', { class: divergent ? 'src src-diff' : 'src', href, target: '_blank', rel: 'noopener', title: `${t.titre} — ${t.bo}` }, label);
  });
}

function meta(label, bloc, ctx, divergent, type) {
  return el('span', { class: 'meta' },
    el('span', { class: 'cls' }, label),
    type ? el('span', { class: `type t-${type}` }, TYPE_LABELS[type]) : null,
    estNouveau(bloc, ctx.textes) ? el('span', { class: 'badge-new' }, 'NOUVEAU 2026') : null,
    sourceLinks(bloc, ctx, divergent));
}

function renderEtape(e, ctx, divergent) {
  const m = meta(classesLabel(e.classes, ctx.order), e, ctx, divergent, e.type);
  const body = el('p', { class: 'txt' }, renderMarkup(e.texte));
  if (e.type === 'exemple') {
    return el('li', { class: 'etape t-exemple' }, el('details', {}, el('summary', {}, m), body));
  }
  return el('li', { class: `etape t-${e.type}` }, m, body);
}

export function renderFil(fil, matiereId, ctx) {
  const div = sourcesDivergentes(fil);
  return el('article', { class: 'fil', id: `fil-${matiereId}-${fil.id}` },
    el('h4', {}, fil.nom),
    fil.socle ? el('div', { class: 'socle' },
      meta(`Socle ${classesLabel(fil.socle.classes, ctx.order)}`, fil.socle, ctx, div),
      el('p', { class: 'txt' }, renderMarkup(fil.socle.texte))) : null,
    fil.etapes.length ? el('ol', { class: 'etapes' }, fil.etapes.map(e => renderEtape(e, ctx, div))) : null);
}

export function renderMatiere(m, ctx) {
  return el('section', { class: 'matiere', id: `m-${m.id}` },
    el('h2', {}, m.nom, m.nomMaternelle ? el('small', {}, `Maternelle : ${m.nomMaternelle}`) : null),
    m.intentions ? el('details', { class: 'intentions' },
      el('summary', {}, 'Intentions générales'), el('p', {}, renderMarkup(m.intentions))) : null,
    m.domaines.map(d => el('section', { class: 'domaine' },
      el('h3', {}, d.nom),
      d.fils.map(f => renderFil(f, m.id, ctx)))));
}

// groupes : [{ cycle, list }] — un seul encart, une sous-liste par cycle.
export function renderNouveautes(groupes, open) {
  const titre = groupes.length === 1 ? `Ce qui change en 2026-27 · cycle ${groupes[0].cycle}` : 'Ce qui change en 2026-27';
  return el('details', { class: 'encart nouveautes', open },
    el('summary', {}, titre),
    groupes.map(({ cycle, list }) => [
      groupes.length > 1 ? el('h3', {}, `Cycle ${cycle}`) : null,
      el('ul', {}, list.length
        ? list.map(t => el('li', {},
            el('a', { href: t.pdf, target: '_blank', rel: 'noopener' }, t.titre),
            ` — ${t.classesCycle.join(', ')} `, el('small', {}, t.bo)))
        : el('li', {}, 'Aucun nouveau programme pour ce cycle.')),
    ]));
}

export function renderTextesClasse(classe, list) {
  return el('aside', { class: 'encart' },
    el('h2', {}, `Textes en vigueur en ${classe} (2026-27)`),
    el('ul', {}, list.map(t => el('li', {},
      (t.nouveauEn ?? []).includes(classe) ? el('span', { class: 'badge-new' }, 'NOUVEAU') : null, ' ',
      el('a', { href: t.pdf, target: '_blank', rel: 'noopener' }, t.titre), ' ', el('small', {}, t.bo)))));
}

export function renderChoixClasse(classes) {
  return el('section', { class: 'choix' },
    el('h2', {}, 'Choisis une classe'),
    [1, 2, 3].map(cy => el('div', { class: 'groupe' },
      el('h3', {}, `Cycle ${cy}`),
      el('div', { class: 'chips' }, classes.filter(c => c.cycle === cy)
        .map(c => el('a', { class: 'chip', href: `#vue=classe&c=${encodeURIComponent(c.id)}` }, c.id))))));
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
          ? el('a', { href: `#m=${encodeURIComponent(matiere.id)}&f=${encodeURIComponent(o.filId)}` },
              o.filNom, o.classes.length ? ` (${classesLabel(o.classes, ctx.order)})` : '')
          : el('span', {}, o.filNom),
      ])),
    ]))));
}

// Noms et ordre d'affichage des matières dans la Bibliothèque (y compris celles pas encore saisies).
const MATIERES_BIBLIO = {
  c1: 'École maternelle', francais: 'Français', maths: 'Mathématiques', hg: 'Histoire-géographie',
  sciences: 'Sciences et technologie', emc: 'Enseignement moral et civique', eps: 'Éducation physique et sportive',
  arts: 'Enseignements artistiques', lv: 'Langues vivantes', evar: 'Vie affective et relationnelle (EVAR)',
};

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
