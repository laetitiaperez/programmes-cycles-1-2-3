# Carte par cycle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une page « Par cycle » (carte mentale : principes du cycle au centre, disciplines autour) comme porte d'entrée du site, sans rien retirer de l'existant.

**Architecture:** Données générées par Python (`scripts/saisie/cycles.py` + `cycles_complet.py` généré par `scripts/gen_cycles.py`) → `data/cycles.json`. Logique pure et testée dans `lib/cycles.js` (+ ajouts à `lib/url.js`, `lib/carte.js`, `lib/lexique.js`, `lib/validate.js`, `lib/completude.js`). Rendu DOM par `el()` dans `ui/cycle.js` ; `app.js` route `vue=cycle`.

**Tech Stack:** Site statique sans build, modules ES, `node --test`, Python 3 pour la saisie.

**Spec:** `docs/superpowers/specs/2026-11-05-carte-par-cycle-design.md`

## Global Constraints

- Seuls les textes en vigueur en 2026-2027 comptent.
- Couche 1 : termes officiels entre `[[…]]`, mot pour mot dans la source (`verif-mots`). Couche 2 : texte officiel mot pour mot, seules les redites strictes retirées.
- Aucun `innerHTML` : tout le DOM passe par `el()`.
- Toutes les vues existantes (carte par matière, par classe, lexique, bibliothèque, recherche) restent disponibles et inchangées dans leur fonctionnement ; les anciens liens marchent.
- Mobile < 768 px : nœuds empilés ; mode sombre via les variables CSS existantes.
- Branche locale `carte-deux-couches`, commits fréquents, messages en français terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Rien n'est poussé, fusionné ni publié sans l'accord de Laetitia.
- Ne jamais éditer `scripts/saisie/cycles_complet.py` à la main (généré).

## Review Focus

1. Matière sans `intentionsParCycle` pour un cycle (ex. EMC en cycle 1, ou matière pas encore découpée) : la branche s'affiche quand même, sans principes, sans erreur.
2. `#vue=cycle&cy=7` ou `&m=inconnue` ou `&m=emc&cy=1` : retombe sur un état valide (cy=1, m vidé) au lieu d'une page vide.
3. Ancien lien `#m=francais&cy=2` (ancien filtre) : ouvre toujours la carte du français (avec, au plus, un lien de retour vers le cycle 2).
4. Cycle 1 : `maternelle` n'apparaît pas comme branche ; les matières affichent `nomMaternelle`.
5. Une matière dont un texte cité est un exemple Éduscol (`*-ex-*`) : pas d'étiquette pour cet exemple.

Chaque ligne a son test dans la tâche qui possède le code (Tâches 4, 5, 6).

## Ruling sur la spec (à reporter au ledger)

- Étiquettes de textes : la spec dit « depuis `textes.json` ». Or les textes de maternelle ont `matiere: "c1"`, pas l'id de la matière. Les étiquettes sont donc calculées à partir des **sources citées par les étapes et socles de la matière dont les classes touchent le cycle**, croisées avec `classes2026` du texte et les classes du cycle. Même résultat que voulu, sans saisie supplémentaire.
- Les sources des volets 1 n'ont pas d'id de texte : on ajoute deux entrées à `data/textes.json` (`volet1-c2-2020`, `volet1-c3-2023`, `matiere: "cycles"`) et `cycles: 'Principes des cycles'` à `MATIERES_BIBLIO`. Le cycle 1 cite `c1-2026`.
- Le volet 2 du cycle 2 commence en bas de la page 4 : la complétude des cycles borne le texte par des marqueurs (`data/completude-bornes.json`) en plus des pages.

---

### Task 0 : Statut juridique des volets 1 (aucun code)

**Files:** Modify: `NOTES.md`

- [ ] **Step 1 :** Sur Légifrance (versions consolidées), lire les articles d'abrogation de : l'arrêté de 2025 fixant les programmes de français et de maths du cycle 3 (BO n° 16 du 17 avril 2025) ; les arrêtés de 2026 pour HG, sciences, EPS, LV cycles 2 et 3 (BO n° 12, 22, 24 de 2026). Question : suppriment-ils autre chose que la partie de leur discipline dans les annexes de 2015 ?
- [ ] **Step 2 :** Consigner dans `NOTES.md`, section « Carte par cycle — statut des volets 1 », le résultat, les références et la date. Si un volet 1 est abrogé : **s'arrêter et prévenir Laetitia** (le centre de ce cycle se réduira au nom, classes, âges).
- [ ] **Step 3 : Commit** — `git commit -m "Notes : statut juridique des volets 1 des cycles 2 et 3"`

### Task 1 : Textes des cycles et validation de `cycles.json`

**Files:**
- Modify: `data/textes.json`, `lib/fichiers.js`, `lib/carte.js` (`MATIERES_BIBLIO`), `lib/validate.js`, `scripts/validate.mjs`
- Test: `tests/validate.test.mjs`

**Interfaces:**
- Produces: `validateData({ classes, textes, matieres, cycles = [] })` ; format `cycles.json` = spec §5 (`id`, `nom`, `classes`, `source`, `idees: [{texte, bloc}]`, `complet: {blocs: [{titre, source, page, items}]}`).
- Produces: textes `volet1-c2-2020` (titre « Spécificités du cycle des apprentissages fondamentaux (volet 1, 2020) », bo « BO n° 31 du 30 juillet 2020 », classes2026 CP-CE2, pdf = celui de `arts-c2-2020`) et `volet1-c3-2023` (titre « Spécificités du cycle de consolidation (volet 1, 2020-2023) », bo « BO n° 31 du 30 juillet 2020 et BO n° 25 du 22 juin 2023 », classes2026 CM1-6e, pdf = celui de `arts-c3-2020`), `matiere: "cycles"`, `nouveauEn: []`. `FICHIER` : `'volet1-c2-2020': 'c2-2020'`, `'volet1-c3-2023': 'c3-2023'`.

- [ ] **Step 1 : Tests qui échouent** dans `tests/validate.test.mjs` (fixture locale `cycleOk` à partir de `fixtures.classes`/`textes`, source `fr-c2-2024`, classes CP-CE2) :
  - `cycles valides → aucune erreur`
  - `cycle : id hors 1-3 → erreur « id de cycle invalide »`
  - `cycle : classe d'un autre cycle (CM1 dans le cycle 2) → erreur « CM1 n'est pas du cycle 2 »`
  - `cycle : source inconnue → erreur « source inconnue »`
  - `cycle : idée dont bloc n'existe pas → erreur « bloc 5 inexistant »`
  - `cycle : bloc sans items ou page non entière → erreur`
  - `cycle : texte d'idée au balisage cassé → erreur (parseMarkup)`
- [ ] **Step 2 :** `node --test tests/validate.test.mjs` → FAIL sur les nouveaux tests.
- [ ] **Step 3 :** Implémenter dans `validateData` (paramètre `cycles = []`, préfixe d'erreur `cycles/<id>`), puis faire lire `data/cycles.json` par `scripts/validate.mjs` **s'il existe** (absent → `[]`) et afficher `… matières, N cycles`. Ajouter les deux textes, `FICHIER`, `MATIERES_BIBLIO.cycles`.
- [ ] **Step 4 :** `npm test` → tout vert ; `npm run validate` → OK.
- [ ] **Step 5 : Commit** — « Cycles : textes des volets 1 et validation de cycles.json »

### Task 2 : `intentionsParCycle` des matières

**Files:**
- Modify: `lib/validate.js`, `scripts/saisie/{francais,maths,hg,sciences,emc,eps,arts,lv,evar}.py`, `data/matieres/*.json` (régénérés)
- Test: `tests/validate.test.mjs`

**Interfaces:**
- Produces: champ matière `intentionsParCycle: { "1"?: str, "2"?: str, "3"?: str, "tous"?: str }`.

- [ ] **Step 1 : Tests qui échouent :**
  - `intentionsParCycle : clé « 4 » → erreur « clé inconnue »`
  - `intentionsParCycle : terme [[x]] absent de intentions → erreur « [[x]] absent des intentions »`
  - `intentionsParCycle absent → aucune erreur` (champ facultatif)
- [ ] **Step 2 :** `node --test tests/validate.test.mjs` → FAIL.
- [ ] **Step 3 :** Implémenter (comparaison des termes par `normalize`).
- [ ] **Step 4 :** Pour chaque matière, découper `intentions` en recopiant ses phrases **sans rien ajouter ni reformuler** : « Maternelle : … » → `"1"`, « Cycle 2 : … » → `"2"`, « Cycle 3 : … » → `"3"`, ce qui vaut pour tous ou pour l'élémentaire → `"tous"` (ou recopié dans `"2"` et `"3"`). Régénérer (`python3 scripts/saisie/<m>.py` pour chacune).
- [ ] **Step 5 :** `npm test`, `npm run validate`, `node scripts/verif-mots.mjs` → tout vert (997/997 inchangé ou plus).
- [ ] **Step 6 : Commit** — « Matières : intentions découpées par cycle »

### Task 3 : Contenu des cycles (génération, couche 1, contrôles)

**Files:**
- Create: `scripts/gen_cycles.py`, `scripts/saisie/cycles.py`, `scripts/saisie/cycles_complet.py` (généré), `data/cycles.json` (généré), `data/completude-bornes.json`
- Modify: `lib/completude.js`, `lib/fichiers.js`, `scripts/verif-completude.mjs`, `scripts/verif-mots.mjs`, `data/completude-portee.json`, `data/completude-exclus.json`, `NOTES.md`
- Test: `tests/completude.test.mjs`, `tests/fichiers.test.mjs`

**Interfaces:**
- Produces: `borner(brut: string, { debut?: string, fin?: string }): string` dans `lib/completude.js` — remplace par des espaces tout ce qui précède la première occurrence de `debut` et tout ce qui suit la première occurrence de `fin` après `debut` (fin exclue), **en conservant les `\f`** (numéros de page intacts).
- Produces: `blocsCycles(cycles): [{ou, texte, sources}]` dans `lib/fichiers.js` (idées : `sources: [cycle.source]` ; items des blocs : `sources: [bloc.source]`).
- Produces: `data/cycles.json` conforme à la Task 1.

- [ ] **Step 1 : Tests qui échouent :**
  - `borner : garde le texte entre debut et fin, conserve les sauts de page`
  - `borner : sans marqueurs, renvoie le texte inchangé`
  - `blocsCycles : une entrée par idée et par item, avec la bonne source`
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** Implémenter `borner` et `blocsCycles`.
- [ ] **Step 4 :** `scripts/gen_cycles.py`, sur le modèle de `scripts/gen_fr_c3.py` (lecture continue des pages, intertitres en **liste explicite** par cycle, puces et coupures de mots recollées, `REPARATIONS` explicites si besoin, `’` conservé tel quel) :
  - cycle 1 : `sources/raw/c1-2026.txt`, du titre « Préambule » (l. 39) jusqu'à « Les six domaines d'apprentissage » inclus (fin avant le premier domaine), source `c1-2026` ;
  - cycle 2 : `c2-2020.txt` du titre du volet 1 jusqu'à « Volet 2 : contributions essentielles » exclu, source `volet1-c2-2020` ;
  - cycle 3 : `c3-2023.txt` du titre du volet 1 jusqu'au volet 2 exclu, source `volet1-c3-2023` ; ignorer les mentions de pied de page « D'après le BOEN … ».
  - Chaque bloc : `{titre: intertitre officiel, source, page, items: phrases/paragraphes}`. Écrit `scripts/saisie/cycles_complet.py` (`COMPLETS = {1: [...], 2: [...], 3: [...]}`).
  Puis `scripts/saisie/cycles.py` : noms officiels (spec §2), classes, source, `idees` (une ligne par idée-force, termes `[[…]]` mot pour mot, `bloc` = index du bloc qui la développe), importe `COMPLETS`, écrit `data/cycles.json`.
- [ ] **Step 5 :** `data/completude-portee.json` → `"cycles": {"c1-2026": [[2, 7]], "volet1-c2-2020": [[2, 4]], "volet1-c3-2023": [[2, 6]]}` (ajuster aux pages réelles) ; `data/completude-bornes.json` → marqueurs de début/fin par source ; `verif-completude.mjs` : si la matière vaut `cycles`, lire `data/cycles.json` (items = titres et items de tous les blocs, page du bloc) et appliquer `borner` avant le découpage en pages. `verif-mots.mjs` : argument `cycles` → `blocsCycles(cycles)` ; sans argument, vérifier aussi les cycles.
- [ ] **Step 6 :** Lancer et corriger le générateur jusqu'à :
  - `npm run completude -- cycles` → `0 segment(s) non repris` (exclusions justifiées dans `data/completude-exclus.json` seulement pour pieds de page ou titres de table des matières) ;
  - `node scripts/verif-mots.mjs cycles` → tout trouvé ;
  - `npm run validate` → OK avec 3 cycles ; `npm test` → vert.
- [ ] **Step 7 :** Relire les blocs générés (titres, découpage lisible) ; noter dans `NOTES.md` ce qui reste à relire par Laetitia.
- [ ] **Step 8 : Commit** — « Cycles : principes officiels en deux couches, générés et contrôlés »

### Task 4 : Logique de la carte par cycle (`lib/cycles.js`)

**Files:**
- Create: `lib/cycles.js`
- Test: `tests/cycles.test.mjs` (fixtures : `tests/fixtures.mjs`, ajouter une matière `maternelle` minimale, une matière avec `nomMaternelle` et `intentionsParCycle`, un texte `*-ex-*`, un cycle fictif)

**Interfaces:**
- Consumes: format `cycles.json` (Task 1), `intentionsParCycle` (Task 2).
- Produces:
  - `classesDuCycle(classes, cy): string[]`
  - `disciplinesDuCycle(matieres, classes, cy): Array<{ matiere, nom, principes: string[], etiquettes: Array<{texteId, classes: string[]}>, domaines: Array<{id, nom}> }>` — `principes` = `[intentionsParCycle[cy], intentionsParCycle.tous]` filtrés ; étiquettes regroupées par texte, classes ordonnées, sans `*-ex-*` ; `domaines` = domaines ayant un fil avec une classe du cycle.
  - `intentionsCompletesDuCycle(matiere, textesIndex, classes, cy): bloc[]` — blocs dont la source s'applique à une classe du cycle.

- [ ] **Step 1 : Tests qui échouent :**
  - `classesDuCycle : cycle 2 → CP, CE1, CE2`
  - `disciplinesDuCycle : seules les matières ayant un fil dans le cycle, dans l'ordre reçu`
  - `disciplinesDuCycle : cycle 1 exclut « maternelle » et prend nomMaternelle`
  - `disciplinesDuCycle : principes = cycle puis « tous » ; aucun → liste vide sans erreur`
  - `disciplinesDuCycle : étiquettes HG cycle 2 → [hg-c2-2026: CP] et [qlm-et-2020: CE1, CE2]`
  - `disciplinesDuCycle : un exemple *-ex-* ne donne pas d'étiquette`
  - `disciplinesDuCycle : domaines limités à ceux qui ont un fil dans le cycle`
  - `intentionsCompletesDuCycle : garde les blocs dont la source vaut pour le cycle`
- [ ] **Step 2 :** `node --test tests/cycles.test.mjs` → FAIL (module absent).
- [ ] **Step 3 :** Implémenter `lib/cycles.js`.
- [ ] **Step 4 :** `npm test` → vert.
- [ ] **Step 5 : Commit** — « Cycles : regroupement des disciplines, étiquettes et principes par cycle »

### Task 5 : URL (`vue=cycle`, `cy`)

**Files:** Modify: `lib/url.js` · Test: `tests/url.test.mjs`

**Interfaces:**
- Produces: `VUES` inclut `'cycle'` ; clé d'état `cy` (chaîne `'1'|'2'|'3'|''`) ; `sanitizeState(s, { classes, matieres })` applique la spec §4.3.

- [ ] **Step 1 : Tests qui échouent :**
  - `parseHash/toHash : #vue=cycle&cy=2&m=hg aller-retour`
  - `sanitize : vue=cycle sans cy ou cy=7 → cy=1`
  - `sanitize : vue=cycle, m absente du cycle (emc en cycle 1) → m vidée`
  - `sanitize : cy conservé en vue carte, vidé en vue classe/lexique`
  - `ancien lien #m=francais&cy=2 → vue carte du français (cy=2 gardé)`
- [ ] **Step 2 :** `node --test tests/url.test.mjs` → FAIL.
- [ ] **Step 3 :** Implémenter (présence d'une matière dans un cycle : un fil avec une classe du cycle, via `classesDuCycle`/`disciplinesDuCycle` de `lib/cycles.js`).
- [ ] **Step 4 :** `npm test` → vert.
- [ ] **Step 5 : Commit** — « URL : vue par cycle »

### Task 6 : Recherche et lexique couvrent les cycles

**Files:** Modify: `lib/carte.js` (`rechercher`), `lib/lexique.js`, `ui/render.js` (`renderLexique`), `ui/carte.js` (`renderResultats`) · Test: `tests/carte.test.mjs`, `tests/lexique.test.mjs`

**Interfaces:**
- Produces: `rechercher(matieres, q, cycles = [])` — résultats de cycle `{ cycle: N, matiereId: null, filNom: 'Principes du cycle N', extrait }`, un par cycle et par texte trouvé (idée ou item) avec dédoublonnage par cycle.
- Produces: `buildLexique(matieres, classes, cycles = [])` — groupe final `{ matiere: { id: 'cycles', nom: 'Principes des cycles' }, termes }`, occurrences `{ cycle: N, filNom: 'Cycle N', classes }`.

- [ ] **Step 1 : Tests qui échouent :**
  - `rechercher : trouve un mot d'une idée-force de cycle → résultat { cycle: 2 }`
  - `rechercher : trouve un mot de la couche 2 d'un cycle`
  - `rechercher : sans cycles, résultats inchangés`
  - `buildLexique : termes des idées-forces dans le groupe « Principes des cycles »`
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** Implémenter ; le rendu (lexique, résultats) fait pointer une occurrence de cycle vers `#vue=cycle&cy=N`.
- [ ] **Step 4 :** `npm test` → vert.
- [ ] **Step 5 : Commit** — « Recherche et lexique : principes des cycles »

### Task 7 : Interface (accueil, page du cycle, menu, retour)

**Files:**
- Create: `ui/cycle.js`
- Modify: `app.js`, `index.html`, `style.css`, `ui/carte.js` (`renderAccueil`, liens de domaine)

**Interfaces:**
- Consumes: Tasks 4-6.
- Produces: `renderBandeauCycles(cycles, classes)`, `renderCycle(cycle, disciplines, state, ctx)` dans `ui/cycle.js`.

- [ ] **Step 1 :** `ui/cycle.js` (spec §4.2) : pastilles 1·2·3 ; centre (titre « Cycle N · nom · classes · âges », idées-forces, chacune `<details>` sur son bloc complet avec `lienPdf`) ; cycle 1 : lien « Voir aussi la carte des principes de la maternelle » (`#vue=carte&m=maternelle`) ; couronne de nœuds disciplines (`<a href="#vue=cycle&cy=N&m=…">`, `aria-current` sur l'actif) ; panneau de la discipline active (étiquettes : titre du texte + classes, badge « NOUVEAU » si `nouveauEn` ; principes via `renderMarkup` ; « Lire en entier » en `<details>` si `intentionsCompletesDuCycle` non vide ; domaines → `#vue=carte&m=…&d=…&cy=N`). Sans discipline active : indice « Choisis une discipline ».
- [ ] **Step 2 :** `renderAccueil` : bandeau « Entrer par cycle » en tête (3 cartes). `app.js` : charge `data/cycles.json`, route `vue=cycle`, passe `cycles` à `rechercher` et `buildLexique`, `NOMS_VUES.cycle = 'Par cycle'` ; en vue carte avec `state.cy`, fil d'Ariane commence par « ← Cycle N » (`#vue=cycle&cy=N&m=<m>`). `index.html` : bouton « Par cycle » en premier dans `#vues`.
- [ ] **Step 3 :** `style.css` : couronne sur ordinateur (grille CSS autour du centre, traits de liaison décoratifs), empilement < 768 px, nœud actif, panneau ; uniquement les variables de couleur existantes (mode sombre).
- [ ] **Step 4 :** `npm test`, `npm run validate` → vert. Vérification visuelle dans le panneau (serveur `programmes`, port 8000) : accueil → cycle 2 → HG (étiquettes CP 2026 / CE1-CE2 2020) → un domaine → carte HG avec « ← Cycle 2 » ; cycle 1 (pas de branche maternelle, noms maternelle) ; cycle 3 ; une idée-force dépliée ; recherche d'un terme de cycle ; à 375 px ; en mode sombre. Console sans erreur.
- [ ] **Step 5 : Commit** — « Interface : carte par cycle, bandeau d'accueil et retour au cycle »

### Task 8 : Contrôles finaux

- [ ] **Step 1 :** `npm test` ; `npm run validate` ; `node scripts/verif-mots.mjs` ; `npm run completude -- francais` ; `npm run completude -- cycles` → tous verts, sorties lues.
- [ ] **Step 2 :** `NOTES.md` : résumé de la carte par cycle, points à relire par Laetitia.
- [ ] **Step 3 : Commit** — « Notes : carte par cycle »
