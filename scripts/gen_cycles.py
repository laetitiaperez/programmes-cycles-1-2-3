"""Génère scripts/saisie/cycles_complet.py (couche complète des principes de cycle) à partir des textes extraits.
Cycle 1 : préambule du programme de l'école maternelle (c1-2026). Cycles 2 et 3 : volet 1 « Les spécificités du
cycle » des programmes 2015 modifiés (c2-2020, c3-2023), toujours en vigueur en 2026-2027 (cf. NOTES.md).
Le texte est repris mot pour mot, découpé sous les intertitres officiels (liste explicite ci-dessous), un item par
paragraphe. Seuls sont retirés les pieds de page et les appels de note.
Usage (sources/raw requis) : python3 scripts/gen_cycles.py"""
import os, pprint, re

RACINE = os.path.join(os.path.dirname(__file__), "..")

CYCLES = {
    1: {"fichier": "c1-2026", "source": "c1-2026", "debut": "\nPréambule\n", "entete": ["Préambule"], "fin": "Le développement et la structuration du langage oral et écrit",
        "intro": None, "intertitres": [
            "L’école maternelle, une première école ambitieuse, attentive au développement, aux besoins et au bienêtre des jeunes enfants",
            "Une école qui s’adapte aux besoins et aux rythmes de développement de chaque élève",
            "Une école qui accueille les enfants et leurs parents dans le respect mutuel de chacun",
            "Une école qui tient compte du développement de l’enfant",
            "Une école qui accompagne les transitions",
            "Une école qui organise des modalités spécifiques d’apprentissage",
            "Apprendre en jouant",
            "Apprendre en réfléchissant et en résolvant des problèmes concrets",
            "Apprendre en s’exerçant",
            "Apprendre en mémorisant",
            "Une école où les enfants apprennent et vivent ensemble",
            "Accompagner l’enfant à devenir élève et à identifier ses progrès en pratiquant une évaluation positive",
            "Se construire comme personne singulière au sein d’un groupe",
            "Les six domaines d’apprentissage",
        ]},
    2: {"fichier": "c2-2020", "source": "volet1-c2-2020", "debut": "Volet 1 : les spécificités du cycle des apprentissages",
        "fin": "Volet 2 : contributions essentielles", "intro": "Les spécificités du cycle des apprentissages fondamentaux (cycle 2)",
        "entete": ["Volet 1 : les spécificités du cycle des apprentissages", "fondamentaux (cycle 2)"], "intertitres": [
            "Au cycle 2, l’acquisition des savoirs fondamentaux (lire, écrire, compter, respecter autrui) est la priorité.",
            "Au cycle 2, le sens et l’automatisation se construisent simultanément.",
            "Au cycle 2, la langue française constitue l’objet d’apprentissage central.",
            "Au cycle 2, on articule le concret et l’abstrait.",
            "Au cycle 2, l’oral et l’écrit sont en décalage important.",
            "Au cycle 2, les connaissances intuitives tiennent encore une place centrale.",
            "Au cycle 2, on apprend à réaliser les activités scolaires fondamentales.",
            "Au cycle 2, on apprend à justifier de façon rationnelle.",
        ]},
    3: {"fichier": "c3-2023", "source": "volet1-c3-2023", "debut": "Volet 1 : les spécificités du cycle de consolidation (cycle 3)\n", "occurrence": 2,
        "fin": "Volet2:contributions", "intro": "Les spécificités du cycle de consolidation (cycle 3)",
        "entete": ["Volet 1 : les spécificités du cycle de consolidation (cycle 3)"], "intertitres": [
            "Objectifs d’apprentissage",
        ]},
}

# Pieds de page et mentions de source insérés par l'extraction (pas du texte du programme).
PIEDS = [
    r"© Ministère de l'Éducation nationale de la Jeunesse et des Sports > www\.education\.gouv\.fr",
    r"D’après le BOEN no?\s*31 du 30 juillet 2020 et le BOEN\s*no?\s*25 du 22 juin 2023\s*© Direction générale de l’enseignement scolaire > www\.eduscol\.education\.fr \d+",
    r"© Direction générale de l’enseignement scolaire > www\.eduscol\.education\.fr \d+",
]
# Coquilles d'extraction (mots collés par le PDF).
REPARATIONS = [("languefrançaise", "langue française"), ("6e , les", "6e, les")]


def nettoyer(texte):
    for p in PIEDS:
        texte = re.sub(p, "\n", texte)
    texte = texte.replace("\f", "\n\f")
    return texte


def paragraphes(lignes, largeur):
    """Recolle les lignes en paragraphes : une ligne qui finit une phrase et n'occupe pas toute la largeur clôt le paragraphe."""
    paras, courant = [], []
    for l in lignes:
        l = re.sub(r"\.(\d)$", ".", l.strip())  # appel de note en fin de ligne (« élèves.3 »)
        if not l or l.isdigit():  # ligne vide ou numéro de page
            continue
        courant.append(l)
        if re.search(r"[.:;»)]$", l) and len(l) < 0.85 * largeur:
            paras.append(courant)
            courant = []
    if courant:
        paras.append(courant)
    out = []
    for p in paras:
        t = " ".join(p)
        for a, b in REPARATIONS:
            t = t.replace(a, b)
        out.append(re.sub(r"\s+", " ", t).strip())
    return out


def cycle(cy, c):
    brut = open(os.path.join(RACINE, "sources", "raw", c["fichier"] + ".txt"), encoding="utf-8").read()
    a = -1
    for _ in range(c.get("occurrence", 1)):  # le titre du volet figure aussi dans la table des matières
        a = brut.index(c["debut"], a + 1)
    b = brut.index(c["fin"], a)
    page0 = brut[:a].count("\f") + 1
    lignes, pages = [], []
    page = page0
    for l in nettoyer(brut[a:b]).split("\n"):
        if l.startswith("\f"):
            page += 1
            l = l[1:]
        lignes.append(l.strip())
        pages.append(page)
    longueurs = sorted(len(l) for l in lignes if l)
    largeur = longueurs[len(longueurs) * 9 // 10]  # largeur usuelle d'une ligne pleine
    for e in c.get("entete", [c["debut"]]):  # titre du volet / « Préambule »
        i = lignes.index(e.strip())
        lignes[i] = ""
    blocs, titre, tpage, corps = [], c["intro"], page0, []
    def fermer():
        if titre is not None and corps:
            blocs.append({"titre": titre, "source": c["source"], "page": tpage, "items": paragraphes(corps, largeur)})
        elif corps and any(x for x in corps):
            raise SystemExit(f"cycle {cy} : texte sans intertitre : {corps[:2]}")
    i = 0
    restants = list(c["intertitres"])
    while i < len(lignes):
        trouve = None
        for n in (1, 2):
            joint = re.sub(r"\s+", " ", " ".join(lignes[i:i + n])).strip()
            if restants and joint == restants[0]:
                trouve = n
                break
        if trouve:
            fermer()
            titre, tpage, corps = restants.pop(0), pages[i], []
            i += trouve
            continue
        corps.append(lignes[i])
        i += 1
    fermer()
    if restants:
        raise SystemExit(f"cycle {cy} : intertitres introuvables : {restants}")
    return blocs


if __name__ == "__main__":
    complets = {cy: cycle(cy, c) for cy, c in CYCLES.items()}
    with open(os.path.join(RACINE, "scripts", "saisie", "cycles_complet.py"), "w", encoding="utf-8") as f:
        f.write('"""Généré par scripts/gen_cycles.py — ne pas éditer à la main."""\n\nCOMPLETS = ')
        f.write(pprint.pformat(complets, width=120, sort_dicts=False))
        f.write("\n")
    for cy, blocs in complets.items():
        print(f"cycle {cy} : {len(blocs)} blocs, {sum(len(b['items']) for b in blocs)} paragraphes, "
              f"{sum(len(i.split()) for b in blocs for i in b['items'])} mots")
