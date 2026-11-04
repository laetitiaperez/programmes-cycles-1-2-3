# Programmes cycles 1-2-3 — Carte interactive à deux couches — Spec de design

Date : 2026-11-04 · Statut : en relecture
Remplace l'interface et complète le contenu décrits dans `2026-09-27-programmes-cycles-design.md` (les sections Sources, fils de progression et production du contenu restent valables sauf mention contraire).

## 1. Objectif

Une version **synthétique mais complète** des programmes **en vigueur en 2026-2027** (PS → 6e), pour réviser le CRPE :
- elle reprend fidèlement chaque terme, concept, compétence, connaissance, attendu et exemple des textes officiels ;
- elle supprime uniquement les redondances ;
- elle garde le repérage par cycle, par classe et par âge ;
- elle se parcourt comme une **carte mentale interactive** à deux couches : un résumé pour se repérer dans la structure, un contenu complet pour approfondir.

Constat de départ : le site actuel est trop résumé (français : ~4 900 mots pour ~26 000 dans les textes C2 et C3 ; maths : ~3 700 pour ~44 000).

Critères de réussite :
- Pour n'importe quelle classe et n'importe quel fil, on trouve en deux clics le contenu complet du programme en vigueur, avec sa source et sa page.
- Aucune puce officielle (objectif, attendu, exemple de réussite) n'est absente sans justification écrite (contrôle de complétude, §5).
- Chaque terme mis en avant figure mot pour mot dans le texte cité (contrôle de fidélité, existant).
- La structure d'une matière (domaines → fils) et la progression d'un fil de la PS à la 6e se lisent d'un coup d'œil.

Hors périmètre : les programmes qui entreront en vigueur après 2026-2027 (ex. nouveaux textes 2026 pour CE1-CE2 / CM2-6e), le cycle 4 au-delà de la 6e, les quiz, les comptes utilisateurs.

## 2. Programme en vigueur par classe

Seul compte le texte applicable à chaque classe **en 2026-2027** (c'est lui qui sert au concours). Le rattachement est porté par `data/textes.json` (`classes2026`), déjà en place :

| Matière | PS-GS | CP | CE1-CE2 | CM1 | CM2-6e |
|---|---|---|---|---|---|
| Français, maths | 2024 | 2024 | 2024 | 2025 | 2025 |
| HG, sciences, EPS, LV | programme maternelle consolidé (2024 + 2026) | 2026 | 2020 | 2026 | 2020 (sciences 2023 ; LV 6e : 2025/2026) |
| Arts | 2026 | 2020 | 2020 | 2020 | 2020 |
| EMC | — | 2024 | 2024 | 2024 | 2024 |
| EVAR | 2025 | 2025 | 2025 | 2025 | 2025 |

Préalables (étape 0) :
- revérifier sur les pages Éduscol des trois cycles qu'aucun texte en vigueur n'a changé depuis le 27/09/2026 ; consigner la date de consultation dans `NOTES.md` ;
- corriger les rattachements erronés : en EVAR, chaque étape ne cite que le texte de sa classe (maternelle / élémentaire / collège) ; en EPS, les étapes CE1-CE2 ne citent que `eps-c2-2020`, les étapes CM2-6e que `eps-c3-2020` ;
- ajouter au validateur la règle : une étape ne peut citer qu'un texte dont `classes2026` contient au moins une de ses classes (les exemples Éduscol `*-ex-*` suivent la même règle).

## 3. Contenu : deux couches

Le découpage est inchangé : matière → domaine → fil → étapes par classe.

### Couche 1 — résumé

Le champ `texte` des étapes existantes : une ou deux lignes, mots-clés `[[…]]`. Il est relu et resserré si besoin, mais sa forme ne change pas.

### Couche 2 — complet

Pour chaque fil et chaque classe concernée, le contenu complet du programme en vigueur, au niveau de détail validé sur l'exemple « français, CE1, orthographe grammaticale » :
- rangé sous les **intitulés du texte officiel** (« Objectifs d'apprentissage », « Attendus de fin d'année », « Exemples de réussite », « Repères de progressivité »…), repris tels quels ;
- **terminologie** balisée `[[…]]` (affichée en gras, indexée dans le lexique et la recherche) ;
- source et page à chaque bloc.

Règles de rédaction :
1. **Ne rien retirer** de ce que dit le programme : chaque objectif, attendu, connaissance, compétence et exemple de réussite.
2. Supprimer uniquement les redites : formules administratives, phrases introductives répétées, paraphrases.
3. Un énoncé repris **mot pour mot** d'une classe précédente n'est pas réécrit : il figure dans `reconduit` (affiché replié, « reconduit du CP : … »). S'il évolue, même légèrement, il est écrit en entier.
4. Aucun synonyme pour un terme officiel ; les exemples gardent leur formulation (phrases, mots, nombres donnés en exemple).
5. Les exemples Éduscol (cycle 3, français et maths) sont rangés dans un bloc distinct, marqué « à titre indicatif ».
6. En cas de doute (OCR peu lisible, rattachement incertain) : noter dans `NOTES.md` § « À vérifier » et le signaler à Laetitia, sans trancher seul.

### Modèle de données

Ajout d'un champ optionnel `complet` sur chaque fil, indexé par classe :

```json
{
  "id": "gn-accords",
  "nom": "Groupe nominal et chaîne d'accords",
  "etapes": [ … couche 1, inchangée … ],
  "complet": {
    "CE1": {
      "blocs": [
        { "titre": "Objectifs", "source": "fr-c2-2024", "page": 21,
          "items": ["Reconnaître le [[GN]] (déterminant/nom/adjectif) et comprendre le lien … dans la [[chaîne d'accords]] …"] },
        { "titre": "Exemples de réussite", "source": "fr-c2-2024", "page": 21,
          "items": ["Reconnaît un déterminant ; en indique le genre et le nombre.", "…"] }
      ],
      "reconduit": [
        { "de": "CP", "texte": "Comprendre les notions de masculin et de féminin, de singulier et de pluriel." }
      ]
    }
  }
}
```

- Clés de `complet` : ids de `classes.json`. Pour chaque classe présente dans les `etapes` du fil, une entrée `complet` est attendue une fois la matière traitée.
- `blocs[].source` : id de `textes.json`, soumis à la règle de rattachement du §2.
- `blocs[].titre` : intitulé du texte officiel.
- `reconduit[].de` : une classe antérieure du même fil ; `texte` doit figurer dans la couche 2 de cette classe.
- Les étapes de type `exemple` de la couche 1 restent (aperçu) ; leur contenu complet est dans le bloc « Exemples de réussite » ou « Exemples Éduscol ».
- Pendant la transition, une matière sans `complet` affiche la couche 1 seule.

## 4. Interface

Page unique, sans framework ni build (comme aujourd'hui). Elle remplace les vues et filtres actuels.

**Accueil** : les 10 matières (cartes cliquables) et un encadré « Textes en vigueur en 2026-2027 », généré depuis `textes.json`.

**Vue « par matière » (la carte)** :
- carte de la matière : matière → domaines → fils, en colonnes ; cliquer sur un domaine déplie ses fils ;
- clic sur un fil : **frise** PS → 6e, une case par classe concernée avec la classe, le cycle, l'âge (PS 3 ans … 6e 11 ans) et le résumé (couche 1), plus le badge « nouveau 2026 » quand il s'applique ;
- clic sur une case : la **couche 2** s'ouvre sous la frise (blocs, terminologie en gras, source + page + lien PDF, « reconduit » replié).

**Vue « par classe »** : choix d'une classe ; toutes les matières de cette classe, fil par fil, résumé visible et couche 2 dépliable. Mêmes données, autre rangement.

**Conservé** : recherche plein texte (couches 1 et 2), lexique (calculé depuis les `[[…]]` des deux couches), Bibliothèque (fiches, textes officiels), mode clair/sombre, état dans l'URL.

**URL** : `#vue=carte&m=francais&fil=gn-accords&c=CE1`, `#vue=classe&c=CE1`, `#vue=lexique`, `#vue=biblio`.

**Mobile** : à moins de 768 px, la carte devient une arborescence verticale dépliable et la frise une liste ; lisible à 360 px, marges de 16 px, pas de défilement horizontal, cibles tactiles ≥ 44 px.

## 5. Vérifications

- **Validation** (`npm run validate`) : règles existantes + structure de `complet` (§3) + règle de rattachement texte/classe (§2).
- **Fidélité** (`node scripts/verif-mots.mjs [matière]`) : étendue aux `[[…]]` de la couche 2.
- **Complétude** (nouveau, `node scripts/verif-completude.mjs <matière>`) : pour chaque texte de la matière, extrait les puces de la partie concernée du texte officiel et cherche pour chacune un item de couche 2 qui la reprend (recouvrement de mots après normalisation). Liste les puces non reprises. Une puce peut être écartée volontairement dans `data/completude-exclus.json`, avec sa justification (ex. préambule général, puce relevant d'une autre matière dans un texte consolidé). Une matière est terminée quand le rapport est vide.
- **Tests** (`npm test`) : tests existants conservés ; ajout de tests pour la validation de `complet`, le calcul du lexique sur deux couches, le rendu de la frise, de la couche 2 et de la vue par classe, et la lecture/écriture de l'URL.
- **Contrôle visuel** dans le navigateur : 375 px et bureau, clair et sombre, chaque vue.

## 6. Ordre de travail

0. Préalables (§2).
1. **Pilote : français**. Couche 2 complète PS → 6e ; contrôles verts ; nouvelle interface avec le français seul. **Point d'étape : Laetitia teste et valide** format et interface avant la suite.
2. Les autres matières, une par une, un commit par matière : maths → HG → sciences → EMC → EPS → arts → LV → EVAR → principes de maternelle.
3. Bibliothèque et fiches mises à jour si besoin ; publication sur le dépôt `laetitiaperez/programmes-cycles-1-2-3` (GitHub Pages).

`NOTES.md` suit l'avancement, les choix et les points à vérifier. Commits fréquents.
