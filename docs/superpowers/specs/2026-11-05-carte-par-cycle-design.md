# Programmes cycles 1-2-3 — Carte par cycle (porte d'entrée) — Spec de design

Date : 2026-11-05 · Statut : en relecture
S'ajoute à `2026-11-04-carte-deux-couches-design.md` (pilote français terminé sur la branche `carte-deux-couches`). Rien de l'existant n'est retiré.

## 1. Objectif

Une **carte mentale interactive par cycle**, nouvelle porte d'entrée du site, pour **comprendre la logique de chaque cycle** avant d'approfondir avec les vues existantes (par matière, par classe).

Pour un cycle donné, on voit d'un coup d'œil :
- le cycle lui-même (nom officiel, classes, âges) et **ses principes officiels**, en deux couches (idées-forces, puis texte complet) ;
- **toutes les disciplines** du cycle, sous leur nom dans ce cycle, avec le texte en vigueur pour chaque classe, leurs principes pour ce cycle et leurs domaines ;
- un lien de chaque domaine vers la carte de la discipline (vue existante).

Critères de réussite :
- Depuis l'accueil, en un clic, on ouvre la carte d'un cycle ; en un clic de plus, on lit les principes d'une discipline pour ce cycle ; en un clic de plus, on est dans la carte détaillée de la discipline.
- Le mélange des textes à l'intérieur d'un cycle se voit sans lire de note (ex. cycle 2 : histoire-géographie 2026 en CP, « Questionner l'espace et le temps » 2020 en CE1-CE2).
- Chaque terme mis en avant (couche 1) figure mot pour mot dans le texte cité ; aucun énoncé des textes de cycle n'est absent de la couche 2 sans justification (mêmes contrôles que le pilote).
- Toutes les vues existantes (par matière, par classe, lexique, bibliothèque, recherche) restent disponibles et inchangées dans leur fonctionnement.

Hors périmètre :
- les attendus de fin de cycle (écartés par Laetitia le 2026-11-05) ;
- le volet 2 « Contributions essentielles des différents enseignements au socle commun » (en vigueur, mais il décrit le socle plutôt que la logique du cycle et date d'avant les programmes 2024-2025 de français et de maths) : candidat à une future entrée « Le socle commun » ;
- la comparaison des trois cycles sur une même carte ;
- les programmes qui entreront en vigueur après 2026-2027.

## 2. Sources des principes de cycle (textes en vigueur en 2026-2027)

| Cycle | Nom officiel | Classes · âges | Texte des principes | Fichier extrait |
|---|---|---|---|---|
| 1 | Cycle des apprentissages premiers | PS-MS-GS · 3-5 ans | Préambule du programme de l'école maternelle (consolidé 2024 + 2026) | `sources/raw/c1-2026.txt` |
| 2 | Cycle des apprentissages fondamentaux | CP-CE1-CE2 · 6-8 ans | Volet 1 « Les spécificités du cycle des apprentissages fondamentaux » (programme 2015 modifié 2020) | `sources/raw/c2-2020.txt` (l. 20-97) |
| 3 | Cycle de consolidation | CM1-CM2-6e · 9-11 ans | Volet 1 « Les spécificités du cycle de consolidation » (version 2020, modifiée 2023) | `sources/raw/c3-2023.txt` (l. 34-161) |

Statut juridique (étape 0, à faire avant toute extraction) :
- **Vérifié le 2026-11-05** : l'arrêté du 22 octobre 2024 (JORFTEXT000050395251, art. 2) supprime seulement « les parties relatives à l'enseignement de français et de mathématiques » de l'annexe 2 de l'arrêté du 9 novembre 2015 ; les volets 1 et 2 du cycle 2 restent donc en vigueur.
- **À vérifier** sur Légifrance (version consolidée) : les arrêtés de 2025 (français et maths cycle 3) et de 2026 (HG, sciences, EPS, LV cycles 2 et 3) ne suppriment pas le volet 1 de leur cycle. Consigner le résultat et la date dans `NOTES.md`.
- Si un volet 1 se révèle abrogé : le signaler à Laetitia ; le centre de ce cycle se limite alors au nom, aux classes et aux âges (pas de principes de cycle), le reste de la carte est inchangé.
- Maternelle : l'arrêté du 16 avril 2026 abroge entièrement le texte de 2015 ; le préambule du programme consolidé est le seul texte de principes.

Les fichiers extraits existent déjà ; leurs pages sont repérées comme pour les matières (`data/completude-portee.json`).

## 3. Contenu

### 3.1 Le centre : le cycle

- **Couche 1 — idées-forces** : une ligne par idée, rédigée à la main, termes officiels entre `[[…]]` (vérifiés mot pour mot dans la source). Elles suivent les intertitres officiels, par exemple :
  - cycle 1 : « Une école qui s'adapte aux besoins et aux rythmes de développement de chaque élève », « Une école qui organise des modalités spécifiques d'apprentissage » (apprendre en jouant, en réfléchissant et en résolvant des problèmes, en s'exerçant, en mémorisant), « Une école où les enfants apprennent et vivent ensemble »… ;
  - cycle 2 : la langue française au centre, « on articule le concret et l'abstrait », « l'oral et l'écrit sont en décalage important », « on apprend à justifier de façon rationnelle »… ;
  - cycle 3 : liaison école-collège, la classe de 6e, consolidation, autonomie…
- **Couche 2 — texte complet** : le texte officiel mot pour mot (seules les redites strictes sont retirées), découpé en blocs sous les intertitres officiels, chaque bloc avec sa source et sa page. Même format de bloc que la couche 2 des matières : `{titre, source, page, items}`.
- Chaque idée-force de la couche 1 renvoie au bloc de la couche 2 qui la développe (champ `bloc`, index ou titre).

Cycle 1 : la matière existante « École maternelle — principes » (`maternelle.json`) résume déjà ce préambule en couche 1. Elle reste telle quelle dans la vue par matière ; dans la carte du cycle 1, elle **n'apparaît pas comme une branche** (c'est le centre) et le centre propose un lien « Voir aussi la carte des principes de la maternelle ». Légère redite assumée entre les idées-forces (une ligne chacune) et les étapes de cette matière.

### 3.2 Les branches : les disciplines du cycle

- **Disciplines présentes** : toute matière (sauf `maternelle` en cycle 1) dont au moins un fil a une classe du cycle. Ordre : celui de `data/matieres/index.json`.
- **Nom** : en cycle 1, `nomMaternelle` quand il existe (sinon `nom`) ; en cycles 2 et 3, `nom`.
- **Étiquettes des textes en vigueur** : calculées depuis `data/textes.json` (`classes2026`), regroupées par texte, limitées aux classes du cycle. Exemple (HG, cycle 2) : « CP · Histoire-géographie cycle 2 (2026) », « CE1-CE2 · Questionner l'espace et le temps (2020) ». Les exemples Éduscol (`*-ex-*`, « à titre indicatif ») sont exclus des étiquettes. Rien n'est saisi deux fois.
- **Principes de la discipline pour ce cycle** :
  - couche 1 : le champ `intentions` de chaque matière est découpé par cycle dans un nouveau champ `intentionsParCycle` = `{ "1"?: texte, "2"?: texte, "3"?: texte, "tous"?: texte }`. Le découpage **reprend le texte existant sans rien ajouter** ; ce qui vaut pour plusieurs cycles ou pour tous (ex. EMC, LV, EVAR, « Élémentaire : … » en EPS) va sous `tous` ou est recopié tel quel dans chaque cycle concerné. La carte d'un cycle affiche `intentionsParCycle[cycle]` puis `intentionsParCycle.tous`.
  - Le champ `intentions` reste la source d'affichage de la carte par matière ; la validation vérifie que `intentionsParCycle` ne contient aucun terme `[[…]]` absent de `intentions` (pas de contenu nouveau caché).
  - couche 2 : quand la matière a des `intentionsCompletes` (aujourd'hui le français), « Lire en entier » déplie les blocs dont la source s'applique à au moins une classe du cycle (`classes2026` du texte cité).
- **Domaines** : liste des domaines de la matière ayant au moins un fil dans le cycle ; chacun est un lien vers la carte de la matière, domaine ouvert (`#vue=carte&m=…&d=…`).

## 4. Interface

### 4.1 Accueil
Un bandeau **« Entrer par cycle »** en tête : trois cartes (Cycle 1, 2, 3) avec nom officiel, classes, âges. Le reste de l'accueil (matières, textes en vigueur) est inchangé.

### 4.2 Page d'un cycle (`#vue=cycle&cy=2`, discipline ouverte : `&m=hg`)
- Pastilles Cycle 1 · 2 · 3 en haut pour changer de cycle.
- **Centre** : nœud « Cycle 2 · cycle des apprentissages fondamentaux · CP-CE1-CE2 · 6-8 ans » ; idées-forces (couche 1), chacune repliable (`<details>`) sur son bloc de texte complet (couche 2) avec lien vers la page du PDF.
- **Branches** : nœuds des disciplines reliés au centre. Ordinateur : disposition en couronne autour du centre (CSS, sans bibliothèque). Téléphone (< 768 px) : empilés sous le centre. Mode sombre pris en charge comme le reste du site.
- **Clic sur une discipline** : panneau de la discipline (même logique que domaine → fils de la carte actuelle) : étiquettes de textes, principes du cycle (+ « Lire en entier » si couche 2), liste des domaines. Le nœud actif est mis en évidence (`aria-current`). Un clic sur un autre nœud change le panneau.
- **Retour au cycle** : les liens vers la carte d'une matière depuis la page d'un cycle portent `cy` ; la carte de la matière affiche alors un lien « ← Cycle 2 » dans le fil d'Ariane.

### 4.3 Reste du site
- Menu des vues : nouvelle entrée **« Par cycle »** (en premier), à côté de « Par matière », « Par classe », Lexique, Bibliothèque.
- Recherche : couvre aussi les idées-forces et la couche 2 des cycles ; un résultat de cycle renvoie à `#vue=cycle&cy=N`.
- Lexique : indexe aussi les termes `[[…]]` des idées-forces de cycle.
- URL : `cy` ∈ {1, 2, 3}, conservé pour `vue=cycle` et `vue=carte` (origine, pour le lien de retour), vidé ailleurs ou si invalide ; `vue=cycle` sans `cy` valide → `cy=1`. `m` dans la vue cycle doit être une discipline présente dans ce cycle, sinon vidé. Les anciens liens (qui utilisaient `cy` comme filtre) continuent d'ouvrir la carte de la matière comme aujourd'hui ; au pire, ils affichent en plus le lien de retour vers ce cycle.

## 5. Données et production

- **`data/cycles.json`** (nouveau), généré :
  ```json
  [{ "id": 1, "nom": "Cycle des apprentissages premiers", "classes": ["PS","MS","GS"],
     "source": "c1-2026",
     "idees": [{ "texte": "… [[apprendre en jouant]] …", "bloc": 2 }],
     "complet": { "blocs": [{ "titre": "…", "source": "c1-2026", "page": 3, "items": ["…"] }] } }]
  ```
  Les âges viennent de `classes.json` (pas recopiés).
- **`scripts/saisie/cycles.py`** : couche 1 (idées-forces) saisie à la main ; importe la couche 2 de `scripts/saisie/cycles_complet.py`.
- **`scripts/gen_cycles.py`** : génère `cycles_complet.py` à partir des trois extraits, mot pour mot, sur le modèle de `scripts/gen_fr_c3.py` (lecture continue, intertitres en liste explicite, réparations explicites si le PDF a déplacé du texte). Ne pas éditer `cycles_complet.py` à la main.
- **`intentionsParCycle`** : saisi dans `scripts/saisie/<matière>.py` pour les 9 matières (hors `maternelle`).
- Chargement : `app.js` charge `cycles.json` avec les autres données ; logique pure dans **`lib/cycles.js`** (regroupement des disciplines par cycle, étiquettes de textes, domaines, blocs complets du cycle) ; rendu dans **`ui/cycle.js`**.

## 6. Vérifications

- `npm run validate` : structure de `cycles.json` (3 cycles, classes connues et dans le bon cycle, sources connues, pages entières, `bloc` existant, aucun bloc vide) ; `intentionsParCycle` (clés autorisées, pas de terme `[[…]]` absent de `intentions`).
- `node scripts/verif-mots.mjs cycles` : chaque terme `[[…]]` des idées-forces figure mot pour mot dans sa source.
- `npm run completude -- cycles` : chaque énoncé des trois textes de cycle (portées de pages dans `data/completude-portee.json`) est repris dans la couche 2 ; exclusions justifiées dans `data/completude-exclus.json`.
- Tests `node --test` pour `lib/cycles.js` (disciplines par cycle, exclusion de `maternelle` en cycle 1, noms maternelle, étiquettes regroupées et sans `*-ex-*`, domaines du cycle, blocs complets filtrés), `lib/url.js` (`vue=cycle`, `cy` gardé en carte et vidé ailleurs, `m` dans un cycle, anciens liens), recherche et lexique (termes de cycle).
- Vérification visuelle à la main : ordinateur, 375 px, mode sombre.

## 7. Déroulement

- Même branche locale `carte-deux-couches`, commits fréquents. Rien n'est poussé, fusionné ni publié sans l'accord de Laetitia.
- Ordre : étape 0 (statut juridique) → données et génération → logique (`lib/`) → interface → vérifications → relecture finale par un sous-agent.

## 8. Correction de la conception présentée en conversation

La maternelle compte **six** domaines d'apprentissage dans le programme 2026 (et non cinq, comme dit en conversation).
