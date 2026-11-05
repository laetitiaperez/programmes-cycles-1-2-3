// Carte par cycle : bandeau d'accueil et page d'un cycle (principes au centre, disciplines autour).
import { el, renderMarkup, classesLabel } from './render.js';
import { lienPdf } from './carte.js';
import { sectionsDuCycle, intentionsCompletesDuCycle } from '../lib/cycles.js';

const lien = (params) => `#${new URLSearchParams(params).toString()}`;

function reperes(cycle, classes) {
  const cls = classes.filter(c => c.cycle === cycle.id);
  return `${cls.map(c => c.id).join('-')} · ${cls[0].age}-${cls[cls.length - 1].age} ans`;
}

export function renderBandeauCycles(cycles, classes) {
  return el('nav', { class: 'bandeau-cycles', 'aria-label': 'Entrer par cycle' },
    el('h2', {}, 'Entrer par cycle'),
    el('ul', { class: 'cartes' }, cycles.map(c => el('li', { class: 'carte carte-cycle' },
      el('a', { class: 'carte-titre', href: lien({ vue: 'cycle', cy: String(c.id) }) }, `Cycle ${c.id}`),
      el('p', {}, c.nom),
      el('p', {}, reperes(c, classes))))));
}

function renderBloc(b, ctx) {
  return el('section', { class: 'bloc' },
    el('h4', {}, b.titre, ' ', lienPdf(ctx.textes.get(b.source), b.page)),
    el('ul', {}, b.items.map(it => el('li', {}, renderMarkup(it, 'strong')))));
}

function renderCentre(cycle, ctx) {
  return el('section', { class: 'cycle-centre', 'aria-label': `Principes du cycle ${cycle.id}` },
    el('h3', {}, 'Principes du cycle'),
    el('ul', { class: 'idees' }, sectionsDuCycle(cycle).map(s => el('li', {},
      el('ul', {}, s.idees.map(i => el('li', {}, renderMarkup(i.texte)))),
      el('details', { class: 'texte-officiel' },
        el('summary', {}, 'Texte officiel'),
        s.blocs.map(b => renderBloc(b, ctx)))))),
    cycle.id === 1
      ? el('p', { class: 'voir-aussi' }, el('a', { href: lien({ vue: 'carte', m: 'maternelle' }) }, 'Voir aussi la carte des principes de la maternelle'))
      : null);
}

function renderPanneau(cycle, d, ctx, classes) {
  if (!d) return el('p', { class: 'indice', id: 'panneau-discipline' }, 'Choisis une discipline pour voir ses principes, ses textes et ses domaines.');
  const complets = intentionsCompletesDuCycle(d.matiere, ctx.textes, classes, cycle.id);
  return el('section', { class: 'panneau-discipline', id: 'panneau-discipline' },
    el('h3', {}, d.nom),
    el('ul', { class: 'etiquettes' }, d.etiquettes.map(e => {
      const t = ctx.textes.get(e.texteId);
      const nouveau = (t.nouveauEn ?? []).some(c => e.classes.includes(c));
      return el('li', {}, el('strong', {}, classesLabel(e.classes, ctx.order)), ' · ',
        el('a', { href: t.pdf, target: '_blank', rel: 'noopener', title: t.bo }, t.titre),
        nouveau ? [' ', el('span', { class: 'badge-new' }, 'NOUVEAU 2026')] : null);
    })),
    d.principes.length
      ? el('div', { class: 'principes' }, d.principes.map(p => el('p', {}, renderMarkup(p))))
      : el('p', { class: 'a-venir' }, 'Pas de principes propres à ce cycle dans le résumé.'),
    complets.length
      ? el('details', { class: 'texte-officiel' }, el('summary', {}, 'Lire en entier'), complets.map(b => renderBloc(b, ctx)))
      : null,
    el('h4', {}, 'Domaines'),
    el('ul', { class: 'domaines-cycle' }, d.domaines.map(dom => el('li', {},
      el('a', { href: lien({ vue: 'carte', m: d.matiere.id, d: dom.id, cy: String(cycle.id) }) }, dom.nom)))));
}

export function renderCycle(cycle, cycles, disciplines, state, ctx, classes) {
  const active = disciplines.find(d => d.matiere.id === state.m);
  return el('section', { class: 'carte-cycle-page' },
    el('nav', { class: 'chips', 'aria-label': 'Cycles' }, cycles.map(c =>
      el('a', { class: 'chip', href: lien({ vue: 'cycle', cy: String(c.id) }), 'aria-current': c.id === cycle.id ? 'true' : null }, `Cycle ${c.id}`))),
    el('h2', {}, `Cycle ${cycle.id} · ${cycle.nom.toLowerCase()}`, el('small', {}, reperes(cycle, classes))),
    el('div', { class: 'cycle-carte', style: `--rangs: ${Math.max(1, Math.ceil(disciplines.length / 2))}` },
      renderCentre(cycle, ctx),
      el('nav', { class: 'cycle-branches', 'aria-label': `Disciplines du cycle ${cycle.id}` }, disciplines.map(d =>
        el('a', { class: 'branche', href: lien({ vue: 'cycle', cy: String(cycle.id), m: d.matiere.id }),
          'aria-current': d === active ? 'true' : null }, d.nom)))),
    renderPanneau(cycle, active, ctx, classes));
}

