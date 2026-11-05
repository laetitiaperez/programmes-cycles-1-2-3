import { parseHash, toHash, sanitizeState, DEFAULT_STATE } from './lib/url.js';
import { indexTextes, filtrerTextes } from './lib/textes.js';
import { buildLexique, filterLexique } from './lib/lexique.js';
import { friseDuFil, vueClasse, rechercher, grouperTextes } from './lib/carte.js';
import { el, renderLexique, renderBibliotheque } from './ui/render.js';
import { renderAccueil, renderCarte, renderVueClasse, renderResultats } from './ui/carte.js';

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

// Lexique et Bibliothèque filtrent sur place ; ailleurs, la recherche ouvre la vue Recherche.
const filtreSurPlace = () => state.vue === 'lexique' || state.vue === 'biblio';

function setup() {
  let timer;
  $('f-q').oninput = (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = e.target.value.trim();
      if (q.length >= 2) go({ ...DEFAULT_STATE, vue: filtreSurPlace() ? state.vue : 'recherche', q }, state.vue === 'recherche' || filtreSurPlace());
      else if (state.q) go({ ...DEFAULT_STATE, vue: state.vue === 'recherche' ? 'accueil' : state.vue }, true);
    }, 200);
  };
  for (const b of $('vues').querySelectorAll('button')) {
    b.onclick = () => { go({ ...DEFAULT_STATE, vue: b.dataset.vue }); $('menu').close(); scrollTo(0, 0); };
  }
  $('theme').onclick = toggleTheme;
  $('ouvrir-menu').onclick = () => $('menu').showModal();
  $('fermer-menu').onclick = () => $('menu').close();
  // Un clic sur le fond (hors du panneau) ferme le menu.
  $('menu').addEventListener('click', (e) => { if (e.target === $('menu')) $('menu').close(); });
}

const NOMS_VUES = { classe: 'Par classe', lexique: 'Lexique', biblio: 'Bibliothèque', recherche: 'Recherche' };

// Fil d'Ariane sous la recherche.
function renderContexte(m, fil) {
  const parts = [el('a', { href: '#' }, 'Accueil')];
  if (state.vue === 'carte') {
    parts.push(' › ', el('a', { href: `#vue=carte&m=${encodeURIComponent(m.id)}` }, m.nom));
    if (fil) parts.push(' › ', fil.nom);
    if (state.c) parts.push(' › ', el('strong', {}, state.c));
  } else if (NOMS_VUES[state.vue]) {
    parts.push(' › ', el('strong', {}, NOMS_VUES[state.vue]), state.vue === 'classe' && state.c ? ` › ${state.c}` : '');
  }
  $('contexte').hidden = false;
  $('contexte').replaceChildren(...parts);
  for (const b of $('vues').querySelectorAll('button')) {
    b.setAttribute('aria-current', b.dataset.vue === state.vue ? 'page' : 'false');
  }
  if (document.activeElement !== $('f-q')) $('f-q').value = state.q;
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
}

function render() {
  const avant = state;
  state = sanitizeState(parseHash(location.hash), { classes: data.classes, matieres: data.matieres });
  const m = data.matieres.find(x => x.id === state.m);
  const fil = m?.domaines.flatMap(d => d.fils).find(f => f.id === state.fil);
  renderContexte(m, fil);
  const main = $('contenu');
  main.replaceChildren();

  if (state.vue === 'carte') {
    main.append(renderCarte(m, state, fil ? friseDuFil(fil, data.classes) : [], ctx));
    // En changeant de fil ou de classe, amener la frise à l'écran.
    if (fil && (avant.fil !== state.fil || avant.c !== state.c)) $('frise')?.scrollIntoView({ block: 'start' });
    else if (avant.vue !== state.vue || avant.m !== state.m) scrollTo(0, 0);
    return;
  }
  if (avant.vue !== state.vue || avant.c !== state.c) scrollTo(0, 0);
  if (state.vue === 'classe') {
    main.append(renderVueClasse(data.classes, data.textes, state.c, state.c ? vueClasse(data.matieres, state.c) : [], ctx));
  } else if (state.vue === 'lexique') {
    main.append(...[renderLexique(filterLexique(buildLexique(data.matieres, data.classes), state.q), ctx)].flat());
  } else if (state.vue === 'biblio') {
    const textes = filtrerTextes(data.textes, data.classes, { q: state.q });
    main.append(renderBibliotheque(data.fiches, textes, data.matieres, { ...ctx, q: state.q }));
  } else if (state.vue === 'recherche') {
    main.append(renderResultats(rechercher(data.matieres, state.q), data.matieres, state.q));
  } else {
    main.append(renderAccueil(data.matieres, grouperTextes(data.textes), ctx));
  }
}

try {
  data = await load();
  ctx = { textes: indexTextes(data.textes), order: new Map(data.classes.map((c, i) => [c.id, i])) };
  setup();
  addEventListener('hashchange', render);
  addEventListener('popstate', render);
  render();
} catch (e) {
  $('contenu').replaceChildren(el('p', { class: 'vide' }, `Impossible de charger les programmes (${e.message}).`));
}
