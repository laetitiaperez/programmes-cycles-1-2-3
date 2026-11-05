"""Génère scripts/saisie/fr_c3.py (couche complète du français, CM1-CM2-6e) à partir des textes extraits.
Le programme du cycle 3 (fr-c3-2025) ne contient que des objectifs, énoncés ligne à ligne : on les reprend mot pour mot,
sous-partie par sous-partie, rattachés aux fils du site. Les exemples de réussite viennent des documents Éduscol
(fr-ex-cm1/cm2/6e), qui recopient les objectifs puis donnent les exemples : on ne garde que les exemples.
Les termes balisés [[…]] dans la couche 1 d'un fil sont balisés dans sa couche 2. Un objectif repris à l'identique
de la classe précédente du même fil devient « reconduit ».
Usage (sources/raw requis) : python3 scripts/gen_fr_c3.py"""
import json, os, pprint, re, unicodedata

RACINE = os.path.join(os.path.dirname(__file__), "..")
CLASSES = {"Cours moyen première année": "CM1", "Cours moyen deuxième année": "CM2", "Sixième": "6e"}
DOMAINES = {"Lecture": "comprehension", "Écriture": "production", "Oral": "ecouter", "Vocabulaire": "enrichir",
            "Grammaire et orthographe grammaticale": "phrase"}
NOMS = {"Lecture": "Lecture", "Écriture": "Écriture", "Oral": "Oral", "Vocabulaire": "Vocabulaire",
        "Grammaire et orthographe grammaticale": "Grammaire et orthographe"}
SOUS_PARTIES = [  # début de l'intitulé (normalisé) → fil
    ("lire avec fluidite", "fluence"), ("lire a voix haute avec expressivite", "fluence"),
    ("lire et comprendre seul", "comprehension"), ("lire et comprendre des textes, des documents et des images pour apprendre", "documents"),
    ("lire une oeuvre", "lecteur"), ("ecrire a la main", "geste"), ("ecrire pour reflechir", "ecrire-apprendre"),
    ("produire des ecrits", "production"), ("ecouter pour comprendre", "ecouter"), ("dire pour etre compris", "dire"),
    ("participer a des echanges", "echanges"), ("enrichir son vocabulaire", "enrichir"), ("etablir des relations", "relations"),
    ("reemployer le vocabulaire", "enrichir"), ("memoriser l'orthographe", "orthographe-lexicale"),
    ("connaitre les trois types de phrases", "phrase"), ("analyser une phrase simple", "constituants"),
    ("distinguer les notions de nature", "classes"), ("identifier les mots, un groupe de mots", "classes"),
    ("analyser le groupe nominal", "groupe-nominal"), ("differencier phrase simple et phrase complexe", "phrase-complexe"),
    ("reperer les differents modes d'articulation", "phrase-complexe"), ("identifier les classes de mots subissant", "classes"),
    ("realiser la chaine d'accords", "groupe-nominal"), ("accorder le sujet et le verbe", "accord-sujet-verbe"),
    ("approfondir sa maitrise de la conjugaison", "conjugaison"),
]
PROSE_TITRES = {"principes": "principes", "reperes": "repères", "points de vigilance pour les professeurs": "points de vigilance",
                "au cycle 3": "fréquence des apprentissages", "au cours moyen": "fréquence des apprentissages",
                "en 6e": "fréquence des apprentissages"}
# Intertitres de regroupement de l'étude de la langue : ce ne sont ni des sous-parties ni des objectifs.
INTERTITRES = {"identifier les constituants d'une phrase simple", "se reperer dans la phrase complexe",
               "acquerir l'orthographe grammaticale"}
SOURCES_EX = {"CM1": "fr-ex-cm1", "CM2": "fr-ex-cm2", "6e": "fr-ex-6e"}


def norm(s):
    s = s.replace("’", "'").replace("œ", "oe").replace("Œ", "Oe")
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()


def mots(s):
    return {re.sub(r"[sx]$", "", m) for m in re.split(r"[^a-z0-9]+", norm(s)) if len(m) >= 4}


def pages(fichier):
    return open(os.path.join(RACINE, "sources", "raw", fichier + ".txt"), encoding="utf-8").read().split("\f")


def flux(fichier, debut):
    """Lignes non vides du texte, en continu d'une page à l'autre : [(page, ligne)] ; numéros de page imprimés ôtés."""
    out = []
    for n, page in enumerate(pages(fichier), 1):
        if n < debut:
            continue
        for l in page.split("\n"):
            if l.strip() and not re.fullmatch(r"\d+", l.strip()):
                out.append((n, l))
    return out


def fil_de(titre):
    t = norm(titre)
    for debut, fil in SOUS_PARTIES:
        if t.startswith(debut):
            return fil
    return None


# Mises en page fautives du PDF corrigées à l'extraction : (début de ligne fautif, correction).
REPARATIONS = [("nomme leur fonction grammaticale : le complément", "nomme leur fonction grammaticale : le complément du nom."),
               ("• Différencier épithète et attribut du sujet. du nom.", "• Différencier épithète et attribut du sujet.")]


def segments(lignes, puces=False):
    """Regroupe les lignes en énoncés. Programme : une majuscule ouvre un énoncé, sauf après « + / ( : , ; » ou devant
    une abréviation (« Dét. », « Adj. »). Exemples Éduscol (puces=True) : seule une puce ouvre un énoncé."""
    out = []
    for l in lignes:
        l = l.strip()
        for fautif, juste in REPARATIONS:
            if l == fautif:
                l = juste
        if not l:
            continue
        puce = bool(re.match(r"^[-—−•\uf000-\uf8ff]", l))
        if puces:
            ouvre = bool(re.match(r"^[•\uf000-\uf8ff]", l))  # « -a-, -â-… » en début de ligne n'est pas une puce
        else:
            abrev = bool(re.match(r"^[A-ZÉ][a-zé]{0,4}\.(\s|$)", l))
            suite = bool(out) and re.search(r"[+/(:,;]$", out[-1].rstrip())
            ouvre = puce or (l[0].isupper() and not abrev and not suite)
        if not out or ouvre:
            out.append(l)
        else:
            out[-1] = out[-1][:-1] + l if re.search(r"\w-$", out[-1]) else out[-1] + " " + l
    return [re.sub(r"^[-—−•]\s*", "", s).replace("’", "'") for s in out]


def parse_programme():
    """→ objectifs[(classe, fil)] = [(page, texte)], prose[(domaine, titre)] = [(page, texte)], culture[classe] = [(page, texte)]."""
    objectifs, prose, culture = {}, {}, {}
    domaine, classe, sous, titre_sous = "Lecture", None, None, None  # les principes généraux (p. 2) précèdent « Lecture »
    mode, titre_prose, cible_culture = None, None, None
    tampon = []

    def vider():
        nonlocal tampon
        if not tampon:
            return
        page = tampon[0][0]
        textes = segments([l for _, l in tampon])
        if mode == "objectifs" and classe and sous:
            objectifs.setdefault((classe, sous), []).extend((page, t, titre_sous) for t in textes)
        elif mode == "prose" and domaine:
            prose.setdefault((domaine, titre_prose), []).extend((page, t) for t in textes)
        elif mode == "culture":
            culture.setdefault(cible_culture, []).extend((page, t) for t in textes)
        tampon = []

    lignes = flux("fr-c3-2025", 2)
    for i, (n, brute) in enumerate(lignes):
        l = brute.strip()
        suivante = lignes[i + 1][1].strip() if i + 1 < len(lignes) else ""
        if True:
            if l in DOMAINES and (suivante in ("Principes", "Repères") or l == "Lecture"):
                vider(); domaine, classe, sous, mode, titre_prose = l, None, None, "prose", "principes"; continue
            if l in CLASSES and mode != "culture":
                vider(); classe, sous, mode = CLASSES[l], None, None; continue
            if l == "Culture littéraire et artistique":
                vider(); mode, cible_culture = "culture", "intro"; continue
            if mode == "culture" and l in ("Cours moyen première et deuxième années", "Sixième"):
                vider(); cible_culture = "CM" if l.startswith("Cours") else "6e"; continue
            if norm(l) in INTERTITRES:
                continue
            if suivante.startswith("Objectifs d") and fil_de(l):
                vider(); sous, titre_sous, mode = fil_de(l), l, "objectifs"; continue
            if l.startswith("Objectifs d"):
                continue
            if mode in ("prose", None) and norm(l) in PROSE_TITRES and classe is None:
                vider(); mode, titre_prose = "prose", PROSE_TITRES[norm(l)]; continue
            if domaine == "Lecture" and n == 2 and mode == "prose" and titre_prose == "principes" and l == "Principes":
                continue
            if mode:
                tampon.append((n, brute))
    vider()
    return objectifs, prose, culture


def parse_exemples(classe, objectifs):
    """→ exemples[(classe, fil)] = [(page, texte)] : segments Éduscol qui ne recopient pas un objectif du programme."""
    exemples = {}
    sous, titre_sous, tampon, ignorer = None, None, [], False

    def vider():
        nonlocal tampon
        if sous and tampon and not ignorer:
            page = tampon[0][0]
            objs = [mots(t) for _, t, _ in objectifs.get((classe, sous), [])]
            for t in segments([l for _, l in tampon], puces=True):
                m = mots(t)
                if len(m) < 4:
                    continue
                if any(o and len(m & o) / len(m) >= 0.8 for o in objs):
                    continue
                exemples.setdefault((classe, sous), []).append((page, t, titre_sous))
        tampon = []

    lignes = flux(SOURCES_EX[classe], 3)
    for i, (n, brute) in enumerate(lignes):
        l = brute.strip()
        suivante = lignes[i + 1][1].strip() if i + 1 < len(lignes) else ""
        suivante2 = lignes[i + 2][1].strip() if i + 2 < len(lignes) else ""
        if True:
            # intitulé de sous-partie sur deux lignes
            if suivante2.startswith("Objectifs d") and fil_de(l + " " + suivante) and not suivante.startswith("Objectifs d"):
                vider(); sous, titre_sous, ignorer = fil_de(l + " " + suivante), l + " " + suivante, False
                lignes[i + 1] = (lignes[i + 1][0], ""); continue
            if not l:
                continue
            if l == "Culture littéraire et artistique":
                vider(); ignorer = True; continue
            if re.fullmatch(r"\d+", l) or l in DOMAINES or l in ("Grammaire et orthographe", "Grammaire et orthographe grammaticale"):
                continue
            if norm(l) in INTERTITRES:
                continue
            if suivante.startswith("Objectifs d") and fil_de(l):
                vider(); sous, titre_sous, ignorer = fil_de(l), l, False; continue
            if l.startswith("Objectifs d"):
                continue
            if l.startswith(("Les élèves pourront lire", "Œuvres", "Pistes de prolongements")):
                vider(); ignorer = True; continue
            if re.match(r"^[-]", l):
                continue
            tampon.append((n, brute))
    vider()
    return exemples


def baliser(texte, termes):
    for t in sorted(termes, key=len, reverse=True):
        if "[[" + t in texte or t not in texte:
            continue
        i = texte.index(t)
        avant = texte[:i]
        if avant.count("[[") > avant.count("]]"):
            continue
        texte = avant + "[[" + t + "]]" + texte[i + len(t):]
    return texte


def main():
    fr = json.load(open(os.path.join(RACINE, "data", "matieres", "francais.json"), encoding="utf-8"))
    fils = {f["id"]: f for d in fr["domaines"] for f in d["fils"]}
    termes = {fid: {m for e in f.get("etapes", []) if set(e["classes"]) & {"CM1", "CM2", "6e"}
                    for m in re.findall(r"\[\[(.+?)\]\]", e["texte"])} for fid, f in fils.items()}
    objectifs, prose, culture = parse_programme()
    complet = {}

    def k(fil, classe):
        return complet.setdefault(fil, {}).setdefault(classe, {"blocs": [], "reconduit": []})

    def bloc(fil, classe, titre, source, items):
        if items:
            k(fil, classe)["blocs"].append({"titre": titre, "source": source, "page": items[0][0],
                                             "items": [baliser(t, termes.get(fil, ())) for _, t in items]})

    intentions = []
    for (dom, titre), items in prose.items():
        if dom is None:
            continue
        nom = f"{NOMS[dom]} — {titre} (CM1 → 6e)"
        if dom == "Lecture" and titre == "principes" and items and items[0][0] == 2 and False:
            pass
        bloc(DOMAINES[dom], "CM1", nom, "fr-c3-2025", items)
    # Principes généraux (avant « Lecture ») : rangés dans prose[("Lecture", "principes")] page 2 ; on les sépare.
    gen = complet["comprehension"]["CM1"]["blocs"][0]
    coupe = next((i for i, t in enumerate(gen["items"]) if t.startswith("L'enjeu du cycle 3 est de développer")), None)
    if coupe:
        intentions.append({"titre": "Programme de français du cycle 3 — principes", "source": "fr-c3-2025", "page": 2,
                           "items": gen["items"][:coupe]})
        gen["items"] = gen["items"][coupe:]
    for cle, titre in (("intro", "Culture littéraire et artistique — principes (CM1 → 6e)"),
                       ("CM", "Culture littéraire et artistique — entrées du cours moyen (CM1 et CM2)")):
        bloc("lecteur", "CM1", titre, "fr-c3-2025", culture.get(cle, []))
    bloc("lecteur", "6e", "Culture littéraire et artistique — entrées de 6e", "fr-c3-2025", culture.get("6e", []))

    precedent = {}
    for classe in ("CM1", "CM2", "6e"):
        exemples = parse_exemples(classe, objectifs)
        for (c, fil), items in objectifs.items():
            if c != classe:
                continue
            anciens = {norm(re.sub(r"\[\[|\]\]", "", t)): t for t in precedent.get(fil, [])}
            groupes, reconduits = {}, []
            for page, t, titre in items:
                if norm(t) in anciens:
                    reconduits.append({"de": precedent_classe[fil], "texte": anciens[norm(t)]})
                else:
                    groupes.setdefault(titre, []).append((page, baliser(t, termes.get(fil, ()))))
            for titre, liste in groupes.items():
                k(fil, classe)["blocs"].append({"titre": f"{titre} — objectifs d'apprentissage", "source": "fr-c3-2025",
                                                "page": liste[0][0], "items": [t for _, t in liste]})
            k(fil, classe)["reconduit"].extend(reconduits)
        for (c, fil), items in exemples.items():
            groupes = {}
            for page, t, titre in items:
                groupes.setdefault(titre, []).append((page, t))
            for titre, liste in groupes.items():
                bloc(fil, classe, f"{titre} — exemples de réussite (Éduscol, à titre indicatif)", SOURCES_EX[classe], liste)
        precedent_classe = {}
        for (c, fil), items in objectifs.items():
            if c == classe:
                blocs = k(fil, classe)["blocs"]
                precedent.setdefault(fil, [])
                precedent[fil] = [t for b in blocs if b["source"] == "fr-c3-2025" and b["titre"].endswith("objectifs d'apprentissage") for t in b["items"]] + \
                                 [r["texte"] for r in k(fil, classe)["reconduit"]]
        precedent_classe = {fil: classe for fil in precedent}
    # Un reconduit doit citer une classe dont la couche le contient : classe précédente du même fil.
    for fil, parClasse in complet.items():
        for c, kk in list(parClasse.items()):
            if not kk["reconduit"]:
                del kk["reconduit"]
            if not kk["blocs"]:
                kk["blocs"] = []
    entete = '"""Français, couche complète, CM1-CM2-6e — GÉNÉRÉ par scripts/gen_fr_c3.py (ne pas modifier à la main)."""\n\n'
    with open(os.path.join(RACINE, "scripts", "saisie", "fr_c3.py"), "w", encoding="utf-8") as f:
        f.write(entete + "INTENTIONS = " + pprint.pformat(intentions, width=140, sort_dicts=False) + "\n\nCOMPLET = "
                + pprint.pformat(complet, width=140, sort_dicts=False) + "\n")
    n = sum(len(b["items"]) for p in complet.values() for kk in p.values() for b in kk["blocs"])
    print(f"{len(complet)} fils, {n} items, {sum(len(b['items']) for b in intentions)} items d'intentions")


if __name__ == "__main__":
    main()
