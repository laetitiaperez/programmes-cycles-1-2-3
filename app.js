import { parseHash, toHash, sanitizeState, DEFAULT_STATE } from './lib/url.js';
import { filterMatiere } from './lib/filters.js';
import { indexTextes, nouveautesCycle, textesPourClasse, filtrerTextes } from './lib/textes.js';
import { buildLexique, filterLexique } from './lib/lexique.js';
import { TYPES } from './lib/validate.js';
import {
  el, TYPE_LABELS, renderMatiere, renderNouveautes, renderTextesClasse, renderLexique, renderChoixClasse,
  renderBibliotheque,
} from './ui/render.js';

const $ = (id) => document.getElementById(id);
let data;
let ctx;
let state = { ...DEFAULT_STATE };

async function getJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path} : HTTP ${r.status}`);
  return r.json();
}

async function load() {
  const [classes, textes, ids, fiches] = await Promise.all([
    getJSON('data/classes.json'), getJSON('data/textes.json'), getJSON('data/matieres/index.json'),
    getJSON('data/fiches.json'),
  ]);
  const matieres = await Promise.all(ids.map(id => getJSON(`data/matieres/${id}.json`)));
  return { classes, textes, matieres, fiches };
}

function go(patch, replace = false) {
  const url = toHash({ ...state, ...patch }) || location.pathname + location.search;
  history[replace ? 'replaceState' : 'pushState'](null, '', url);
  render();
}

function setupForm() {
  for (const c of data.classes) $('f-c').append(new Option(c.id, c.id));
  for (const m of data.matieres) $('f-m').append(new Option(m.nom, m.id));
  for (const t of TYPES) {
    $('f-t').append(el('label', { class: 'chip' }, el('input', { type: 'checkbox', value: t }), TYPE_LABELS[t]));
  }
  for (const b of $('cycles').querySelectorAll('button')) {
    b.onclick = () => {
      const cy = b.dataset.cy;
      const cls = data.classes.find(c => c.id === state.c);
      go({ cy, c: cls && String(cls.cycle) === cy ? state.c : '', f: '' });
    };
  }
  $('f-c').onchange = (e) => go({ c: e.target.value, f: '' });
  $('f-m').onchange = (e) => go({ m: e.target.value, f: '' });
  $('f-t').onchange = () => go({ t: [...$('f-t').querySelectorAll('input:checked')].map(i => i.value), f: '' });
  let timer;
  $('f-q').oninput = (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => go({ q: e.target.value.trim(), f: '' }, true), 200);
  };
  $('raz').onclick = () => go({ ...DEFAULT_STATE, vue: state.vue });
  for (const b of $('vues').querySelectorAll('button')) {
    b.onclick = () => { go({ vue: b.dataset.vue, f: '' }); $('menu').close(); scrollTo(0, 0); };
  }
  $('theme').onclick = toggleTheme;
  $('ouvrir-menu').onclick = () => $('menu').showModal();
  $('fermer-menu').onclick = () => $('menu').close();
  // Un clic sur le fond (hors du panneau) ferme le menu.
  $('menu').addEventListener('click', (e) => { if (e.target === $('menu')) $('menu').close(); });
}

const NOMS_VUES = { matiere: 'Par matière', classe: 'Par classe', lexique: 'Lexique', biblio: 'Bibliothèque' };

// Ligne de contexte sous la recherche : vue courante + filtres actifs, chacun supprimable.
function renderContexte() {
  const nomMatiere = data.matieres.find(m => m.id === state.m)?.nom;
  const actifs = [
    state.c ? [state.c, { c: '' }] : state.cy ? [`Cycle ${state.cy}`, { cy: '' }] : null,
    nomMatiere ? [nomMatiere, { m: '' }] : null,
    state.t.length ? [state.t.map(t => TYPE_LABELS[t]).join(', '), { t: [] }] : null,
  ].filter(Boolean);
  $('badge-filtres').hidden = !actifs.length;
  $('badge-filtres').textContent = actifs.length;
  $('contexte').hidden = false;
  $('contexte').replaceChildren(
    el('strong', {}, NOMS_VUES[state.vue]),
    ...actifs.flatMap(([label]) => [' · ', el('button', {
      type: 'button', class: 'filtre-actif', 'aria-label': `Retirer le filtre ${label}`,
    }, `${label} ✕`)]),
  );
  $('contexte').querySelectorAll('.filtre-actif').forEach((b, i) => { b.onclick = () => go({ ...actifs[i][1], f: '' }); });
}

function syncForm() {
  for (const b of $('cycles').querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(b.dataset.cy === state.cy));
  }
  // La liste des classes se limite au cycle choisi.
  for (const o of $('f-c').options) {
    const cls = data.classes.find(c => c.id === o.value);
    o.hidden = Boolean(cls && state.cy && String(cls.cycle) !== state.cy);
  }
  $('f-c').value = state.c;
  $('f-m').value = state.m;
  for (const i of $('f-t').querySelectorAll('input')) i.checked = state.t.includes(i.value);
  if (document.activeElement !== $('f-q')) $('f-q').value = state.q;
  for (const b of $('vues').querySelectorAll('button')) {
    b.setAttribute('aria-current', b.dataset.vue === state.vue ? 'page' : 'false');
  }
  renderContexte();
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
}

function render() {
  state = sanitizeState(parseHash(location.hash), {
    classes: data.classes, matiereIds: data.matieres.map(m => m.id), types: TYPES,
  });
  syncForm();
  const main = $('contenu');
  main.replaceChildren();
  const crit = { cycle: state.cy, classe: state.c, types: state.t, q: state.q };
  const matieres = data.matieres.filter(m => !state.m || m.id === state.m);

  if (state.vue === 'lexique') {
    const visibles = matieres.map(m => filterMatiere(m, data.classes, { ...crit, q: '' })).filter(Boolean);
    main.append(...[renderLexique(filterLexique(buildLexique(visibles, data.classes), state.q), ctx)].flat());
    return;
  }
  if (state.vue === 'biblio') {
    const fiches = data.fiches.filter(f => (!state.m || f.matiere === state.m) && (!state.cy || f.cycles.includes(Number(state.cy))));
    const textes = filtrerTextes(data.textes, data.classes, { cycle: state.cy, classe: state.c, matiere: state.m, q: state.q });
    main.append(renderBibliotheque(fiches, textes, data.matieres, ctx));
    return;
  }
  if (state.vue === 'classe' && !state.c) {
    main.append(renderChoixClasse(data.classes));
    return;
  }
  if (state.vue === 'classe') {
    main.append(renderTextesClasse(state.c, textesPourClasse(data.textes, state.c)));
  } else {
    const cycles = state.cy ? [Number(state.cy)] : [1, 2, 3];
    const groupes = cycles.map(cycle => ({ cycle, list: nouveautesCycle(data.textes, data.classes, cycle) }));
    main.append(renderNouveautes(groupes, Boolean(state.cy) && !state.c));
  }
  const resultats = matieres.map(m => filterMatiere(m, data.classes, crit)).filter(Boolean);
  if (!resultats.length) main.append(el('p', { class: 'vide' }, 'Aucun résultat pour ces filtres.'));
  const sansMaternelle = state.cy && state.cy !== '1';
  for (const m of resultats) main.append(renderMatiere(sansMaternelle ? { ...m, nomMaternelle: undefined } : m, ctx));

  if (state.f) {
    const cible = document.getElementById(`fil-${state.m}-${state.f}`);
    if (cible) { cible.classList.add('cible'); cible.scrollIntoView({ block: 'start' }); }
  }
}

try {
  data = await load();
  ctx = { textes: indexTextes(data.textes), order: new Map(data.classes.map((c, i) => [c.id, i])) };
  setupForm();
  addEventListener('hashchange', render);
  addEventListener('popstate', render);
  render();
} catch (e) {
  $('contenu').replaceChildren(el('p', { class: 'vide' }, `Impossible de charger les programmes (${e.message}).`));
}
