# Programmes cycles 1-2-3 — Spec de design

Date : 2026-09-27 · Statut : en relecture

## 1. Objectif

Un mini-site de révision **CRPE** qui présente les programmes de l'école (cycle 1, 2, 3 — de la PS à la 6e) **en vigueur à la rentrée 2026-2027**, de manière condensée, sans redondance, consultable facilement sur mobile et ordinateur (filtres, recherche).

Critères de réussite :
- On trouve en quelques secondes ce qui s'applique à une classe donnée dans une matière donnée.
- Chaque information n'apparaît qu'une fois ; la progression d'une notion de la PS à la 6e se lit d'un coup d'œil.
- Les **mots-clés officiels** des programmes sont conservés à l'identique et mis en évidence.
- Chaque contenu renvoie à sa source officielle (BO + PDF Éduscol).

Hors périmètre (YAGNI) : cycle 4 (hors 6e), ressources d'accompagnement Éduscol, évaluations nationales, comptes utilisateurs, mode hors-ligne (PWA), quiz.

## 2. Sources

Pages Éduscol (consultées le 2026-09-27) :
- Cycle 1 : https://eduscol.education.gouv.fr/4341/enseigner-au-cycle-1
- Cycle 2 : https://eduscol.education.gouv.fr/4347/enseigner-au-cycle-2
- Cycle 3 : https://eduscol.education.gouv.fr/4356/enseigner-au-cycle-3

Particularité 2026-2027 : **le programme applicable dépend de la classe, pas seulement du cycle.** Exemples :
- Cycle 2 : CP → nouveaux programmes HG, sciences & techno, EPS, LVER (BO 2026) ; CE1-CE2 → « Questionner le monde » et EPS/LVE 2020.
- Cycle 3 : CM1 → nouveaux HG, EPS, LVER, sciences (BO 2026) ; CM2/6e → HG et EPS 2020, sciences 2023 ; français et maths BO 2025 pour tout le cycle.
- Cycle 1 : programme consolidé (BO 41 du 31/10/2024 + BO 19 du 7/05/2026) + EVAR maternelle.

Matières couvertes (toutes) :
- Cycle 1 : les 5 domaines d'apprentissage + EVAR maternelle.
- Cycles 2-3 : français, mathématiques, histoire-géographie / questionner l'espace et le temps, sciences et technologie / questionner le vivant, la matière et les objets, EMC, EPS, enseignements artistiques (arts plastiques, éducation musicale, histoire des arts), langues vivantes étrangères et régionales, EVAR / EVARS.

Les PDF sont téléchargés dans `sources/` (non versionné, `.gitignore`) ; le site ne fait que **lier** vers les PDF officiels.

## 3. Organisation du contenu : fils de progression

Au lieu de suivre la structure des textes (cycle → matière → contenus), le site est organisé par **matière → domaine → fil de progression**.

- Un **fil** = une compétence ou notion suivie à travers les classes (ex. Maths › Nombres › *Fractions* ; Français › Lecture › *Fluence*).
- Un fil contient :
  - un **socle** : ce qui vaut pour une plage de classes, énoncé **une seule fois** (ex. « CP→CM2 ») ;
  - des **étapes** par classe (ou plage de classes) : **uniquement ce qui s'ajoute** par rapport à l'étape précédente.
- Les **intentions générales** d'une matière sont énoncées une fois en tête de matière.
- Les textes transversaux (EMC CP→Terminale, EVAR, arts 2020 C2-C3) ne sont saisis qu'une fois.
- Quand deux classes relèvent de textes différents en 2026-27 (ex. CP nouveau / CE1 ancien), l'étape porte une **étiquette de source** ; les écarts ne sont signalés que là où ils existent.
- En maternelle, la « classe » est PS / MS / GS ; les domaines de maternelle sont reliés aux matières de l'élémentaire (ex. « Acquérir les premiers outils mathématiques » → Mathématiques) pour que les fils démarrent en PS quand c'est pertinent.

### Règles de condensation (à appliquer à toute saisie)

1. **Condenser les phrases, garder les termes officiels mot pour mot.** Aucun synonyme pour un terme du programme.
2. Balisage des mots-clés dans le texte : `[[terme officiel]]` → affiché surligné, indexé dans le Lexique et la recherche.
3. **Ne jamais répéter** ce qu'une étape antérieure ou le socle a déjà dit.
4. Supprimer la paraphrase, les formules introductives, les exemples non essentiels.
5. Chaque étape cite sa source (id du texte ; page du PDF si possible).
6. En cas de doute sur une interprétation : noter dans `NOTES.md` (section « À vérifier ») plutôt que trancher silencieusement.

## 4. Modèle de données

Fichiers JSON statiques dans `data/`.

`data/classes.json` — les 10 classes et leur cycle :
```json
[{ "id": "PS", "cycle": 1 }, … { "id": "CP", "cycle": 2 }, … { "id": "6e", "cycle": 3 }]
```

`data/textes.json` — les textes officiels :
```json
{
  "id": "hg-c2-2026",
  "titre": "Histoire-géographie cycle 2",
  "matiere": "hg",
  "bo": "BO n° 22 du 28 mai 2026",
  "classes2026": ["CP"],
  "statut": "nouveau",          // "nouveau" | "en-vigueur"
  "pdf": "https://www.education.gouv.fr/…/annexe-3-…-516776.pdf"
}
```
`classes2026` = classes auxquelles le texte s'applique à la rentrée 2026-27. Cela suffit à résoudre « quel texte pour quelle classe ».

`data/matieres/<matiere>.json` — une matière :
```json
{
  "id": "maths",
  "nom": "Mathématiques",
  "intentions": "Texte court avec [[mots-clés]]…",
  "domaines": [{
    "id": "nombres",
    "nom": "Nombres et calcul",
    "fils": [{
      "id": "fractions",
      "nom": "Fractions",
      "socle": { "classes": ["CE2","CM1","CM2","6e"], "texte": "…", "sources": ["maths-c3-2025"] },
      "etapes": [
        { "classes": ["CE2"], "type": "notion", "texte": "+ …", "sources": ["maths-c2-2024"], "page": 12 },
        { "classes": ["CM1"], "type": "attendu", "texte": "…", "sources": ["maths-c3-2025"] }
      ]
    }]
  }]
}
```
- `type` ∈ `competence` | `attendu` | `notion` | `repere` | `crpe` (encadré « à retenir pour le CRPE », rédigé par nous et visuellement distinct du contenu officiel).
- `socle` est optionnel. `etapes` est trié dans l'ordre des classes.
- Les ids de `classes` doivent exister dans `classes.json` ; les `sources` doivent exister dans `textes.json`.

Le **Lexique** n'est pas saisi à part : il est calculé à partir des balises `[[…]]`.

## 5. Interface

Page unique `index.html` + `app.js` + `style.css`, sans framework ni build.

**En-tête / filtres** (barre collante, repliable sur mobile) :
- Cycle : 1 / 2 / 3 / tous
- Classe : PS … 6e (choisir une classe fixe le cycle)
- Matière
- Type d'élément
- Recherche plein texte (texte + mots-clés)

**Trois vues** :
1. **Par matière** — domaines → fils affichés en frises de progression (socle puis étapes). Avec une classe sélectionnée : socle applicable + étape(s) de cette classe seulement.
2. **Par classe** — toutes matières pour la classe choisie, rendu identique filtré ; c'est la « fiche de la classe ».
3. **Lexique** — mots-clés par matière, chacun avec les fils et classes où il apparaît (lien vers le fil).

**Éléments visuels** :
- Badge **NOUVEAU 2026** / référence BO sur les étapes issues de textes `nouveau`.
- Étiquette de source quand des classes voisines relèvent de textes différents.
- Lien PDF officiel sur chaque texte cité.
- Encadré « Ce qui change en 2026-27 » en tête de chaque cycle (généré depuis `textes.json`).
- Encadrés `crpe` distincts du contenu officiel.
- Mots-clés surlignés.
- Mode clair/sombre (préférence système + bascule).

**Navigation** : l'état (vue + filtres + recherche) est reflété dans l'URL (`#vue=matiere&m=maths&c=CE1`) pour pouvoir mettre une vue en favori ou la partager.

**Mobile d'abord** : lisible à 360 px, marges latérales 16 px, pas de défilement horizontal, cibles tactiles ≥ 44 px.

## 6. Arborescence

```
index.html  app.js  style.css
data/classes.json  data/textes.json  data/matieres/*.json
scripts/validate.mjs        # validation des données
sources/                    # PDF + textes extraits (gitignored)
NOTES.md                    # notes de travail : avancement, choix, à vérifier
docs/superpowers/specs/     # cette spec
```

## 7. Production du contenu

1. Télécharger tous les PDF listés sur les 3 pages Éduscol dans `sources/`, extraire le texte (`pdftotext -layout`).
2. Remplir `textes.json` (tous les textes, BO, classes 2026-27, liens).
3. Saisir matière par matière en appliquant les règles de condensation §3, **un commit par matière** :
   maternelle (domaines spécifiques) → français → maths → HG / QLM espace-temps → sciences / QLM vivant-matière-objets → EMC → EPS → arts → LVER → EVAR.
4. `NOTES.md` suit l'avancement, les choix de découpage en fils et les points à vérifier.

## 8. Vérification

- `node scripts/validate.mjs` : JSON valide, champs obligatoires, ids de classes et de sources existants, étapes triées, balises `[[…]]` bien fermées, pas de fil vide ; option `--links` pour vérifier que les URL PDF répondent.
- Contrôle visuel dans le navigateur (mobile 375 px et bureau), clair et sombre, sur chaque vue.
- Contrôle de contenu par échantillonnage : pour chaque matière, relire quelques fils contre le PDF source (mots-clés exacts, pas d'oubli d'attendu).

## 9. Publication

- Dépôt GitHub **public** `laetitiaperez/programmes-cycles-1-2-3`.
- GitHub Pages depuis `main` (racine). Commits fréquents, push à chaque matière terminée.
