import { parseHash, toHash, sanitizeState, DEFAULT_STATE } from './lib/url.js';
import { filterMatiere } from './lib/filters.js';
import { indexTextes, nouveautesCycle, textesPourClasse } from './lib/textes.js';
import { buildLexique, filterLexique } from './lib/lexique.js';
import { TYPES } from './lib/validate.js';
import {
  el, TYPE_LABELS, renderMatiere, renderNouveautes, renderTextesClasse, renderLexique, renderChoixClasse,
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
  const [classes, textes, ids] = await Promise.all([
    getJSON('data/classes.json'), getJSON('data/textes.json'), getJSON('data/matieres/index.json'),
  ]);
  const matieres = await Promise.all(ids.map(id => getJSON(`data/matieres/${id}.json`)));
  return { classes, textes, matieres };
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
  for (const b of $('vues').querySelectorAll('button')) b.onclick = () => go({ vue: b.dataset.vue, f: '' });
  $('theme').onclick = toggleTheme;
  $('panneau').open = matchMedia('(min-width: 800px)').matches;
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
  const nomMatiere = data.matieres.find(m => m.id === state.m)?.nom;
  const bits = [state.c, nomMatiere, state.t.length && `${state.t.length} type(s)`].filter(Boolean);
  $('resume').textContent = bits.length ? `· ${bits.join(' · ')}` : '';
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
  if (state.vue === 'classe' && !state.c) {
    main.append(renderChoixClasse(data.classes));
    return;
  }
  if (state.vue === 'classe') {
    main.append(renderTextesClasse(state.c, textesPourClasse(data.textes, state.c)));
  } else {
    const cycles = state.cy ? [Number(state.cy)] : [1, 2, 3];
    const groupes = cycles.map(cycle => ({ cycle, list: nouveautesCycle(data.textes, data.classes, cycle) }));
    main.append(renderNouveautes(groupes, Boolean(state.cy)));
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
