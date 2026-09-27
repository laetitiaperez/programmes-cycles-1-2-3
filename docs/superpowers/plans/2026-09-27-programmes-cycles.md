# Programmes cycles 1-2-3 — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un site statique (GitHub Pages) qui présente les programmes PS→6e en vigueur en 2026-27, organisés en fils de progression sans redondance, avec filtres, recherche et lexique des mots-clés officiels.

**Architecture:** Page unique HTML/CSS/JS en modules ES natifs, sans framework ni build. Logique pure dans `lib/` (testée avec `node:test`), rendu DOM dans `ui/render.js`, orchestration dans `app.js`. Contenu dans des JSON (`data/`) vérifiés par un validateur avant chaque commit.

**Tech Stack:** HTML, CSS, JavaScript ES2022 (modules), Node ≥ 20 (tests + validation uniquement), poppler (`pdftotext`), `gh`, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-27-programmes-cycles-design.md`

## Global Constraints

- Programmes **en vigueur à la rentrée 2026-2027**, classes PS, MS, GS, CP, CE1, CE2, CM1, CM2, 6e (9 classes).
- Toutes les matières : français, maths, HG/QLM espace-temps, sciences/QLM vivant-matière-objets, EMC, EPS, arts, LVER, EVAR/EVARS + principes de maternelle.
- Organisation matière → domaine → fil ; socle énoncé une fois ; étapes = uniquement ce qui s'ajoute.
- **Règles de condensation (spec §3)** : (1) condenser les phrases, garder les termes officiels mot pour mot, aucun synonyme ; (2) baliser les mots-clés `[[terme]]` ; (3) ne jamais répéter une étape antérieure ou le socle ; (4) supprimer paraphrase et formules introductives ; (5) conserver les exemples pertinents (type `exemple`, au plus près du texte) ; (6) chaque étape cite sa source (+ page si possible) ; (7) doute → `NOTES.md` § « À vérifier ».
- Types d'étape : `competence`, `attendu`, `notion`, `repere`, `exemple`, `crpe`.
- Pas de framework, pas de build, pas de dépendance npm. Scripts externes : aucun.
- Mobile d'abord : lisible à 360 px, gouttière 16 px, pas de défilement horizontal, cibles tactiles ≥ 44 px. Clair/sombre.
- État (vue, filtres, recherche, fil ciblé) dans le hash de l'URL.
- `sources/` jamais versionné ; le site ne fait que lier vers les PDF officiels.
- Dépôt public `laetitiaperez/programmes-cycles-1-2-3`, Pages depuis `main` racine.
- Commits en français, se terminant par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Un commit par matière au minimum.

## Review Focus

1. **Recherche avec accents / majuscules** : « geometrie », « FLUENCE » doivent trouver « géométrie », « fluence » → test dans Task 2 (`filters.test.mjs`).
2. **Lien/favori obsolète ou mal tapé** (`#c=CE3&m=truc&t=xx`) : la page doit s'afficher avec les filtres invalides ignorés, jamais blanche → test `sanitizeState` Task 2 + contrôle navigateur Task 5.
3. **Filtres qui ne laissent rien** (classe CM1 + matière sans contenu CM1, recherche sans résultat) : message « Aucun résultat », pas de titres de matière/domaine vides → tests `filterMatiere` Task 2 + contrôle Task 5.
4. **Balise mal formée dans les données** (`[[fluence` non fermée) : le validateur bloque ; si elle passe quand même, le rendu affiche le texte brut sans casser la page → tests `markup`/`validate` Task 2, `renderMarkup` avec `try/catch` Task 5.
5. **Étape rattachée au mauvais texte** (texte CP nouveau cité pour CE1, qui est encore sur l'ancien) : le validateur signale l'incohérence → test `validate.test.mjs` Task 2.

---

## Fichiers

| Fichier | Rôle |
|---|---|
| `package.json` | `type: module`, scripts `test`, `validate` |
| `lib/normalize.js` | normalisation casse/accents |
| `lib/markup.js` | parsing des balises `[[…]]` |
| `lib/filters.js` | filtrage fil / matière selon cycle, classe, types, recherche |
| `lib/textes.js` | textes applicables, nouveautés, badge NOUVEAU, sources divergentes |
| `lib/lexique.js` | construction et filtrage du lexique |
| `lib/url.js` | état ⇄ hash, assainissement |
| `lib/validate.js` | règles de validation des données |
| `scripts/validate.mjs` | CLI de validation (+ `--links`) |
| `scripts/page.sh` | retrouver la page d'un terme dans un texte extrait |
| `scripts/fetch-sources.sh` | télécharger les PDF et extraire le texte |
| `ui/render.js` | fonctions de rendu DOM |
| `app.js` | chargement, état, formulaires, rendu |
| `index.html`, `style.css` | page et styles |
| `data/classes.json`, `data/textes.json`, `data/matieres/index.json`, `data/matieres/<id>.json` | contenu |
| `tests/*.test.mjs`, `tests/fixtures.mjs` | tests |
| `NOTES.md` | notes de travail |
| `.claude/launch.json` | serveur local de prévisualisation |

---

### Task 1 : Outillage, dépôt GitHub, notes

**Files:**
- Create: `package.json`, `.nojekyll`, `NOTES.md`, `.claude/launch.json`
- Modify: `.gitignore`

**Interfaces:** Produces : `npm test` (→ `node --test`), `npm run validate`, serveur `http://localhost:8000` nommé `site`.

- [ ] **Step 1 : installer les outils**

Run: `brew install node poppler`
Expected: `node --version` ≥ v20, `pdftotext -v` affiche une version.

- [ ] **Step 2 : créer `package.json`**

```json
{
  "name": "programmes-cycles-1-2-3",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "validate": "node scripts/validate.mjs"
  }
}
```

- [ ] **Step 3 : créer `.nojekyll` (vide), `.claude/launch.json`, compléter `.gitignore`**

`.claude/launch.json` :
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "site", "runtimeExecutable": "python3", "runtimeArgs": ["-m", "http.server", "8000"], "port": 8000 }
  ]
}
```
`.gitignore` :
```
sources/
.DS_Store
node_modules/
```

- [ ] **Step 4 : créer `NOTES.md`**

```markdown
# Notes de travail

## Avancement
| Matière | Statut | Commit |
|---|---|---|
| français | à faire | |
| maths | à faire | |
| hg (QLM espace-temps) | à faire | |
| sciences (QLM vivant-matière-objets) | à faire | |
| emc | à faire | |
| eps | à faire | |
| arts | à faire | |
| lv | à faire | |
| evar | à faire | |
| maternelle (principes) | à faire | |

## Correspondance domaines de maternelle → matières
(à remplir en Task 3 d'après le programme cycle 1 2026)

## Découpage en fils (par matière)

## Choix faits

## À vérifier
```

- [ ] **Step 5 : commit, créer le dépôt public, activer Pages**

```bash
git add -A
git commit -m "Outillage : package.json, notes, serveur local

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
gh repo create laetitiaperez/programmes-cycles-1-2-3 --public --source=. --push --description "Programmes de l'école (cycles 1-2-3) 2026-27 condensés pour le CRPE"
gh api -X POST repos/laetitiaperez/programmes-cycles-1-2-3/pages -f "source[branch]=main" -f "source[path]=/"
```
Expected: `gh repo view --web` n'est pas nécessaire ; `gh api repos/laetitiaperez/programmes-cycles-1-2-3/pages --jq .html_url` renvoie `https://laetitiaperez.github.io/programmes-cycles-1-2-3/`.

---

### Task 2 : Logique pure et validateur (TDD)

**Files:**
- Create: `lib/normalize.js`, `lib/markup.js`, `lib/filters.js`, `lib/textes.js`, `lib/lexique.js`, `lib/url.js`, `lib/validate.js`, `scripts/validate.mjs`
- Test: `tests/fixtures.mjs`, `tests/markup.test.mjs`, `tests/filters.test.mjs`, `tests/textes.test.mjs`, `tests/lexique.test.mjs`, `tests/url.test.mjs`, `tests/validate.test.mjs`

**Interfaces (Produces):**
- `normalize(s: string): string`
- `parseMarkup(text: string): Array<{kind:'text'|'kw', value:string}>` (lève une `Error` si balise non fermée / orpheline / imbriquée / vide) ; `extractKeywords(text): string[]` ; `stripMarkup(text): string`
- `selectedClasses(classes, {cycle, classe}): Set<string>|null` ; `filterFil(fil, classes, crit): fil|null` ; `filterMatiere(matiere, classes, crit): matiere|null` — `crit = {cycle?: string, classe?: string, types?: string[], q?: string}`
- `indexTextes(textes): Map<id, texte>` ; `textesPourClasse(textes, classe): texte[]` ; `nouveautesCycle(textes, classes, cycle:number): Array<texte & {classesCycle:string[]}>` ; `estNouveau(bloc, textesMap): boolean` ; `sourcesDivergentes(fil): boolean`
- `buildLexique(matieres, classes): Array<{matiere:{id,nom}, termes: Array<{terme, occurrences: Array<{domaineId, filId, filNom, classes:string[]}>}>}>` ; `filterLexique(lex, q)`
- `VUES`, `DEFAULT_STATE = {vue:'matiere', m:'', cy:'', c:'', t:[], q:'', f:''}`, `parseHash(hash)`, `toHash(state)`, `sanitizeState(state, {classes, matiereIds, types})`
- `TYPES`, `validateData({classes, textes, matieres}): string[]`

- [ ] **Step 1 : écrire les fixtures `tests/fixtures.mjs`**

```js
export const classes = [
  { id: 'PS', cycle: 1 }, { id: 'MS', cycle: 1 }, { id: 'GS', cycle: 1 },
  { id: 'CP', cycle: 2 }, { id: 'CE1', cycle: 2 }, { id: 'CE2', cycle: 2 },
  { id: 'CM1', cycle: 3 }, { id: 'CM2', cycle: 3 }, { id: '6e', cycle: 3 },
];

export const textes = [
  { id: 'fr-c2-2024', titre: 'Français cycle 2', matiere: 'francais', bo: 'BO n° 41 du 31 octobre 2024',
    classes2026: ['CP', 'CE1', 'CE2'], nouveauEn: [], pdf: 'https://example.org/fr-c2.pdf' },
  { id: 'hg-c2-2026', titre: 'Histoire-géographie cycle 2', matiere: 'hg', bo: 'BO n° 22 du 28 mai 2026',
    classes2026: ['CP'], nouveauEn: ['CP'], pdf: 'https://example.org/hg-c2.pdf' },
  { id: 'qlm-et-2020', titre: 'Questionner l’espace et le temps (2020)', matiere: 'hg', bo: 'BO n° 31 du 30 juillet 2020',
    classes2026: ['CE1', 'CE2'], nouveauEn: [], pdf: 'https://example.org/c2-2020.pdf' },
];

export const francais = {
  id: 'francais', nom: 'Français', intentions: 'Priorité à la [[lecture]].',
  domaines: [{ id: 'lecture', nom: 'Lecture', fils: [
    { id: 'fluence', nom: 'Fluence',
      socle: { classes: ['CP', 'CE1', 'CE2'], texte: 'Lire à voix haute avec [[fluence]].', sources: ['fr-c2-2024'] },
      etapes: [
        { classes: ['CP'], type: 'attendu', texte: 'Lire [[50 mots par minute]].', sources: ['fr-c2-2024'], page: 8 },
        { classes: ['CE1'], type: 'attendu', texte: '+ 70 mots par minute, [[Fluence]] régulière.', sources: ['fr-c2-2024'] },
        { classes: ['CE1'], type: 'exemple', texte: 'Lecture théâtralisée.', sources: ['fr-c2-2024'] },
      ] },
    { id: 'decodage', nom: 'Décodage', etapes: [
        { classes: ['CP'], type: 'competence', texte: 'Maîtriser les [[correspondances graphèmes-phonèmes]].', sources: ['fr-c2-2024'] },
      ] },
  ] }],
};

export const hg = {
  id: 'hg', nom: 'Histoire-géographie', intentions: 'Se repérer dans le [[temps]].',
  domaines: [{ id: 'temps', nom: 'Temps', fils: [
    { id: 'frise', nom: 'Frise chronologique', etapes: [
      { classes: ['CP'], type: 'notion', texte: '[[Frise chronologique]] de l’année.', sources: ['hg-c2-2026'] },
      { classes: ['CE1', 'CE2'], type: 'notion', texte: 'Repères sur la [[frise chronologique]] (siècle).', sources: ['qlm-et-2020'] },
    ] },
  ] }],
};

export const data = () => structuredClone({ classes, textes, matieres: [francais, hg] });
```

- [ ] **Step 2 : écrire les tests `tests/markup.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkup, extractKeywords, stripMarkup } from '../lib/markup.js';

test('découpe texte et mots-clés', () => {
  assert.deepEqual(parseMarkup('Lire avec [[fluence]] et [[compréhension]].'), [
    { kind: 'text', value: 'Lire avec ' }, { kind: 'kw', value: 'fluence' },
    { kind: 'text', value: ' et ' }, { kind: 'kw', value: 'compréhension' }, { kind: 'text', value: '.' },
  ]);
});
test('texte sans balise', () => assert.deepEqual(parseMarkup('abc'), [{ kind: 'text', value: 'abc' }]));
test('texte vide', () => assert.deepEqual(parseMarkup(''), []));
test('balise non fermée', () => assert.throws(() => parseMarkup('a [[fluence b'), /non fermée/));
test(']] orphelin', () => assert.throws(() => parseMarkup('a fluence]] b'), /orphelin/));
test('balise vide', () => assert.throws(() => parseMarkup('a [[ ]] b'), /vide/));
test('balise imbriquée', () => assert.throws(() => parseMarkup('[[a [[b]]'), /imbriquée/));
test('extractKeywords et stripMarkup', () => {
  assert.deepEqual(extractKeywords('x [[a]] y [[b c]]'), ['a', 'b c']);
  assert.equal(stripMarkup('x [[a]] y'), 'x a y');
});
```

- [ ] **Step 3 : écrire `tests/filters.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterFil, filterMatiere, selectedClasses } from '../lib/filters.js';
import { classes, francais } from './fixtures.mjs';

const fluence = francais.domaines[0].fils[0];
const decodage = francais.domaines[0].fils[1];

test('sans filtre : fil complet', () => assert.deepEqual(filterFil(fluence, classes, {}), fluence));
test('classe CE1 : socle + étapes CE1', () => {
  const r = filterFil(fluence, classes, { classe: 'CE1' });
  assert.ok(r.socle);
  assert.equal(r.etapes.length, 2);
  assert.ok(r.etapes.every(e => e.classes.includes('CE1')));
});
test('classe CM1 : fil masqué', () => assert.equal(filterFil(fluence, classes, { classe: 'CM1' }), null));
test('cycle 2 → CP, CE1, CE2', () => assert.deepEqual([...selectedClasses(classes, { cycle: '2' })], ['CP', 'CE1', 'CE2']));
test('la classe prime sur le cycle', () => assert.deepEqual([...selectedClasses(classes, { cycle: '3', classe: 'CP' })], ['CP']));
test('aucun filtre de classe → null', () => assert.equal(selectedClasses(classes, {}), null));
test('filtre type attendu', () => {
  const r = filterFil(fluence, classes, { types: ['attendu'] });
  assert.deepEqual(r.etapes.map(e => e.type), ['attendu', 'attendu']);
});
test('recherche insensible à la casse (nom du fil) → fil entier', () => {
  assert.equal(filterFil(fluence, classes, { q: 'FLUENCE' }).etapes.length, 3);
});
test('recherche insensible aux accents', () => {
  assert.equal(filterFil(decodage, classes, { q: 'graphemes' }).etapes.length, 1);
});
test('recherche dans une étape seulement', () => {
  const r = filterFil(fluence, classes, { q: 'theatralisee' });
  assert.deepEqual(r.etapes.map(e => e.type), ['exemple']);
  assert.ok(r.socle);
});
test('recherche sans résultat', () => assert.equal(filterFil(fluence, classes, { q: 'zzz' }), null));
test('socle seul si aucune étape pour la classe', () => {
  const r = filterFil(fluence, classes, { classe: 'CE2' });
  assert.ok(r.socle);
  assert.deepEqual(r.etapes, []);
});
test('filtre type sans étape → masqué même avec socle', () => {
  assert.equal(filterFil(fluence, classes, { classe: 'CE2', types: ['attendu'] }), null);
});
test('filterMatiere : null si rien, fils vides retirés', () => {
  assert.equal(filterMatiere(francais, classes, { classe: 'CM1' }), null);
  assert.deepEqual(filterMatiere(francais, classes, { classe: 'CE1' }).domaines[0].fils.map(f => f.id), ['fluence']);
});
```

- [ ] **Step 4 : écrire `tests/textes.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textesPourClasse, nouveautesCycle, estNouveau, sourcesDivergentes, indexTextes } from '../lib/textes.js';
import { classes, textes, francais, hg } from './fixtures.mjs';

test('textes applicables en CE1', () => {
  assert.deepEqual(textesPourClasse(textes, 'CE1').map(t => t.id), ['fr-c2-2024', 'qlm-et-2020']);
});
test('nouveautés du cycle 2', () => {
  const r = nouveautesCycle(textes, classes, 2);
  assert.deepEqual(r.map(t => [t.id, t.classesCycle]), [['hg-c2-2026', ['CP']]]);
  assert.deepEqual(nouveautesCycle(textes, classes, 3), []);
});
test('estNouveau', () => {
  const tx = indexTextes(textes);
  const [cp, ce] = hg.domaines[0].fils[0].etapes;
  assert.equal(estNouveau(cp, tx), true);
  assert.equal(estNouveau(ce, tx), false);
});
test('sourcesDivergentes', () => {
  assert.equal(sourcesDivergentes(hg.domaines[0].fils[0]), true);
  assert.equal(sourcesDivergentes(francais.domaines[0].fils[0]), false);
});
```

- [ ] **Step 5 : écrire `tests/lexique.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLexique, filterLexique } from '../lib/lexique.js';
import { classes, francais, hg } from './fixtures.mjs';

test('termes triés, fusion casse/accents, occurrences par fil', () => {
  const [fr] = buildLexique([francais], classes);
  assert.equal(fr.matiere.id, 'francais');
  assert.deepEqual(fr.termes.map(t => t.terme),
    ['50 mots par minute', 'correspondances graphèmes-phonèmes', 'fluence', 'lecture']);
  const fluence = fr.termes.find(t => t.terme === 'fluence');
  assert.deepEqual(fluence.occurrences,
    [{ domaineId: 'lecture', filId: 'fluence', filNom: 'Fluence', classes: ['CP', 'CE1', 'CE2'] }]);
  const lecture = fr.termes.find(t => t.terme === 'lecture');
  assert.deepEqual(lecture.occurrences, [{ domaineId: null, filId: null, filNom: 'Intentions', classes: [] }]);
});
test('fusion « Frise » / « frise », classes ordonnées', () => {
  const [, h] = buildLexique([francais, hg], classes);
  const frise = h.termes.find(t => t.terme === 'Frise chronologique');
  assert.deepEqual(frise.occurrences[0].classes, ['CP', 'CE1', 'CE2']);
});
test('filterLexique', () => {
  const r = filterLexique(buildLexique([francais, hg], classes), 'FRISE');
  assert.deepEqual(r.map(e => e.matiere.id), ['hg']);
  assert.deepEqual(r[0].termes.map(t => t.terme), ['Frise chronologique']);
});
```

- [ ] **Step 6 : écrire `tests/url.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, toHash, sanitizeState, DEFAULT_STATE } from '../lib/url.js';
import { classes } from './fixtures.mjs';

const ctx = { classes, matiereIds: ['francais', 'hg'], types: ['attendu', 'exemple', 'notion'] };

test('hash vide → état par défaut', () => assert.deepEqual(parseHash(''), { ...DEFAULT_STATE, t: [] }));
test('parse complet', () => {
  assert.deepEqual(parseHash('#vue=classe&c=CE1&t=attendu,exemple&q=fluence'),
    { vue: 'classe', m: '', cy: '', c: 'CE1', t: ['attendu', 'exemple'], q: 'fluence', f: '' });
});
test('vue inconnue → matiere', () => assert.equal(parseHash('#vue=nimporte').vue, 'matiere'));
test('toHash : défaut → chaîne vide', () => assert.equal(toHash(DEFAULT_STATE), ''));
test('toHash', () => assert.equal(toHash({ ...DEFAULT_STATE, vue: 'classe', c: 'CE1', t: ['attendu'] }), '#vue=classe&c=CE1&t=attendu'));
test('aller-retour avec accents et espaces', () => {
  const s = { ...DEFAULT_STATE, m: 'hg', q: 'démarche d’investigation', t: ['notion'] };
  assert.deepEqual(parseHash(toHash(s)), s);
});
test('sanitizeState ignore les valeurs inconnues', () => {
  const s = sanitizeState(parseHash('#c=CE3&m=truc&t=xx,notion&cy=7'), ctx);
  assert.deepEqual([s.c, s.m, s.t, s.cy], ['', '', ['notion'], '']);
});
test('sanitizeState : la classe fixe le cycle', () => {
  assert.equal(sanitizeState(parseHash('#c=CE1&cy=3'), ctx).cy, '2');
});
```

- [ ] **Step 7 : écrire `tests/validate.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateData } from '../lib/validate.js';
import { data } from './fixtures.mjs';

const fil = (d, m, i) => d.matieres[m].domaines[0].fils[i];
const expectError = (d, re) => {
  const errors = validateData(d);
  assert.ok(errors.some(e => re.test(e)), `attendu ${re}, obtenu :\n${errors.join('\n')}`);
};

test('données valides → aucune erreur', () => assert.deepEqual(validateData(data()), []));
test('classe inconnue', () => { const d = data(); fil(d, 0, 0).etapes[0].classes = ['CE3']; expectError(d, /classe inconnue « CE3 »/); });
test('classes hors ordre', () => { const d = data(); fil(d, 0, 0).etapes[0].classes = ['CE1', 'CP']; expectError(d, /classes hors ordre/); });
test('étapes hors ordre', () => {
  const d = data(); const e = fil(d, 0, 0).etapes; [e[0], e[1]] = [e[1], e[0]]; expectError(d, /étapes hors ordre/);
});
test('source inconnue', () => { const d = data(); fil(d, 0, 0).etapes[0].sources = ['xx']; expectError(d, /source inconnue « xx »/); });
test('source qui ne couvre pas la classe', () => {
  const d = data(); fil(d, 1, 0).etapes[0].classes = ['CE1']; expectError(d, /hg-c2-2026 ne s’applique pas à CE1/);
});
test('sources manquantes hors crpe', () => { const d = data(); fil(d, 0, 0).etapes[0].sources = []; expectError(d, /sources manquantes/); });
test('crpe sans source autorisé', () => {
  const d = data(); fil(d, 0, 1).etapes.push({ classes: ['CP'], type: 'crpe', texte: 'Astuce.', sources: [] });
  assert.deepEqual(validateData(d), []);
});
test('balise non fermée', () => { const d = data(); fil(d, 0, 0).etapes[0].texte = 'a [[b'; expectError(d, /non fermée/); });
test('type inconnu', () => { const d = data(); fil(d, 0, 0).etapes[0].type = 'truc'; expectError(d, /type inconnu « truc »/); });
test('page invalide', () => { const d = data(); fil(d, 0, 0).etapes[0].page = 0; expectError(d, /page invalide/); });
test('id de fil en double', () => { const d = data(); fil(d, 0, 1).id = 'fluence'; expectError(d, /id de fil en double/); });
test('fil vide', () => { const d = data(); d.matieres[0].domaines[0].fils.push({ id: 'v', nom: 'V', etapes: [] }); expectError(d, /fil vide/); });
test('nouveauEn hors classes2026', () => { const d = data(); d.textes[1].nouveauEn = ['CE1']; expectError(d, /nouveauEn.*CE1/); });
test('pdf non https', () => { const d = data(); d.textes[0].pdf = 'http://x'; expectError(d, /pdf/); });
```

- [ ] **Step 8 : lancer les tests, constater l'échec**

Run: `npm test`
Expected: FAIL — `Cannot find module '…/lib/markup.js'` (et équivalents).

- [ ] **Step 9 : implémenter `lib/normalize.js` et `lib/markup.js`**

```js
// lib/normalize.js
export function normalize(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
```

```js
// lib/markup.js
export function parseMarkup(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('[[', i);
    if (open === -1) { tokens.push({ kind: 'text', value: text.slice(i) }); break; }
    const close = text.indexOf(']]', open + 2);
    if (close === -1) throw new Error(`balise [[ non fermée : « ${text.slice(open, open + 40)} »`);
    const inner = text.slice(open + 2, close);
    if (inner.includes('[[')) throw new Error(`balise [[ imbriquée : « ${text.slice(open, close + 2)} »`);
    if (!inner.trim()) throw new Error('balise [[ ]] vide');
    if (open > i) tokens.push({ kind: 'text', value: text.slice(i, open) });
    tokens.push({ kind: 'kw', value: inner });
    i = close + 2;
  }
  for (const t of tokens) {
    if (t.kind === 'text' && t.value.includes(']]')) throw new Error(`]] orphelin : « ${t.value.slice(0, 40)} »`);
  }
  return tokens;
}

export const extractKeywords = (text) => parseMarkup(text).filter(t => t.kind === 'kw').map(t => t.value);
export const stripMarkup = (text) => parseMarkup(text).map(t => t.value).join('');
```

- [ ] **Step 10 : implémenter `lib/filters.js`**

```js
import { normalize } from './normalize.js';
import { stripMarkup } from './markup.js';

export function selectedClasses(classes, { cycle, classe } = {}) {
  if (classe) return new Set([classe]);
  if (cycle) return new Set(classes.filter(c => c.cycle === Number(cycle)).map(c => c.id));
  return null;
}

const touches = (sel, list) => !sel || list.some(c => sel.has(c));
function plain(t) {
  try { return normalize(stripMarkup(t ?? '')); } catch { return normalize(t); }
}
const has = (q, t) => plain(t).includes(q);

// Un fil est visible si une étape passe les filtres, ou si seul son socle
// s'applique (sans filtre de type) : le socle vaut pour la classe choisie.
export function filterFil(fil, classes, crit = {}) {
  const sel = selectedClasses(classes, crit);
  const q = normalize(crit.q);
  const types = crit.types?.length ? new Set(crit.types) : null;
  const socle = fil.socle && touches(sel, fil.socle.classes) ? fil.socle : null;
  const whole = !q || has(q, fil.nom) || (socle !== null && has(q, socle.texte));
  let etapes = (fil.etapes ?? []).filter(e => touches(sel, e.classes) && (!types || types.has(e.type)));
  if (!whole) etapes = etapes.filter(e => has(q, e.texte));
  if (etapes.length || (socle && whole && !types)) return { ...fil, socle, etapes };
  return null;
}

export function filterMatiere(m, classes, crit = {}) {
  const domaines = m.domaines
    .map(d => ({ ...d, fils: d.fils.map(f => filterFil(f, classes, crit)).filter(Boolean) }))
    .filter(d => d.fils.length);
  return domaines.length ? { ...m, domaines } : null;
}
```

Note : dans le test « sans filtre : fil complet », `fluence` a un socle, donc `{...fil, socle, etapes}` est structurellement égal à l'original.

- [ ] **Step 11 : implémenter `lib/textes.js`**

```js
export const indexTextes = (textes) => new Map(textes.map(t => [t.id, t]));

export const textesPourClasse = (textes, classe) => textes.filter(t => t.classes2026.includes(classe));

export function nouveautesCycle(textes, classes, cycle) {
  const ids = new Set(classes.filter(c => c.cycle === cycle).map(c => c.id));
  return textes
    .map(t => ({ ...t, classesCycle: (t.nouveauEn ?? []).filter(c => ids.has(c)) }))
    .filter(t => t.classesCycle.length);
}

// Une étape (ou un socle) est « nouvelle » si l'une de ses classes entre en
// vigueur en 2026-27 pour l'un des textes cités.
export function estNouveau(bloc, textesMap) {
  return (bloc.sources ?? []).some(id => {
    const t = textesMap.get(id);
    return t && bloc.classes.some(c => (t.nouveauEn ?? []).includes(c));
  });
}

export function sourcesDivergentes(fil) {
  const ids = new Set([...(fil.socle?.sources ?? []), ...(fil.etapes ?? []).flatMap(e => e.sources ?? [])]);
  return ids.size > 1;
}
```

- [ ] **Step 12 : implémenter `lib/lexique.js`**

```js
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
```

- [ ] **Step 13 : implémenter `lib/url.js`**

```js
export const VUES = ['matiere', 'classe', 'lexique'];
const KEYS = ['m', 'cy', 'c', 'q', 'f'];
export const DEFAULT_STATE = Object.freeze({ vue: 'matiere', m: '', cy: '', c: '', t: [], q: '', f: '' });

export function parseHash(hash) {
  const p = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  const s = { ...DEFAULT_STATE };
  if (VUES.includes(p.get('vue'))) s.vue = p.get('vue');
  for (const k of KEYS) s[k] = p.get(k) ?? '';
  s.t = (p.get('t') ?? '').split(',').filter(Boolean);
  return s;
}

export function toHash(s) {
  const p = new URLSearchParams();
  if (s.vue && s.vue !== 'matiere') p.set('vue', s.vue);
  for (const k of KEYS) if (s[k]) p.set(k, s[k]);
  if (s.t?.length) p.set('t', s.t.join(','));
  const str = p.toString();
  return str ? `#${str}` : '';
}

export function sanitizeState(s, { classes, matiereIds, types }) {
  const out = { ...s, t: s.t.filter(t => types.includes(t)) };
  if (!matiereIds.includes(out.m)) out.m = '';
  const cls = classes.find(c => c.id === out.c);
  if (cls) out.cy = String(cls.cycle);
  else {
    out.c = '';
    if (!['1', '2', '3'].includes(out.cy)) out.cy = '';
  }
  return out;
}
```

- [ ] **Step 14 : implémenter `lib/validate.js`**

```js
import { parseMarkup } from './markup.js';

export const TYPES = ['competence', 'attendu', 'notion', 'repere', 'exemple', 'crpe'];

export function validateData({ classes, textes, matieres }) {
  const errors = [];
  const err = (w, msg) => errors.push(`${w} : ${msg}`);
  const order = new Map(classes.map((c, i) => [c.id, i]));
  if (order.size !== classes.length) err('classes', 'id en double');
  for (const c of classes) if (![1, 2, 3].includes(c.cycle)) err(`classes/${c.id}`, `cycle invalide ${c.cycle}`);

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
      for (const c of b.classes) {
        if (!sources.some(id => tx.get(id).classes2026?.includes(c))) err(w, `${sources.join(', ')} ne s’applique pas à ${c} en 2026-27`);
      }
    }
    if (b.page !== undefined && !(Number.isInteger(b.page) && b.page > 0)) err(w, 'page invalide');
  }

  const matIds = new Set();
  for (const m of matieres) {
    const w = `matieres/${m.id}`;
    if (matIds.has(m.id)) err(w, 'id de matière en double');
    matIds.add(m.id);
    if (!m.nom) err(w, 'nom manquant');
    checkTexte(`${w}/intentions`, m.intentions);
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
        for (let i = 1; i < etapes.length; i++) {
          const a = order.get(etapes[i - 1].classes?.[0]);
          const b = order.get(etapes[i].classes?.[0]);
          if (a !== undefined && b !== undefined && b < a) { err(wf, 'étapes hors ordre de classes'); break; }
        }
      }
    }
  }
  return errors;
}
```

- [ ] **Step 15 : lancer les tests**

Run: `npm test`
Expected: PASS, 0 échec.

- [ ] **Step 16 : écrire la CLI `scripts/validate.mjs`**

```js
import { readFile } from 'node:fs/promises';
import { validateData } from '../lib/validate.js';

const read = async (p) => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));

const classes = await read('data/classes.json');
const textes = await read('data/textes.json');
const ids = await read('data/matieres/index.json');
const matieres = await Promise.all(ids.map(id => read(`data/matieres/${id}.json`)));

const errors = validateData({ classes, textes, matieres });

if (process.argv.includes('--links')) {
  for (const url of new Set(textes.map(t => t.pdf))) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (!r.ok) errors.push(`lien ${url} : HTTP ${r.status}`);
    } catch (e) {
      errors.push(`lien ${url} : ${e.message}`);
    }
  }
}

if (errors.length) {
  console.error(`${errors.length} erreur(s) :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK : ${textes.length} textes, ${matieres.length} matières.`);
```

(La CLI est exécutée pour la première fois en Task 3, une fois les fichiers `data/` créés.)

- [ ] **Step 17 : commit et push**

```bash
git add lib scripts tests
git commit -m "Logique pure (filtres, lexique, URL, textes) et validateur, avec tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 3 : Sources, classes et textes officiels

**Files:**
- Create: `scripts/fetch-sources.sh`, `scripts/page.sh`, `data/classes.json`, `data/textes.json`, `data/matieres/index.json`, `sources/urls.tsv` (non versionné)
- Modify: `NOTES.md`

**Interfaces:**
- Consumes : `npm run validate` (Task 2).
- Produces : ids de textes utilisés par toutes les tâches de contenu (tableau ci-dessous) ; `sources/txt/<id>.txt` (texte extrait avec sauts de page `\f`) ; `scripts/page.sh "<terme>" <id>` → lignes `p.N: …`.

- [ ] **Step 1 : relever tous les liens des tableaux de programmes**

Dans le navigateur intégré, pour chacune des 3 pages Éduscol (cycles 1, 2, 3), exécuter :
```js
[...document.querySelectorAll('article table a, article a[href$=".pdf"]')]
  .map(a => `${a.closest('td') ? [...a.closest('tr').children].indexOf(a.closest('td')) : '-'}\t${a.innerText.trim().replace(/\s+/g, ' ')}\t${a.href}`)
  .join('\n')
```
L'index de colonne indique la classe (cycle 2 : 0 = CP, 1 = CE1-CE2 ; cycle 3 : 0 = CM1, 1 = CM2, 2 = 6e). Pour chaque lien qui n'est pas un `.pdf` (page intermédiaire), l'ouvrir et relever le lien PDF. Pour le programme consolidé 2020 du cycle 3, repérer l'annexe correspondante (`ensel714_annexe2…` ou équivalent).

- [ ] **Step 2 : écrire `sources/urls.tsv`**

Une ligne par PDF distinct : `<id-fichier>\t<url>`. Ids de fichiers : `c1-2026`, `evar-mat`, `evar-elem`, `evars-college`, `c2-2020`, `c3-2020`, `emc-2024`, `fr-c2-2024`, `maths-c2-2024`, `fr-c3-2025`, `maths-c3-2025`, `hg-c2-2026`, `hg-c3-2026`, `eps-c2-2026`, `eps-c3-2026`, `sci-c2-2026`, `sci-c3-2026`, `sci-c3-2023`, `lv-c2-2026`, `lv-c3-2026`, `lvr-6e-2026`, `lve-6e-2025`.

- [ ] **Step 3 : écrire `scripts/fetch-sources.sh`**

```sh
#!/bin/sh
# Télécharge les PDF listés dans sources/urls.tsv et extrait leur texte.
# Usage : scripts/fetch-sources.sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p sources/pdf sources/txt
while IFS="$(printf '\t')" read -r id url; do
  [ -z "$id" ] && continue
  pdf="sources/pdf/$id.pdf"
  if [ ! -s "$pdf" ]; then
    curl -sSL -A "Mozilla/5.0" -o "$pdf" "$url"
  fi
  if ! file "$pdf" | grep -q PDF; then
    echo "ÉCHEC : $id n'est pas un PDF ($url)" >&2
    continue
  fi
  pdftotext -layout "$pdf" "sources/txt/$id.txt"
  echo "OK $id ($(grep -c . "sources/txt/$id.txt") lignes)"
done < sources/urls.tsv
```
Run: `chmod +x scripts/fetch-sources.sh && scripts/fetch-sources.sh`
Expected: une ligne `OK` par fichier. Si un fichier échoue (protection anti-robot), le télécharger via le navigateur intégré ou le copier depuis `~/Documents/ECOLE/0.Objectif CRPE/prgrammes/` s'il y est, puis relancer.

- [ ] **Step 4 : écrire `scripts/page.sh`**

```sh
#!/bin/sh
# Affiche les lignes contenant un terme, avec leur numéro de page.
# Usage : scripts/page.sh "terme" <id-fichier>
awk -v pat="$1" 'BEGIN { p = 1 }
  { p += gsub(/\f/, "") }
  index(tolower($0), tolower(pat)) { print "p." p ": " $0 }' "sources/txt/$2.txt"
```
Run: `chmod +x scripts/page.sh && scripts/page.sh "fluence" fr-c2-2024`
Expected: au moins une ligne `p.N: …`.

- [ ] **Step 5 : écrire `data/classes.json`**

```json
[
  { "id": "PS", "cycle": 1 }, { "id": "MS", "cycle": 1 }, { "id": "GS", "cycle": 1 },
  { "id": "CP", "cycle": 2 }, { "id": "CE1", "cycle": 2 }, { "id": "CE2", "cycle": 2 },
  { "id": "CM1", "cycle": 3 }, { "id": "CM2", "cycle": 3 }, { "id": "6e", "cycle": 3 }
]
```

- [ ] **Step 6 : écrire `data/textes.json`**

Une entrée par (texte × matière), champs `id, titre, matiere, bo, classes2026, nouveauEn, pdf`. Valeurs attendues d'après les pages Éduscol consultées le 2026-09-27 — **à confirmer ligne à ligne avec le relevé du Step 1** (toute différence → corriger et noter dans `NOTES.md`) :

| id | matiere | BO | classes2026 | nouveauEn | PDF (id-fichier) |
|---|---|---|---|---|---|
| `c1-2026` | *(tous domaines C1)* `c1` | BO n° 41 du 31/10/2024 et BO n° 19 du 7/05/2026 | PS MS GS | PS MS GS | c1-2026 |
| `evar-mat-2025` | evar | BO n° 6 du 6/02/2025 | PS MS GS | — | evar-mat |
| `evar-elem-2025` | evar | BO n° 6 du 6/02/2025 | CP→CM2 | — | evar-elem |
| `evars-college-2025` | evar | BO n° 6 du 6/02/2025 | 6e | — | evars-college |
| `fr-c2-2024` | francais | BO n° 41 du 31/10/2024 | CP CE1 CE2 | — | fr-c2-2024 |
| `maths-c2-2024` | maths | BO n° 41 du 31/10/2024 | CP CE1 CE2 | — | maths-c2-2024 |
| `fr-c3-2025` | francais | BO n° 16 du 17/04/2025 | CM1 CM2 6e | CM2 | fr-c3-2025 |
| `maths-c3-2025` | maths | BO n° 16 du 17/04/2025 | CM1 CM2 6e | CM2 | maths-c3-2025 |
| `emc-2024` | emc | BO n° 24 du 13/06/2024 | CP→6e | CE2 6e | emc-2024 |
| `hg-c2-2026` | hg | BO n° 22 du 28/05/2026 | CP | CP | hg-c2-2026 |
| `qlm-et-2020` | hg | BO n° 31 du 30/07/2020 | CE1 CE2 | — | c2-2020 |
| `hg-c3-2026` | hg | BO n° 22 du 28/05/2026 | CM1 | CM1 | hg-c3-2026 |
| `hg-c3-2020` | hg | BO n° 31 du 30/07/2020 | CM2 6e | — | c3-2020 |
| `sci-c2-2026` | sciences | BO n° 24 du 11/06/2026 | CP | CP | sci-c2-2026 |
| `qlm-vmo-2020` | sciences | BO n° 31 du 30/07/2020 | CE1 CE2 | — | c2-2020 |
| `sci-c3-2026` | sciences | BO n° 24 du 11/06/2026 | CM1 | CM1 | sci-c3-2026 |
| `sci-c3-2023` | sciences | BO n° 25 du 22/06/2023 | CM2 6e | — | sci-c3-2023 |
| `eps-c2-2026` | eps | BO n° 22 du 28/05/2026 | CP | CP | eps-c2-2026 |
| `eps-c2-2020` | eps | BO n° 31 du 30/07/2020 | CE1 CE2 | — | c2-2020 |
| `eps-c3-2026` | eps | BO n° 22 du 28/05/2026 | CM1 | CM1 | eps-c3-2026 |
| `eps-c3-2020` | eps | BO n° 31 du 30/07/2020 | CM2 6e | — | c3-2020 |
| `arts-c2-2020` | arts | BO n° 31 du 30/07/2020 | CP CE1 CE2 | — | c2-2020 |
| `arts-c3-2020` | arts | BO n° 31 du 30/07/2020 | CM1 CM2 6e | — | c3-2020 |
| `lv-c2-2026` | lv | BO n° 12 du 19/03/2026 | CP | CP | lv-c2-2026 |
| `lv-c2-2020` | lv | BO n° 31 du 30/07/2020 | CE1 CE2 | — | c2-2020 |
| `lv-c3-2026` | lv | BO n° 12 du 19/03/2026 | CM1 | CM1 | lv-c3-2026 |
| `lv-c3-2020` | lv | BO n° 31 du 30/07/2020 | CM2 | — | c3-2020 |
| `lve-6e-2025` | lv | BO n° 22 du 29/05/2025 | 6e | — | lve-6e-2025 |
| `lvr-6e-2026` | lv | BO n° 21 du 21/05/2026 | 6e | 6e | lvr-6e-2026 |

`pdf` = URL officielle relevée au Step 1. Exemple d'entrée :
```json
{
  "id": "hg-c2-2026",
  "titre": "Histoire-géographie cycle 2",
  "matiere": "hg",
  "bo": "BO n° 22 du 28 mai 2026",
  "classes2026": ["CP"],
  "nouveauEn": ["CP"],
  "pdf": "https://www.education.gouv.fr/sites/default/files/document/annexe-3-programme-d-histoire-geographie-cycle-2-516776.pdf"
}
```

- [ ] **Step 7 : créer `data/matieres/index.json` vide et valider**

```json
[]
```
Run: `npm run validate -- --links`
Expected: `OK : 29 textes, 0 matières.` (nombre selon relevé). Corriger toute erreur ou lien mort.

- [ ] **Step 8 : lire le programme cycle 1 et remplir la correspondance dans `NOTES.md`**

Run: `grep -nE "^ *[0-9A-Z].{0,80}$" sources/txt/c1-2026.txt | head -80` pour repérer les titres de domaines. Remplir la section « Correspondance domaines de maternelle → matières » (ex. « Mobiliser le langage… / Développement et structuration du langage oral et écrit » → `francais`, « Acquérir les premiers outils mathématiques » → `maths`, activité physique → `eps`, activités artistiques → `arts`, « Se repérer dans le temps et l'espace » → `hg`, « Découvrir le monde du vivant, de la matière et des objets » → `sciences`, principes transversaux → `maternelle`). Tout domaine sans équivalent → le noter et le rattacher à `maternelle`.

- [ ] **Step 9 : commit et push**

```bash
git add scripts data NOTES.md
git commit -m "Sources : classes, textes officiels 2026-27, scripts d'extraction

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

## Procédure de saisie d'une matière (utilisée par les Tasks 4 et 6 à 14)

Chaque tâche de contenu applique ces étapes, avec ses propres textes sources et son propre fichier :

1. **Lire** intégralement les fichiers `sources/txt/<id>.txt` de la matière (et la partie du `c1-2026` correspondant à son domaine de maternelle).
2. **Découper** : domaines = ceux du texte le plus récent ; fils = compétences/notions qui se suivent entre classes. Consigner le découpage dans `NOTES.md` § « Découpage en fils ».
3. **Saisir** `data/matieres/<id>.json` au format spec §4 (champs `id, nom, nomMaternelle?, intentions, domaines[].fils[]`), en appliquant les 7 règles de condensation (Global Constraints). Pour chaque fil :
   - `socle` si un contenu vaut pour plusieurs classes ;
   - `etapes` triées PS→6e, chacune avec `classes`, `type`, `texte` (« + … » pour ce qui s'ajoute), `sources`, `page` (retrouvée avec `scripts/page.sh`) ;
   - attendus de fin d'année/de cycle → type `attendu` ; repères de progression → `repere` ; exemples du programme → `exemple` ;
   - quand une classe relève d'un ancien texte et la voisine d'un nouveau, étapes distinctes citant chacune son texte ;
   - encadrés `crpe` seulement pour une mise en relation utile (ex. « nouveau en CP 2026 : … remplace … de QLM ») — `sources: []`.
4. **Ajouter** l'id à `data/matieres/index.json` (ordre : francais, maths, hg, sciences, emc, eps, arts, lv, evar, maternelle).
5. **Valider** : `npm run validate` → `OK` ; `npm test` → PASS.
6. **Relire par échantillonnage** : choisir 5 fils (dont un de maternelle et un avec changement ancien/nouveau), comparer au PDF (termes exacts avec `scripts/page.sh "<terme>" <id>`, aucun attendu oublié). Corriger.
7. **Contrôler visuellement** (serveur `site`) : vue matière filtrée sur la matière ; vue classe (CP et CM1) ; lexique filtré sur la matière. Aucune erreur console.
8. **Mettre à jour `NOTES.md`** (avancement, choix, à vérifier), **commit** `Contenu : <matière> (PS→6e)` + push.

---

### Task 4 : Contenu pilote — français

**Files:**
- Create: `data/matieres/francais.json`
- Modify: `data/matieres/index.json`, `NOTES.md`

**Interfaces:** Consumes : ids de textes `fr-c2-2024`, `fr-c3-2025`, `c1-2026` (domaine langage). Produces : `francais` dans `index.json`.

- [ ] **Step 1 :** appliquer la procédure, étapes 1 à 6 (l'étape 7 — contrôle visuel — se fait en Task 5), avec `nom: "Français"`, `nomMaternelle` = intitulé exact du domaine langage du programme C1.
- [ ] **Step 2 :** `npm run validate` → `OK : … 1 matières.`
- [ ] **Step 3 : commit et push**

```bash
git add data NOTES.md
git commit -m "Contenu : français (PS→6e)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 5 : Interface

**Files:**
- Create: `index.html`, `style.css`, `app.js`, `ui/render.js`

**Interfaces:**
- Consumes : tout `lib/` (Task 2), données (Tasks 3-4).
- Produces : `ui/render.js` exporte `el`, `TYPE_LABELS`, `renderMarkup`, `renderMatiere`, `renderNouveautes`, `renderTextesClasse`, `renderLexique`, `renderChoixClasse`. `ctx = { textes: Map<id, texte>, order: Map<classeId, index> }`.

- [ ] **Step 1 : écrire `index.html`**

```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Programmes C1‑C3</title>
<meta name="description" content="Programmes de l'école (cycles 1, 2, 3) en vigueur en 2026-2027, condensés pour réviser le CRPE.">
<link rel="stylesheet" href="style.css">
<script>try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}</script>
<script type="module" src="app.js"></script>
</head>
<body>
<header class="barre">
  <div class="ligne">
    <h1><a href="./">Programmes C1‑C3 <small>2026‑27</small></a></h1>
    <button id="theme" type="button" aria-label="Changer de thème">◐</button>
  </div>
  <nav id="vues" aria-label="Vues">
    <button type="button" data-vue="matiere">Par matière</button>
    <button type="button" data-vue="classe">Par classe</button>
    <button type="button" data-vue="lexique">Lexique</button>
  </nav>
  <input id="f-q" type="search" placeholder="Rechercher un mot-clé, une notion…" aria-label="Rechercher">
  <details id="panneau" class="panneau">
    <summary>Filtres <span id="resume"></span></summary>
    <form id="filtres" autocomplete="off">
      <label>Cycle
        <select id="f-cy"><option value="">Tous</option><option value="1">Cycle 1</option><option value="2">Cycle 2</option><option value="3">Cycle 3</option></select>
      </label>
      <label>Classe <select id="f-c"><option value="">Toutes</option></select></label>
      <label>Matière <select id="f-m"><option value="">Toutes</option></select></label>
      <fieldset id="f-t"><legend>Types</legend></fieldset>
      <button type="button" id="raz">Réinitialiser</button>
    </form>
  </details>
</header>
<main id="contenu"><p class="vide">Chargement…</p></main>
<footer>
  Programmes en vigueur à la rentrée 2026-2027, condensés pour réviser le CRPE — les textes officiels font foi.
  Sources : Éduscol, <a href="https://eduscol.education.gouv.fr/4341/enseigner-au-cycle-1">cycle 1</a>,
  <a href="https://eduscol.education.gouv.fr/4347/enseigner-au-cycle-2">cycle 2</a>,
  <a href="https://eduscol.education.gouv.fr/4356/enseigner-au-cycle-3">cycle 3</a>.
</footer>
</body>
</html>
```

- [ ] **Step 2 : écrire `ui/render.js`**

```js
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

export function renderNouveautes(cycle, list, open) {
  return el('details', { class: 'encart nouveautes', open },
    el('summary', {}, `Ce qui change en 2026-27 · cycle ${cycle}`),
    el('ul', {}, list.length
      ? list.map(t => el('li', {},
          el('a', { href: t.pdf, target: '_blank', rel: 'noopener' }, t.titre),
          ` — ${t.classesCycle.join(', ')} `, el('small', {}, t.bo)))
      : el('li', {}, 'Aucun nouveau programme pour ce cycle.')));
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
```

- [ ] **Step 3 : écrire `app.js`**

```js
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
  $('f-cy').onchange = (e) => {
    const cy = e.target.value;
    const cls = data.classes.find(c => c.id === state.c);
    go({ cy, c: cls && String(cls.cycle) === cy ? state.c : '', f: '' });
  };
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
  $('f-cy').value = state.cy;
  $('f-c').value = state.c;
  $('f-m').value = state.m;
  for (const i of $('f-t').querySelectorAll('input')) i.checked = state.t.includes(i.value);
  if (document.activeElement !== $('f-q')) $('f-q').value = state.q;
  for (const b of $('vues').querySelectorAll('button')) {
    b.setAttribute('aria-current', b.dataset.vue === state.vue ? 'page' : 'false');
  }
  const nomMatiere = data.matieres.find(m => m.id === state.m)?.nom;
  const bits = [state.c || (state.cy && `cycle ${state.cy}`), nomMatiere, state.t.length && `${state.t.length} type(s)`].filter(Boolean);
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
    for (const cy of cycles) main.append(renderNouveautes(cy, nouveautesCycle(data.textes, data.classes, cy), Boolean(state.cy)));
  }
  const resultats = matieres.map(m => filterMatiere(m, data.classes, crit)).filter(Boolean);
  if (!resultats.length) main.append(el('p', { class: 'vide' }, 'Aucun résultat pour ces filtres.'));
  for (const m of resultats) main.append(renderMatiere(m, ctx));

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
```

- [ ] **Step 4 : écrire `style.css`**

```css
:root {
  --bg: #f8f6f1; --surface: #ffffff; --text: #1d1f24; --muted: #5d6470; --line: #e2ded5;
  --accent: #2f5bd3; --accent-soft: #e8eefc; --kw: #fff0b3; --kw-text: #3d3200;
  --new: #b4232c; --crpe: #0f7b5f; --crpe-soft: #e3f4ee; --radius: 10px;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #14161a; --surface: #1d2026; --text: #e8e6e1; --muted: #a3a9b3; --line: #30343c;
    --accent: #8fb0ff; --accent-soft: #233052; --kw: #574810; --kw-text: #fff3c4;
    --new: #ff8a8f; --crpe: #5fd3ae; --crpe-soft: #173a30; color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #14161a; --surface: #1d2026; --text: #e8e6e1; --muted: #a3a9b3; --line: #30343c;
  --accent: #8fb0ff; --accent-soft: #233052; --kw: #574810; --kw-text: #fff3c4;
  --new: #ff8a8f; --crpe: #5fd3ae; --crpe-soft: #173a30; color-scheme: dark;
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  overflow-wrap: anywhere;
}
a { color: var(--accent); }
button, select, input { font: inherit; color: inherit; }

.barre {
  position: sticky; top: 0; z-index: 10; background: var(--bg);
  border-bottom: 1px solid var(--line); padding: 8px 16px; display: grid; gap: 8px;
}
.ligne { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
h1 { font-size: 1.1rem; margin: 0; }
h1 a { color: inherit; text-decoration: none; }
h1 small { color: var(--muted); font-weight: 400; }
#theme { min-width: 44px; min-height: 44px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); cursor: pointer; }

#vues { display: flex; gap: 4px; }
#vues button {
  flex: 1; min-height: 44px; border: 1px solid var(--line); background: var(--surface);
  border-radius: var(--radius); cursor: pointer;
}
#vues button[aria-current="page"] { background: var(--accent); border-color: var(--accent); color: var(--bg); font-weight: 600; }

#f-q {
  width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--line);
  border-radius: var(--radius); background: var(--surface);
}
.panneau summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; font-weight: 600; }
#resume { color: var(--muted); font-weight: 400; margin-left: 6px; }
#filtres { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); padding-bottom: 8px; }
#filtres label { display: grid; gap: 2px; font-size: .85rem; color: var(--muted); }
#filtres select { min-height: 44px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 0 8px; }
#f-t { grid-column: 1 / -1; border: 0; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px; }
#f-t legend { font-size: .85rem; color: var(--muted); margin-bottom: 4px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px;
  border: 1px solid var(--line); border-radius: 999px; background: var(--surface);
  color: var(--text); text-decoration: none; cursor: pointer; font-size: .9rem;
}
.chip:has(input:checked) { background: var(--accent-soft); border-color: var(--accent); }
#raz { min-height: 44px; border: 1px solid var(--line); border-radius: var(--radius); background: transparent; cursor: pointer; }

main { max-width: 900px; margin: 0 auto; padding: 16px; }
.vide { color: var(--muted); text-align: center; padding: 32px 0; }

.encart {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 8px 16px; margin-bottom: 12px;
}
.encart summary { cursor: pointer; font-weight: 600; min-height: 36px; display: flex; align-items: center; }
.encart h2 { font-size: 1rem; }
.encart ul { padding-left: 18px; margin: 8px 0; }
.encart small { color: var(--muted); }

.matiere { margin-top: 24px; }
.matiere > h2 { font-size: 1.4rem; margin: 0 0 4px; display: grid; }
.matiere > h2 small { font-size: .85rem; font-weight: 400; color: var(--muted); }
.intentions { color: var(--muted); margin-bottom: 8px; }
.intentions summary { cursor: pointer; min-height: 36px; display: flex; align-items: center; }
.domaine > h3 { font-size: 1.1rem; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 2px solid var(--line); }

.fil {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 12px 16px; margin-bottom: 10px; scroll-margin-top: 200px;
}
.fil.cible { outline: 2px solid var(--accent); }
.fil h4 { margin: 0 0 6px; font-size: 1rem; }
.socle { background: var(--accent-soft); border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; }
.etapes { list-style: none; margin: 0; padding: 0 0 0 12px; border-left: 2px solid var(--line); }
.etape { position: relative; padding: 6px 0 6px 12px; }
.etape::before {
  content: ""; position: absolute; left: -19px; top: 14px; width: 10px; height: 10px;
  border-radius: 50%; background: var(--surface); border: 2px solid var(--accent);
}
.etape.t-crpe { background: var(--crpe-soft); border-radius: 8px; padding: 8px 12px; }
.etape.t-crpe::before { border-color: var(--crpe); }
.etape.t-exemple summary { cursor: pointer; list-style-position: outside; }
.etape.t-exemple .txt { font-style: italic; color: var(--muted); }
.txt { margin: 2px 0 0; }

.meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: .8rem; }
.cls { font-weight: 700; }
.type { color: var(--muted); text-transform: uppercase; letter-spacing: .03em; font-size: .72rem; }
.t-crpe .type { color: var(--crpe); font-weight: 700; }
.badge-new { background: var(--new); color: var(--surface); border-radius: 4px; padding: 0 5px; font-size: .7rem; font-weight: 700; }
.src { color: var(--muted); font-size: .75rem; }
.src-diff { color: var(--accent); }

mark.kw { background: var(--kw); color: var(--kw-text); border-radius: 3px; padding: 0 2px; }

.choix .groupe { margin-bottom: 16px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.choix .chip { min-height: 44px; min-width: 64px; justify-content: center; font-weight: 600; }

.lexique dl { display: grid; grid-template-columns: minmax(120px, max-content) 1fr; gap: 6px 16px; }
.lexique dt { font-weight: 600; }
.lexique dd { margin: 0; }
@media (max-width: 600px) {
  .lexique dl { grid-template-columns: 1fr; }
  .lexique dd { margin-bottom: 8px; }
}

footer { max-width: 900px; margin: 32px auto; padding: 0 16px; font-size: .8rem; color: var(--muted); }
```

- [ ] **Step 5 : contrôle navigateur (Review Focus 2, 3, 4)**

Démarrer le serveur `site` (preview), puis vérifier en largeur mobile (375 px) et bureau, thèmes clair et sombre :
- `/#` : encarts « Ce qui change » ×3 fermés, matière Français affichée, mots-clés surlignés, exemples repliés.
- `/#vue=classe` → choix de classe ; `/#vue=classe&c=CE1` → textes CE1 + socle et étapes CE1 seulement.
- `/#c=CM1&m=francais&t=exemple` → exemples CM1 seulement ; `/#q=zzzz` → « Aucun résultat pour ces filtres. »
- `/#c=CE3&m=truc&t=xx` → page normale, filtres ignorés (Review Focus 2).
- `/#vue=lexique` → termes ; clic sur un fil → vue matière, fil encadré et visible.
- Pas de défilement horizontal à 375 px (`document.documentElement.scrollWidth <= innerWidth`), aucune erreur console.
Corriger tout écart avant de continuer.

- [ ] **Step 6 : commit, push, vérifier le site publié**

```bash
git add index.html style.css app.js ui
git commit -m "Interface : vues matière/classe/lexique, filtres, recherche, thème

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```
Ouvrir `https://laetitiaperez.github.io/programmes-cycles-1-2-3/` (quelques minutes après le push) : même rendu qu'en local.

- [ ] **Step 7 : point d'étape avec Laetitia**

Lui envoyer le lien du site et quelques fils de français à relire (densité, mots-clés, exemples, lisibilité mobile). **Attendre son retour** et appliquer les ajustements (règles de condensation ou interface) avant la Task 6. Consigner les décisions dans `NOTES.md` § « Choix faits ».

---

### Tasks 6 à 14 : contenu des autres matières

Chaque tâche applique la **Procédure de saisie d'une matière** (étapes 1 à 8) avec les paramètres ci-dessous, puis commit `Contenu : <matière> (PS→6e)` + push.

| Task | id / fichier | nom | Textes sources (ids) | Domaine de maternelle rattaché |
|---|---|---|---|---|
| 6 | `maths` | Mathématiques | `maths-c2-2024`, `maths-c3-2025`, `c1-2026` | Acquérir les premiers outils mathématiques |
| 7 | `hg` | Histoire-géographie · Questionner l'espace et le temps | `hg-c2-2026`, `qlm-et-2020`, `hg-c3-2026`, `hg-c3-2020`, `c1-2026` | Se repérer dans le temps et l'espace |
| 8 | `sciences` | Sciences et technologie · Questionner le vivant, la matière et les objets | `sci-c2-2026`, `qlm-vmo-2020`, `sci-c3-2026`, `sci-c3-2023`, `c1-2026` | Découvrir le monde du vivant, de la matière et des objets |
| 9 | `emc` | Enseignement moral et civique | `emc-2024` (+ `c1-2026` si un domaine « vivre ensemble » existe, cf. `NOTES.md`) | selon correspondance |
| 10 | `eps` | Éducation physique et sportive | `eps-c2-2026`, `eps-c2-2020`, `eps-c3-2026`, `eps-c3-2020`, `c1-2026` | Agir, s'exprimer, comprendre à travers l'activité physique |
| 11 | `arts` | Enseignements artistiques | `arts-c2-2020`, `arts-c3-2020`, `c1-2026` | Agir, s'exprimer, comprendre à travers les activités artistiques |
| 12 | `lv` | Langues vivantes étrangères et régionales | `lv-c2-2026`, `lv-c2-2020`, `lv-c3-2026`, `lv-c3-2020`, `lve-6e-2025`, `lvr-6e-2026`, `c1-2026` (éveil à la diversité linguistique, s'il y figure) | selon correspondance |
| 13 | `evar` | Éducation à la vie affective et relationnelle (et à la sexualité) | `evar-mat-2025`, `evar-elem-2025`, `evars-college-2025` | — |
| 14 | `maternelle` | École maternelle — principes | `c1-2026` (parties transversales : modalités d'apprentissage, évaluation…) | — |

Points d'attention spécifiques :
- **Task 7-8 (HG, sciences)** : CP (nouveau 2026) et CE1-CE2 (QLM 2020) relèvent de textes différents ; CM1 (nouveau) et CM2-6e (anciens). Étapes distinctes par texte ; un encadré `crpe` par domaine résume ce qui change.
- **Task 9 (EMC)** : texte unique CP→Terminale ; ne saisir que CP→6e ; mentionner `nouveauEn` CE2 et 6e via les badges (automatique).
- **Task 11 (arts)** : arts plastiques, éducation musicale, histoire des arts (C3) = domaines distincts.
- **Task 12 (LV)** : niveaux du CECRL (A1…) sont des mots-clés officiels.

---

### Task 15 : Vérification finale et publication

**Files:** Modify: `NOTES.md`, éventuellement données.

- [ ] **Step 1 :** `npm test && npm run validate -- --links` → PASS et `OK : … 10 matières.`
- [ ] **Step 2 : contrôle croisé des redondances** — rechercher des doublons de textes entre étapes :
```bash
node -e '
const fs=require("fs");const ids=JSON.parse(fs.readFileSync("data/matieres/index.json"));
const seen=new Map();
for(const id of ids){const m=JSON.parse(fs.readFileSync(`data/matieres/${id}.json`));
for(const d of m.domaines)for(const f of d.fils)for(const b of [f.socle,...(f.etapes||[])].filter(Boolean)){
const k=b.texte.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g," ").trim();
if(seen.has(k))console.log("DOUBLON:",id,f.id,"=",seen.get(k));else seen.set(k,`${id}/${f.id}`);}}'
```
Expected: aucune ligne `DOUBLON` (sinon fusionner dans un socle).
- [ ] **Step 3 :** contrôle navigateur complet (mêmes vérifications que Task 5 Step 5) avec toutes les matières, dont la performance au premier chargement sur mobile (< 2 s en local).
- [ ] **Step 4 :** `NOTES.md` à jour (avancement 100 %, liste « À vérifier » transmise à Laetitia).
- [ ] **Step 5 : commit, push, vérifier le site publié**

```bash
git add -A
git commit -m "Vérification finale : validation, redondances, notes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```
