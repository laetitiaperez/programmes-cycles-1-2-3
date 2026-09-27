# Notes de travail

## Avancement
| Matière | Statut | Commit |
|---|---|---|
| français | fait (27 fils, 171 étapes) | Task 4 |
| maths | fait (22 fils) | Task 6 |
| hg (QLM espace-temps) | fait (14 fils) | Task 7 |
| sciences (QLM vivant-matière-objets) | fait (12 fils) + fiche | Task 8 |
| emc | fait (12 fils) + fiche | Task 9 |
| eps | fait (8 fils) + fiche | Task 10 |
| arts | fait (11 fils) + fiche | Task 11 |
| lv | fait (9 fils) + fiche | Task 12 |
| evar | fait (4 fils) + fiche | Task 13 |
| maternelle (principes) | à faire | |

## Correspondance domaines de maternelle → matières
Programme C1 consolidé (BO 41/2024 + BO 19/2026), 6 domaines + préambule :
| Domaine C1 | Matière |
|---|---|
| Le développement et la structuration du langage oral et écrit | francais (sauf « S’éveiller à la diversité linguistique » → lv) |
| Agir, s’exprimer, comprendre à travers les activités physiques | eps |
| Agir, s’exprimer, comprendre à travers les activités artistiques | arts |
| L’acquisition des premiers outils mathématiques | maths |
| Se repérer dans le temps et l’espace | hg |
| Découvrir le monde du vivant, de la matière et des objets | sciences |
| Préambule (principes, modalités, évaluation) | maternelle |

## Découpage en fils (par matière)
- **EPS** — Cadre · Se déplacer (courir-sauter-lancer ; orientation) · Équilibres (terrestres et engins ; aquatique) · S'exprimer · Coopérer et s'opposer. Domaines 2026 ↔ champs d'apprentissage 2020.
- **Arts** — PEAC · Arts visuels/plastiques (dessin ; compositions ; images ; attendus) · Musique (chant ; écoute ; création) · Spectacle vivant (maternelle) et histoire des arts (C3). Programmes 2020 en vigueur CP→6e.
- **LV** — Cadre (niveaux CECRL ; horaires et démarche) · Éveil (maternelle, c1-2024) · Oral (CO ; EOC ; EOI) · Écrit (CE ; EE) · Culture (médiation ; thématiques et axes 6e). 6e = anglais 2025 + LVR 2026.
- **EVAR** — Cadre · Corps · Relations · Société (les trois axes, un fil par axe, une étape par classe). Mêmes objectifs dans les trois textes 2025.
- **EMC** — Cadre (quatre dimensions) · Soi et les autres (émotions-empathie ; intimité) · Règles (règles collectives ; droits ; discriminations) · République (symboles ; laïcité ; démocratie ; bien commun) · Numérique (EMI). Pas de maternelle.
- **Sciences** — Démarches · Matière (états et mélanges ; mouvements, énergie, signaux) · Vivant (diversité ; cycle de vie ; écosystèmes ; Terre) · Corps (corps et mouvement ; hygiène ; puberté) · Objets techniques.
- **HG** — Compétences et démarches · Temps (repères, chronologie) · Histoire (temps long C2, CM1 2026, CM2-6e 2020) · Espace (espace proche, représentations du monde) · Géographie (organisations C2, CM1 2026, CM2-6e 2020). Encadrés CRPE : programmes 2026 non encore applicables en CE1-CE2 / CM2-6e.
- **Maths** — Nombres : quantités (mat.) · rang · entiers · fractions · décimaux. Calcul : calcul mental · opérations. Problèmes et algèbre : résolution · algèbre · motifs (mat.). Grandeurs : longueurs · masses-contenances · aires-angles-volumes · durées-monnaie. Géométrie : solides · figures · repérage. Données : données · probabilités · proportionnalité · pensée informatique.
- **Français** — Lecture : phonologie, lettres (maternelle) · décodage · fluence · compréhension · documents · devenir lecteur. Écriture : geste · copie · encodage · production · écrire pour apprendre (C3). Oral : syntaxe orale, articuler (maternelle) · écouter · dire · échanges. Vocabulaire : enrichir · relations · orthographe lexicale. Grammaire : phrase · constituants · classes · GN · accord S-V · conjugaison · phrase complexe.

## Choix faits
- Interface (retour de Laetitia) : barre compacte (☰ + recherche) ; tout le reste dans un panneau latéral `<dialog>` ; ligne de contexte avec filtres actifs supprimables ; pastille = nombre de filtres actifs.
- Bibliothèque (`#vue=biblio`) : fiches de révision (HTML, PDF d'origine en téléchargement) + textes officiels groupés par matière, filtrés par cycle/classe/matière/recherche.
- Fiches : rédigées en Markdown dans `fiches/src/*.md`, générées par `python3 scripts/fiches.py` (→ `fiches/*.html` + `data/fiches.json`). Fiches existantes (français, maths, HG C2-C3) converties fidèlement depuis les PDF. Les fiches manquantes (sciences, EMC, EPS, arts, LV, EVAR, maternelle) sont rédigées après la saisie de chaque matière.
- Maternelle : « à aborder avant 4 ans » → PS, « à partir de 4 ans » → MS, « à partir de 5 ans » → GS (le programme parle d'âges et précise « ou dès que les apprentissages précédents ont pu être observés »).
- Saisie : un script Python par matière (`scripts/saisie/<id>.py`) génère le JSON ; les étapes sont triées automatiquement par classe.
- Contrôle des mots-clés : `node scripts/verif-mots.mjs [matière]` vérifie que chaque `[[terme]]` figure mot pour mot dans le texte cité (extractions -layout et -raw).
- Pages : numéro de page du PDF (pas le numéro imprimé), au niveau de la section.
- Sources : `scripts/fetch-sources.sh` (liste dans `sources/urls.tsv`, non versionné). Le PDF consolidé cycle 3 2023 (media 100806) est bloqué aux robots : copié depuis `~/Documents/ECOLE/0.Objectif CRPE/prgrammes/histoire géo/`.
- Sciences et technologie 2026 (C2 et C3) : PDF « imprimés » sans texte → OCR macOS Vision (`scripts/ocr.swift`). Vérifier l'orthographe des termes OCR contre le PDF.
- Anciens programmes CM2/6e (HG, EPS, arts, LV CM2, sciences 2023) : lien = programme consolidé cycle 3 2023 (c'est ce qu'Éduscol pointe), BO de référence 2020 (2023 pour sciences).
- LV 6e : textes par langue. Référence retenue : anglais collège (BO 22/2025) pour les LVE, cadre commun (annexe 28, BO 21/2026) pour les LVR. Lien = page du BO.
- Les nouveaux programmes 2026 (HG, sciences, EPS, LV) couvrent tout le cycle, mais en 2026-27 seule la 1re classe (CP / CM1) les applique : on ne saisit que cette classe depuis ces textes.

## À vérifier
