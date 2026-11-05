import { el, renderMarkup, classesLabel, TYPE_LABELS } from './render.js';
import { estNouveau, textesPourClasse } from '../lib/textes.js';
import { MATIERES_BIBLIO } from '../lib/carte.js';

const lien = (params) => `#${new URLSearchParams(params).toString()}`;
const badgeNouveau = () => el('span', { class: 'badge-new' }, 'NOUVEAU 2026');

function lienPdf(texte, page, avecTitre = false) {
  if (!texte) return null;
  const href = page ? `${texte.pdf}#page=${page}` : texte.pdf;
  return el('a', { class: 'src', href, target: '_blank', rel: 'noopener', title: `${texte.titre} — ${texte.bo}` },
    `${avecTitre ? `${texte.titre} · ` : ''}PDF${page ? ` p. ${page}` : ''}`);
}

// Couche 1 d'une case : les étapes hors exemples, sinon le socle.
function resume(entree) {
  const etapes = entree.etapes.filter(e => e.type !== 'exemple');
  const blocs = etapes.length ? etapes : entree.socle ? [entree.socle] : entree.etapes;
  return blocs.map((b, i) => [i ? ' ' : null, renderMarkup(b.texte)]);
}

const nouveau = (entree, ctx) => [entree.socle, ...entree.etapes].some(b => b && estNouveau(b, ctx.textes));

export function renderAccueil(matieres, groupesTextes, ctx) {
  return el('section', { class: 'accueil' },
    el('h2', {}, 'Programmes en vigueur en 2026-2027'),
    el('p', { class: 'intro' }, 'Choisis une matière pour ouvrir sa carte : domaines, fils de progression de la PS à la 6e, puis le contenu complet de chaque classe.'),
    el('ul', { class: 'cartes' }, matieres.map(m => {
      const fils = m.domaines.flatMap(d => d.fils);
      const detaille = fils.some(f => f.complet && Object.keys(f.complet).length);
      return el('li', { class: 'carte' },
        el('a', { class: 'carte-titre', href: lien({ vue: 'carte', m: m.id }) }, m.nom),
        el('p', {}, `${m.domaines.length} domaines · ${fils.length} fils`),
        el('p', { class: detaille ? 'etat-ok' : 'etat-attente' }, detaille ? 'Contenu complet disponible' : 'Contenu détaillé à venir'));
    })),
    el('details', { class: 'encart' },
      el('summary', {}, 'Textes en vigueur en 2026-2027'),
      groupesTextes.map(({ matiere, textes }) => [
        el('h3', {}, MATIERES_BIBLIO[matiere] ?? matiere),
        el('ul', {}, textes.map(t => el('li', {},
          (t.nouveauEn ?? []).length ? [el('span', { class: 'badge-new' }, `NOUVEAU en ${t.nouveauEn.join(', ')}`), ' '] : null,
          el('a', { href: t.pdf, target: '_blank', rel: 'noopener' }, t.titre), ' — ',
          classesLabel(t.classes2026, ctx.order), ' ', el('small', {}, t.bo)))),
      ])));
}

export function renderCarte(m, state, frise, ctx) {
  const domaine = m.domaines.find(d => d.id === state.d);
  const panneau = el('div', { class: 'carte-fils', style: `--n: ${m.domaines.length}` },
    domaine
      ? el('ul', {}, domaine.fils.map(f => el('li', {},
          el('a', { href: lien({ vue: 'carte', m: m.id, d: domaine.id, fil: f.id }), 'aria-current': f.id === state.fil ? 'true' : null }, f.nom))))
      : el('p', { class: 'indice' }, 'Choisis un domaine pour voir ses fils de progression.'));
  const items = [];
  for (const d of m.domaines) {
    const actif = d.id === state.d;
    items.push(el('a', { class: 'carte-domaine', href: lien({ vue: 'carte', m: m.id, d: d.id }), 'aria-current': actif ? 'true' : null }, d.nom));
    if (actif) items.push(panneau);
  }
  if (!domaine) items.push(panneau);
  const fil = domaine?.fils.find(f => f.id === state.fil);
  return el('section', { class: 'carte-matiere' },
    el('h2', {}, m.nom, m.nomMaternelle ? el('small', {}, `Maternelle : ${m.nomMaternelle}`) : null),
    m.intentions ? el('details', { class: 'intentions' }, el('summary', {}, 'Intentions générales'), el('p', {}, renderMarkup(m.intentions))) : null,
    el('nav', { class: 'carte-grille', 'aria-label': `Domaines et fils — ${m.nom}` }, items),
    fil ? renderFrise(m, fil, frise, state, ctx) : null);
}

export function renderFrise(m, fil, frise, state, ctx) {
  const active = frise.find(x => x.classe === state.c);
  return el('section', { class: 'frise', id: 'frise' },
    el('h3', {}, fil.nom),
    el('ol', { class: 'frise-cases' }, frise.map(x => el('li', {},
      el('a', {
        class: 'case', href: lien({ vue: 'carte', m: m.id, d: state.d, fil: fil.id, c: x.classe }),
        'aria-current': x.classe === state.c ? 'true' : null,
      },
        el('span', { class: 'case-tete' }, el('strong', {}, x.classe), ` C${x.cycle} · ${x.age} ans`, nouveau(x, ctx) ? [' ', badgeNouveau()] : null),
        el('span', { class: 'case-resume' }, resume(x)))))),
    active ? renderComplet(active, ctx) : el('p', { class: 'indice' }, 'Choisis une classe pour voir le contenu complet.'));
}

export function renderComplet(entree, ctx) {
  const k = entree.complet;
  if (!k) {
    return el('div', { class: 'complet' },
      el('ul', { class: 'etapes-simples' }, [entree.socle, ...entree.etapes].filter(Boolean).map(b => el('li', {},
        b.type ? el('span', { class: 'type' }, TYPE_LABELS[b.type]) : el('span', { class: 'type' }, 'Socle'), ' ',
        renderMarkup(b.texte), ' ', (b.sources ?? []).map(id => lienPdf(ctx.textes.get(id), b.page))))),
      el('p', { class: 'a-venir' }, 'Contenu détaillé à venir pour cette matière.'));
  }
  return el('div', { class: 'complet' },
    k.blocs.map(b => el('section', { class: 'bloc' },
      el('h4', {}, b.titre, ' ', lienPdf(ctx.textes.get(b.source), b.page)),
      el('ul', {}, b.items.map(it => el('li', {}, renderMarkup(it, 'strong')))))),
    (k.reconduit ?? []).length
      ? el('details', { class: 'reconduit' },
          el('summary', {}, `Reconduit (${k.reconduit.length})`),
          el('ul', {}, k.reconduit.map(r => el('li', {}, el('span', { class: 'type' }, `du ${r.de}`), ' ', renderMarkup(r.texte, 'strong')))))
      : null);
}

function selecteurClasse(classes, courante) {
  return el('nav', { class: 'choix', 'aria-label': 'Classes' },
    [1, 2, 3].map(cy => el('div', { class: 'groupe' },
      el('h3', {}, `Cycle ${cy}`),
      el('div', { class: 'chips' }, classes.filter(c => c.cycle === cy).map(c =>
        el('a', { class: 'chip', href: lien({ vue: 'classe', c: c.id }), 'aria-current': c.id === courante ? 'true' : null }, c.id))))));
}

export function renderVueClasse(classes, textes, classe, vue, ctx) {
  const info = classes.find(c => c.id === classe);
  if (!info) return selecteurClasse(classes, '');
  return el('section', { class: 'vue-classe' },
    selecteurClasse(classes, classe),
    el('h2', {}, `${classe} · cycle ${info.cycle} · ${info.age} ans`),
    el('details', { class: 'encart' },
      el('summary', {}, `Textes en vigueur en ${classe} (2026-2027)`),
      el('ul', {}, textesPourClasse(textes, classe).map(t => el('li', {},
        (t.nouveauEn ?? []).includes(classe) ? [badgeNouveau(), ' '] : null,
        el('a', { href: t.pdf, target: '_blank', rel: 'noopener' }, t.titre), ' ', el('small', {}, t.bo))))),
    vue.map(({ matiere, domaines }) => el('section', { class: 'classe-matiere' },
      el('h2', {}, el('a', { href: lien({ vue: 'carte', m: matiere.id }) }, matiere.nom)),
      domaines.map(({ domaine, fils }) => el('section', { class: 'domaine' },
        el('h3', {}, domaine.nom),
        fils.map(x => el('details', { class: 'fil-classe' },
          el('summary', {}, el('strong', {}, x.fil.nom), nouveau(x, ctx) ? [' ', badgeNouveau()] : null,
            el('span', { class: 'case-resume' }, resume(x))),
          renderComplet(x, ctx))))))));
}

export function renderResultats(resultats, matieres, q) {
  if (!resultats.length) return el('p', { class: 'vide' }, `Aucun résultat pour « ${q} ».`);
  const nom = new Map(matieres.map(m => [m.id, m.nom]));
  return el('section', { class: 'resultats' },
    el('h2', {}, `${resultats.length} résultat${resultats.length > 1 ? 's' : ''} pour « ${q} »`),
    el('ul', {}, resultats.map(r => el('li', {},
      el('a', { href: lien({ vue: 'carte', m: r.matiereId, d: r.domaineId, fil: r.filId, ...(r.classe ? { c: r.classe } : {}) }) },
        `${nom.get(r.matiereId)} › ${r.filNom}`, r.classe ? ` · ${r.classe}` : ''),
      el('p', {}, r.extrait)))));
}
