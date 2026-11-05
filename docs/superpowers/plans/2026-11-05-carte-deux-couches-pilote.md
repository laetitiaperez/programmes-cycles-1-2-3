# Carte à deux couches — pilote français — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter la couche « complet » au modèle de données, ses contrôles (validation, fidélité, complétude), la nouvelle interface carte + frise + vue par classe, et rédiger la couche 2 complète du français PS → 6e.

**Architecture:** Site statique sans build (`index.html` + modules ES `lib/` purs testés avec `node --test`, rendu DOM dans `ui/`). Données JSON générées par les scripts Python `scripts/saisie/<matiere>.py`. Les contrôles de contenu sont des scripts Node qui lisent les extractions `sources/txt/` et `sources/raw/` (non versionnées, déjà présentes).

**Tech Stack:** JavaScript ES modules (navigateur + Node ≥ 20, `node:test`), Python 3 (saisie), aucune dépendance.

**Spec:** `docs/superpowers/specs/2026-11-04-carte-deux-couches-design.md`

**Périmètre de ce plan :** étapes 0 et 1 de la spec (préalables + pilote français, jusqu'au point de validation par Laetitia). Les autres matières feront l'objet d'un plan suivant, une fois le format validé. Pas de `git push` dans ce plan (le site en ligne ne change qu'à l'étape 3).

## Global Constraints

- Seul le texte en vigueur pour chaque classe **en 2026-2027** est utilisé (`textes.json` → `classes2026`).
- Couche 2 : ne rien retirer du programme ; supprimer seulement les redites ; énoncé repris mot pour mot d'une classe antérieure du même fil → `reconduit` ; aucun synonyme pour un terme officiel.
- Intitulés de blocs repris du texte officiel (« Objectifs d'apprentissage », « Exemples de réussite »…) ; exemples Éduscol dans un bloc titré `Exemples Éduscol (à titre indicatif)`.
- Terminologie balisée `[[…]]` ; chaque bloc a `source` et `page` (page du PDF, pas le numéro imprimé).
- Âges : PS 3, MS 4, GS 5, CP 6, CE1 7, CE2 8, CM1 9, CM2 10, 6e 11.
- Mobile : lisible à 360 px, marges 16 px, pas de défilement horizontal, cibles ≥ 44 px ; carte en arborescence verticale sous 768 px.
- Tout doute de contenu → `NOTES.md` § « À vérifier », signalé à Laetitia, jamais tranché seul.
- Messages d'erreur et interface en français ; commits fréquents, messages en français, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Matière sans couche 2 (toutes sauf le français pendant le pilote) : la frise et la vue par classe affichent la couche 1 et la mention « Contenu détaillé à venir », sans erreur. → test `frise sans complet` (Task 7).
2. Anciens favoris (`#vue=matiere&m=maths&c=CE1`, `#m=francais&f=fluence`) : ouverts sans page blanche, redirigés vers la carte de la matière (et le fil si `f` existe). → test `anciens liens` (Task 8).
3. Étape couvrant plusieurs classes (`CE1 CE2`, `CM1 CM2 6e`) : apparaît dans la case de chacune de ces classes de la frise et dans la vue par classe de chacune. → test `étape multi-classes` (Task 7).
4. Recherche avec accents et apostrophes typographiques (« chaine d'accords » doit trouver « [[chaîne d’accords]] ») dans les deux couches. → test `recherche apostrophes` (Task 7).
5. Vue par classe : la matière « École maternelle — principes » n'apparaît que pour PS, MS, GS ; une matière sans aucun fil pour la classe n'apparaît pas. → test `vue classe maternelle` (Task 7).

---

### Task 1 : Préalables — vérification Éduscol et règle de rattachement

**Files:**
- Modify: `lib/validate.js` (fonction `checkBloc`)
- Test: `tests/validate.test.mjs`
- Modify: `NOTES.md`

**Interfaces:**
- Produces: nouvelle erreur de validation `« <id> ne s’applique à aucune des classes <c1, c2> en 2026-27 »`.

- [ ] **Step 1 : Vérifier les textes en vigueur.** Ouvrir dans le navigateur intégré les trois pages Éduscol (`https://eduscol.education.gouv.fr/4341/enseigner-au-cycle-1`, `…/4347/enseigner-au-cycle-2`, `…/4356/enseigner-au-cycle-3`) et comparer chaque texte cité avec `data/textes.json` (BO, classes 2026-27). Les 3 liens refusés aux robots (Éduscol media 100806, BO anglais 2025, BO LVR 2026) sont ouverts aussi. Écart trouvé → s'arrêter et le signaler à Laetitia avant toute modification. Consigner « Textes en vigueur revérifiés le <date> : <résultat> » dans `NOTES.md` § « À vérifier ».

- [ ] **Step 2 : Test qui échoue**

```js
test('chaque source doit couvrir une classe de l’étape', () => {
  const d = data();
  fil(d, 1, 0).etapes[1].sources = ['qlm-et-2020', 'hg-c2-2026']; // étape CE1-CE2, hg-c2-2026 = CP seulement
  expectError(d, /hg-c2-2026 ne s’applique à aucune des classes CE1, CE2/);
});
```

- [ ] **Step 3 :** `node --test tests/validate.test.mjs` → FAIL (aucune erreur produite).
- [ ] **Step 4 : Implémenter dans `checkBloc`** : pour chaque `id` de `sources`, si aucune classe de `b.classes` n'est dans `tx.get(id).classes2026`, `err(w, \`${id} ne s’applique à aucune des classes ${b.classes.join(', ')} en 2026-27\`)`. La règle existante (« une des sources couvre chaque classe ») reste.
- [ ] **Step 5 :** `node --test && npm run validate` → PASS, `OK : 37 textes, 10 matières.` (si les données réelles produisent des erreurs, les lister à Laetitia avant de corriger).
- [ ] **Step 6 : Commit** `Validation : chaque texte cité couvre une classe de l'étape`.

### Task 2 : Âge des classes

**Files:**
- Modify: `data/classes.json`, `tests/fixtures.mjs`, `lib/validate.js`
- Test: `tests/validate.test.mjs`

**Interfaces:**
- Produces: chaque classe a `age: number` (valeurs des Global Constraints).

- [ ] **Step 1 : Test qui échoue** : `test('âge manquant', …)` supprime `d.classes[0].age` → `expectError(d, /classes\/PS : âge invalide/)`. Ajouter `age` à chaque classe de la fixture.
- [ ] **Step 2 :** `node --test tests/validate.test.mjs` → FAIL.
- [ ] **Step 3 :** dans `validateData`, `if (!(Number.isInteger(c.age) && c.age >= 2 && c.age <= 12)) err(\`classes/${c.id}\`, 'âge invalide')` ; ajouter `"age"` dans `data/classes.json`.
- [ ] **Step 4 :** `node --test && npm run validate` → PASS.
- [ ] **Step 5 : Commit** `Données : âge de chaque classe`.

### Task 3 : Modèle « complet » — validation et aides de saisie

**Files:**
- Modify: `lib/validate.js`, `scripts/saisie/commun.py`, `tests/fixtures.mjs`
- Test: `tests/validate.test.mjs`

**Interfaces:**
- Produces (JSON, cf. spec §3) : `fil.complet: { [classe]: { blocs: Bloc[], reconduit?: {de, texte}[] } }`, `Bloc = { titre: string, source: string, page: number, items: string[] }` ; drapeau de matière `coucheComplete: true` quand la matière est terminée.
- Produces (Python, `commun.py`) :
  - `B(titre: str, source: str, page: int, *items: str) -> dict`
  - `R(de: str, texte: str) -> dict`
  - `K(*blocs: dict, reconduit: tuple = ()) -> dict` (omet `reconduit` s'il est vide)
  - `F(id_, nom, *etapes, socle=None, complet=None)` : ajoute `complet` s'il est fourni.

- [ ] **Step 1 : Fixture.** Dans `francais.fils[0]` (fluence, étapes CP et CE1), ajouter :

```js
complet: {
  CP: { blocs: [{ titre: 'Attendus de fin d’année', source: 'fr-c2-2024', page: 8, items: ['Lire [[50 mots par minute]] après préparation.'] }] },
  CE1: { blocs: [{ titre: 'Attendus de fin d’année', source: 'fr-c2-2024', page: 9, items: ['Lire 70 mots par minute.'] }],
         reconduit: [{ de: 'CP', texte: 'Lire 50 mots par minute après préparation.' }] },
},
```

- [ ] **Step 2 : Tests qui échouent** (un `test` par ligne, tous via `expectError` sauf le premier) :
  - `données valides avec complet → aucune erreur` (`deepEqual(validateData(data()), [])`)
  - classe inconnue `CE3` → `/complet : classe inconnue « CE3 »/`
  - classe absente du fil (`CM1` ; le socle de fluence couvre déjà CE2) → `/complet CM1 : classe absente des étapes du fil/`
  - `blocs` vide → `/complet CP : aucun bloc/`
  - bloc sans `page` → `/complet CP\/bloc 1 : page invalide/`
  - `source` inconnue → `/complet CP\/bloc 1 : source inconnue « xx »/`
  - source hors classe (`hg-c2-2026`) → `/complet CP\/bloc 1 : hg-c2-2026 ne s’applique pas à CP en 2026-27/`
  - `items` vide → `/complet CP\/bloc 1 : aucun item/`
  - item avec `[[` non fermé → `/non fermée/`
  - `reconduit.de` postérieur (`CE1` dans CP) → `/reconduit de CE1 : classe non antérieure/`
  - `reconduit.texte` absent des items de la classe d'origine → `/reconduit de CP introuvable/` (comparaison `normalize(stripMarkup(…))`, en remplaçant `’` par `'`)
  - matière `coucheComplete: true` et fil `decodage` (étape CP) sans `complet` → `/decodage : complet manquant pour CP/`
- [ ] **Step 3 :** `node --test tests/validate.test.mjs` → FAIL.
- [ ] **Step 4 : Implémenter `checkComplet(wf, fil, m)`** dans `lib/validate.js`, appelé pour chaque fil ; classes du fil = union des `classes` du socle et des étapes. Messages exactement comme dans les tests.
- [ ] **Step 5 : Implémenter `B`, `R`, `K` et le paramètre `complet` de `F`** dans `commun.py`.
- [ ] **Step 6 :** `node --test && npm run validate` → PASS ; `cd scripts/saisie && python3 francais.py && cd ../.. && git diff --stat data/` → aucune différence (la saisie existante n'utilise pas encore `complet`).
- [ ] **Step 7 : Commit** `Modèle : couche complète par fil et par classe`.

### Task 4 : Fidélité étendue à la couche 2

**Files:**
- Create: `lib/fichiers.js`
- Modify: `scripts/verif-mots.mjs`

**Interfaces:**
- Produces: `export const FICHIER` (déplacé tel quel depuis `verif-mots.mjs`) et `export function blocsAVerifier(matiere) -> Array<{ ou: string, texte: string, sources: string[] }>` dans `lib/fichiers.js` : intentions, socles, étapes (comme aujourd'hui) **plus** chaque item de `complet` (`ou` = `<domaine>/<fil>/complet <classe>/bloc <n>`, `sources` = `[bloc.source]`) et chaque `reconduit` (sources = sources des blocs de la classe d'origine).

- [ ] **Step 1 : Test qui échoue** `tests/fichiers.test.mjs` : `blocsAVerifier(francais)` (fixture de la Task 3) contient une entrée `{ ou: 'lecture/fluence/complet CP/bloc 1', texte: 'Lire [[50 mots par minute]] après préparation.', sources: ['fr-c2-2024'] }` et autant d'entrées d'étapes qu'avant (4 étapes + 1 socle + intentions).
- [ ] **Step 2 :** `node --test tests/fichiers.test.mjs` → FAIL.
- [ ] **Step 3 :** créer `lib/fichiers.js` ; `verif-mots.mjs` importe `FICHIER` et `blocsAVerifier` au lieu de construire sa liste.
- [ ] **Step 4 :** `node --test && node scripts/verif-mots.mjs` → PASS, `666/666 mots-clés trouvés mot pour mot dans leur source.`
- [ ] **Step 5 : Commit** `Fidélité : contrôle des mots-clés de la couche complète`.

### Task 5 : Contrôle de complétude

**Files:**
- Create: `lib/completude.js`, `scripts/verif-completude.mjs`, `data/completude-portee.json`, `data/completude-exclus.json`
- Test: `tests/completude.test.mjs`
- Modify: `package.json` (script `"completude": "node scripts/verif-completude.mjs"`)

**Interfaces:**
- Consumes: `FICHIER` (Task 4), `normalize`, `stripMarkup`.
- Produces (`lib/completude.js`) :
  - `segmenter(page: string) -> string[]` : une ligne commençant par `- `, `• ` ou une majuscule ouvre un segment ; une ligne commençant par une minuscule, un chiffre ou une ponctuation prolonge le précédent ; les coupures `-\n` sont recollées ; sont écartés les intitulés de `INTITULES` (« Objectifs d'apprentissage », « Objectifs », « Exemples de réussite », « Attendus de fin d'année », « Repères de progressivité », « Connaissances et compétences associées », « Cours préparatoire », « Cours élémentaire première année », « Cours élémentaire deuxième année », « Cours moyen première année », « Cours moyen deuxième année », « Sixième ») et les segments de moins de 4 mots pleins.
  - `motsPleins(s: string) -> Set<string>` : `normalize`, apostrophes unifiées, découpe sur tout ce qui n'est pas lettre/chiffre, mots de 4 lettres ou plus hors `MOTS_VIDES` (dans, pour, avec, elle, elles, leur, leurs, sont, être, cette, ces, une, des, les, aux, par, plus, sans, ainsi, entre, tout, tous, toute, toutes, comme, même, aussi, dont, quand, très), puis retrait d'un `s` ou `x` final.
  - `couverture(segment: string, items: string[]) -> number` : part des mots pleins du segment présents dans l'union des mots pleins des items (0 à 1).
  - `rapport({ pages: string[], items: {page: number, texte: string}[], exclus: string[], seuil = 0.6 }) -> Array<{ page: number, segment: string, score: number }>` : `pages[i]` = page PDF `i + 1` ; un segment de la page p est comparé aux items de pages p-1, p, p+1 ; segments dont le début normalisé commence par une entrée de `exclus` ignorés.
- Produces (fichiers de données) :
  - `completude-portee.json` : `{ "<matiere>": { "<idTexte>": [[pageDébut, pageFin], …] } }`
  - `completude-exclus.json` : `[{ "source": "<idTexte>", "debut": "<début du segment>", "raison": "<justification>" }]`
- Produces (CLI) : `node scripts/verif-completude.mjs <matiere> [--source <id>] [--pages a-b]` → une ligne par segment manquant `<source> p.<n> (<score>%) : <segment>`, puis `<n> segment(s) non repris sur <total>` ; code de sortie 1 s'il en reste.

- [ ] **Step 1 : Tests qui échouent** (`tests/completude.test.mjs`) :
  - `segmenter` sur `"Objectifs\n- Comprendre les notions de masculin et de féminin.\n- Comprendre les notions de singulier et de pluriel\n(plusieurs, plus qu’un)."` → 2 segments, le second se termine par `(plusieurs, plus qu’un).`
  - `segmenter` sur `"Repérer et nommer le nom noyau dans le groupe nominal\nAborder la notion d’épithète dans le groupe\nnominal étendu"` → 2 segments, le second = `Aborder la notion d’épithète dans le groupe nominal étendu`
  - `motsPleins("La chaîne d’accords des noms")` → `Set {'chaine', 'accord', 'nom'}` (« noms » → `nom` après retrait du s ; « des » écarté)
  - `couverture('Reconnaître le GN et la chaîne d’accords', ['Reconnaître le [[GN]] ; [[chaîne d'accords]]'])` → `1`
  - `rapport` : une page avec deux segments, items couvrant le premier seulement → un résultat, `page: 1`, le second segment ; même appel avec `exclus: ['<début du second>']` → `[]`
- [ ] **Step 2 :** `node --test tests/completude.test.mjs` → FAIL.
- [ ] **Step 3 : Implémenter `lib/completude.js`** (signatures ci-dessus).
- [ ] **Step 4 : Implémenter le script** : lit `sources/raw/<FICHIER[id]>.txt`, découpe sur `\f`, garde les pages de la portée (restreintes par `--pages`), items = tous les `items` et `reconduit.texte` des blocs `complet` de la matière dont `source === id`, exclusions de ce texte, appelle `rapport`.
- [ ] **Step 5 : Portée du français.** Avec `scripts/page.sh` et `scripts/lire.sh`, relever les pages du domaine langage dans `c1-2026` (texte des clés `c1-2024`), les pages de contenu de `fr-c2-2024`, `fr-c3-2025`, `fr-ex-cm1`, `fr-ex-cm2`, `fr-ex-6e` (préambules administratifs exclus via la portée, pas via `exclus`). Les écrire dans `completude-portee.json` ; `completude-exclus.json` = `[]`.
- [ ] **Step 6 :** `node --test` → PASS ; `npm run completude -- francais` → liste non vide (rien n'est encore rédigé), code 1. Noter le total de segments dans `NOTES.md`.
- [ ] **Step 7 : Commit** `Complétude : repérer les énoncés officiels non repris`.

### Task 6 : Lexique sur les deux couches

**Files:**
- Modify: `lib/lexique.js`
- Test: `tests/lexique.test.mjs`

**Interfaces:**
- Produces: `buildLexique(matieres, classes)` inchangé en signature ; il indexe aussi les items de `complet` (classe = clé de `complet`).

- [ ] **Step 1 : Test qui échoue** : avec la fixture de la Task 3, le terme `50 mots par minute` a une occurrence sur le fil `fluence` avec les classes `['CP']` ; un terme présent seulement dans un item de couche 2 (ajouter `[[groupes de souffle]]` à l'item CE1 de la fixture) apparaît, classes `['CE1']`.
- [ ] **Step 2 :** `node --test tests/lexique.test.mjs` → FAIL.
- [ ] **Step 3 :** dans la boucle des fils, `for (const [c, k] of Object.entries(f.complet ?? {})) for (const b of k.blocs) for (const it of b.items) add(it, occ, [c]);`
- [ ] **Step 4 :** `node --test` → PASS.
- [ ] **Step 5 : Commit** `Lexique : termes de la couche complète`.

### Task 7 : Modèle de la carte (fonctions pures)

**Files:**
- Create: `lib/carte.js`
- Test: `tests/carte.test.mjs`

**Interfaces:**
- Consumes: `classes` (avec `age`), matières (avec `complet`), `normalize`, `stripMarkup`.
- Produces:
  - `classesDuFil(fil, order: Map<string, number>) -> string[]` : union triée des classes du socle et des étapes.
  - `friseDuFil(fil, classes) -> Array<{ classe: string, cycle: number, age: number, etapes: Etape[], socle: Bloc|null, complet: object|null }>` : une case par classe du fil ; `etapes` = étapes dont `classes` contient la classe ; `complet` = `fil.complet?.[classe] ?? null`.
  - `vueClasse(matieres, classe) -> Array<{ matiere, domaines: Array<{ domaine, fils: Array<{ fil, etapes, socle, complet }> }> }>` : seulement les fils qui concernent la classe ; matières et domaines vides omis.
  - `rechercher(matieres, q: string) -> Array<{ matiereId, domaineId, filId, filNom, classe: string|null, extrait: string }>` : cherche dans `fil.nom`, les textes d'étapes et de socle (classe null pour nom/socle, sinon première classe de l'étape) et les items de `complet` (classe = clé) ; comparaison `normalize(stripMarkup(t))` avec `’` → `'` des deux côtés ; `extrait` = texte sans balises, 160 caractères max ; au plus un résultat par (fil, classe) ; `q` de moins de 2 caractères → `[]`.
  - `grouperTextes(textes) -> Array<{ matiere: string, textes: Texte[] }>` (ordre de `MATIERES_BIBLIO`, déplacé de `ui/render.js` vers `lib/carte.js` et exporté ; `renderBibliotheque` l'importe depuis `lib/carte.js`).

- [ ] **Step 1 : Tests qui échouent** (fixture `data()` des Tasks 2-3) :
  - `frise` : `friseDuFil(fluence, classes)` → 3 cases `CP`, `CE1`, `CE2` (le socle couvre CE2) ; CP : `age 6`, `cycle 2`, 1 étape, `complet.blocs.length === 1` ; CE2 : 0 étape, `socle` non nul.
  - `frise sans complet` : `friseDuFil(decodage, classes)[0].complet === null`.
  - `étape multi-classes` : fil hg `frise` → l'étape `CE1 CE2` figure dans les cases CE1 **et** CE2 ; `vueClasse(m, 'CE2')` contient le fil `frise` avec cette étape.
  - `vue classe maternelle` : ajouter à la fixture une matière `maternelle` (un fil, étape `PS`, source = nouveau texte fixture `c1-2026` classes PS-GS) ; `vueClasse(m, 'PS')` contient `maternelle`, `vueClasse(m, 'CP')` ne la contient pas ; `vueClasse(m, 'CE2')` ne contient pas `francais` si aucun fil français ne touche CE2 (dans la fixture, le socle fluence touche CE2 → il y est ; tester avec `GS` : ni français ni hg).
  - `recherche apostrophes` : item fixture `[[chaîne d’accords]]` ajouté au complet CE1 de fluence ; `rechercher(m, "chaine d'accords")` → un résultat `{ filId: 'fluence', classe: 'CE1' }`.
  - `recherche courte` : `rechercher(m, 'a')` → `[]`.
- [ ] **Step 2 :** `node --test tests/carte.test.mjs` → FAIL.
- [ ] **Step 3 : Implémenter `lib/carte.js`.**
- [ ] **Step 4 :** `node --test` → PASS.
- [ ] **Step 5 : Commit** `Carte : frise, vue par classe et recherche sur deux couches`.

### Task 8 : État dans l'URL

**Files:**
- Modify: `lib/url.js`
- Test: `tests/url.test.mjs` (réécrit)

**Interfaces:**
- Produces:
  - `VUES = ['accueil', 'carte', 'classe', 'lexique', 'biblio', 'recherche']`
  - `DEFAULT_STATE = { vue: 'accueil', m: '', d: '', fil: '', c: '', q: '' }`
  - `parseHash(hash) -> State`, `toHash(state) -> string` (vue omise si `accueil` ; clés vides omises)
  - `sanitizeState(s, { classes, matieres }) -> State` : `m` inconnue → vide ; `d` doit être un domaine de `m`, `fil` un fil de `m` (et `d` est alors forcé au domaine du fil) ; `c` doit être une classe connue, et en vue `carte` une classe de `classesDuFil` ; vue `carte` sans `m` → `accueil` ; vue `recherche` sans `q` → `accueil`.
  - Anciens liens : `parseHash` traduit `vue=matiere` → `carte` et `f=<id>` → `fil=<id>`.

- [ ] **Step 1 : Tests qui échouent** :
  - aller-retour `toHash(parseHash('#vue=carte&m=francais&fil=gn-accords&c=CE1'))` identique
  - `toHash(DEFAULT_STATE) === ''`
  - `anciens liens` : `sanitizeState(parseHash('#vue=matiere&m=hg&c=CE1'), …)` → `{ vue: 'carte', m: 'hg', c: '' }` (pas de fil) ; `parseHash('#m=francais&f=fluence')` puis sanitize → `{ vue: 'carte', m: 'francais', fil: 'fluence', d: 'lecture' }` (la vue `matiere` par défaut de l'ancien site devient `carte` quand `m` est présent)
  - `fil=inconnu` → `fil: ''` ; `c=CE3` → `c: ''` ; `vue=carte&m=hg&fil=frise&c=6e` → `c: ''` (6e hors du fil)
  - `vue=recherche` sans `q` → `vue: 'accueil'`
- [ ] **Step 2 :** `node --test tests/url.test.mjs` → FAIL.
- [ ] **Step 3 : Implémenter.** Ancien comportement : sans `vue` mais avec `m` → `carte`.
- [ ] **Step 4 :** `node --test` → PASS.
- [ ] **Step 5 : Commit** `URL : état de la carte, anciens liens redirigés`.

### Task 9 : Nouvelle interface

**Files:**
- Create: `ui/carte.js`
- Modify: `index.html`, `app.js`, `style.css`, `ui/render.js`
- Delete: `lib/filters.js`, `tests/filters.test.mjs`

**Interfaces:**
- Consumes: Tasks 6-8.
- Produces (`ui/carte.js`, tous retournent un nœud DOM et utilisent `el`, `renderMarkup` de `ui/render.js`) :
  - `renderAccueil(matieres, groupesTextes, ctx)` : cartes des matières (lien `#vue=carte&m=<id>`) + encadré « Textes en vigueur en 2026-2027 » (par matière : titre, classes, BO, lien PDF, badge « nouveau 2026 » si `nouveauEn` non vide).
  - `renderCarte(m, state, ctx)` : colonne des domaines (boutons, `aria-expanded`), colonne des fils du domaine `state.d` (liens `#vue=carte&m=…&d=…&fil=…`) ; sous la carte, si `state.fil`, `renderFrise`.
  - `renderFrise(fil, frise, state, ctx)` : une case par entrée de `friseDuFil` (classe, « C<cycle> · <age> ans », résumé = textes des étapes non `exemple` + socle, badge « nouveau 2026 » via `estNouveau`) ; case active = `state.c` (`aria-current`) ; sous la frise, `renderComplet` de la case active.
  - `renderComplet(entree, ctx)` : si `entree.complet` : blocs (titre, items en liste, terminologie en gras via `renderMarkup` avec `<strong class="kw">`, lien `PDF p.<page>` vers `<pdf>#page=<page>`), puis `reconduit` dans un `<details>` « Reconduit du <de> » ; sinon les étapes de la case (y compris exemples) et la mention « Contenu détaillé à venir ».
  - `renderVueClasse(classe, vue, ctx)` : sélecteur de classe (cycles 1-3, liens `#vue=classe&c=…`), puis matières → domaines → fils, chaque fil en `<details>` dont le résumé est la couche 1 et le contenu `renderComplet`.
  - `renderResultats(resultats, ctx)` : liste de liens `#vue=carte&m=…&fil=…&c=…` avec matière › fil, classe, extrait.
- `app.js` : `render()` choisit la vue selon `state.vue` ; la recherche (`#f-q`) passe en vue `recherche` dès 2 caractères ; le menu `<dialog>` garde Accueil, Par classe, Lexique, Bibliothèque, thème et le pied de page ; les filtres (cycle, classe, matière, types) disparaissent ; lexique non filtré par cycle, liens du lexique vers `#vue=carte&m=…&fil=…` ; Bibliothèque filtrée par `q` seulement ; fil d'Ariane `Accueil › <Matière> › <Fil>` dans `#contexte`.
- `style.css` : carte en deux colonnes (`grid-template-columns: minmax(0, 14rem) minmax(0, 1fr)`) à partir de 768 px ; en dessous, domaines empilés avec leurs fils dépliés sous le domaine actif, frise en liste verticale ; cases de frise ≥ 44 px de haut ; terminologie `strong.kw` ; couleurs existantes, clair/sombre conservés.

- [ ] **Step 1 :** supprimer `lib/filters.js` et `tests/filters.test.mjs` ; `grep -rn "filters.js" .` → aucune occurrence hors `.git`.
- [ ] **Step 2 :** écrire `ui/carte.js`, adapter `index.html`, `app.js`, `style.css` ; retirer de `ui/render.js` les fonctions devenues inutilisées (`renderMatiere`, `renderFil`, `renderNouveautes`, `renderTextesClasse`, `renderChoixClasse`) après `grep` de leurs appels.
- [ ] **Step 3 :** `node --test && npm run validate` → PASS.
- [ ] **Step 4 : Contrôle visuel** : servir le dossier (`.claude/launch.json`, configuration `python3 -m http.server 8000`), ouvrir dans le navigateur intégré et vérifier à 375 px et en bureau, en clair et en sombre : accueil ; carte du français → domaine Grammaire → fil « Groupe nominal et chaîne d'accords » → CE1 ; carte des maths → un fil → « Contenu détaillé à venir » ; vue par classe PS et CE1 ; recherche « chaine d'accords » ; lexique → lien vers un fil ; Bibliothèque ; anciens liens `#vue=matiere&m=maths&c=CE1` et `#m=francais&f=fluence`. Aucune erreur dans la console, aucun défilement horizontal à 375 px.
- [ ] **Step 5 : Commit** `Interface : accueil, carte, frise, couche complète, vue par classe`.

### Tasks 10 à 15 : Couche 2 du français

Six tâches de rédaction sur le même modèle, découpées selon la structure des textes officiels (le C2 est organisé par classe, le C3 par domaine avec les trois classes côte à côte) :

| Task | Périmètre | Textes |
|---|---|---|
| 10 | PS, MS, GS | `c1-2024` (domaine langage) |
| 11 | CP | `fr-c2-2024` |
| 12 | CE1 | `fr-c2-2024` |
| 13 | CE2 | `fr-c2-2024` |
| 14 | CM1, CM2, 6e — lecture, écriture, oral | `fr-c3-2025`, `fr-ex-cm1`, `fr-ex-cm2`, `fr-ex-6e` |
| 15 | CM1, CM2, 6e — vocabulaire, grammaire, conjugaison | mêmes textes |

**Files (chaque tâche):** Modify `scripts/saisie/francais.py` (paramètre `complet=` des `F(...)` concernés, avec `B`, `R`, `K`), regénère `data/matieres/francais.json` ; Modify `NOTES.md` ; éventuellement `data/completude-exclus.json`.

**Interfaces:** Consumes Task 3 (`B`, `R`, `K`, `F(complet=)`), Task 4 (`verif-mots`), Task 5 (`verif-completude`).

Étapes de chaque tâche :

- [ ] **Step 1 : Lire le texte** de la portée de la tâche (`scripts/lire.sh <fichier> <début> <fin>`), en entier.
- [ ] **Step 2 : Rédiger** pour chaque fil du français et chaque classe de la tâche une entrée `K(...)` selon les règles de la spec §3 et l'exemple validé (français, CE1, orthographe grammaticale, reproduit dans la spec). Un énoncé officiel qui concerne plusieurs fils est rédigé dans le fil le plus spécifique ; si un fil n'a pas d'étape pour une classe alors que le texte en parle, ajouter l'étape de couche 1 correspondante (texte court, `[[…]]`). Si un passage ne correspond à aucun fil existant, le noter dans `NOTES.md` § « À vérifier » et le signaler (pas de nouveau fil sans accord).
- [ ] **Step 3 :** `cd scripts/saisie && python3 francais.py && cd ../.. && npm run validate` → `OK`.
- [ ] **Step 4 :** `node scripts/verif-mots.mjs francais` → tous les mots-clés trouvés.
- [ ] **Step 5 :** `npm run completude -- francais --source <id> --pages <portée de la tâche>` → `0 segment(s) non repris`. Chaque segment écarté volontairement va dans `completude-exclus.json` avec sa raison (titre de section, phrase de préambule, renvoi à une autre matière) ; jamais pour masquer un contenu non rédigé.
- [ ] **Step 6 :** relecture de deux fils pris au hasard contre le PDF (`sources/pdf/`), à la page indiquée : terminologie identique, rien d'oublié. Noter les fils relus dans `NOTES.md`.
- [ ] **Step 7 : Commit** `Français : couche complète <périmètre>`.

La **Task 15** se termine en plus par : ajouter `"coucheComplete": True` à la matière dans `francais.py`, regénérer, `npm run validate` → `OK` (aucun `complet manquant`), `npm run completude -- francais` → `0 segment(s) non repris` sur toute la portée.

### Task 16 : Point d'étape du pilote

**Files:**
- Modify: `NOTES.md`

- [ ] **Step 1 :** `node --test && npm run validate && node scripts/verif-mots.mjs && npm run completude -- francais` → tout PASS ; noter dans `NOTES.md` § « Bilan » : nombre de mots de la couche 2 du français, de mots-clés, de segments couverts et exclus, de tests.
- [ ] **Step 2 :** refaire le contrôle visuel de la Task 9, Step 4, sur le contenu réel du français (au moins un fil par domaine, une classe par cycle).
- [ ] **Step 3 : Commit** `Pilote français : bilan`.
- [ ] **Step 4 :** présenter le pilote à Laetitia (lien local, ce qui a été fait, points « À vérifier ») et attendre sa validation du format et de l'interface avant d'écrire le plan des autres matières. Ne pas pousser sur GitHub sans son accord.
