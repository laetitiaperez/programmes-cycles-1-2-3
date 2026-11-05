"""Aides de saisie : construisent les fils et écrivent data/matieres/<id>.json."""
import json, os

ORDRE = ["PS", "MS", "GS", "CP", "CE1", "CE2", "CM1", "CM2", "6e"]


def E(classes, type_, texte, sources, page=None):
    """Une étape. classes : "CP" ou "CP CE1" ; sources : "id" ou "id1 id2"."""
    e = {"classes": classes.split(), "type": type_, "texte": texte, "sources": sources.split() if sources else []}
    if page:
        e["page"] = page
    return e


def S(classes, texte, sources, page=None):
    """Un socle (contenu commun à plusieurs classes, énoncé une fois)."""
    s = {"classes": classes.split(), "texte": texte, "sources": sources.split()}
    if page:
        s["page"] = page
    return s


def B(titre, source, page, *items):
    """Un bloc de la couche complète, sous un intitulé du texte officiel."""
    return {"titre": titre, "source": source, "page": page, "items": list(items)}


def R(de, texte):
    """Un énoncé repris mot pour mot d'une classe antérieure du même fil."""
    return {"de": de, "texte": texte}


def K(*blocs, reconduit=()):
    """La couche complète d'une classe : ses blocs, puis ce qui est reconduit."""
    k = {"blocs": list(blocs)}
    if reconduit:
        k["reconduit"] = list(reconduit)
    return k


def F(id_, nom, *etapes, socle=None, complet=None):
    f = {"id": id_, "nom": nom}
    if socle:
        f["socle"] = socle
    # Tri stable par première classe : l'ordre de saisie est gardé à classe égale,
    # les plages larges (notions communes) saisies en premier restent en tête.
    f["etapes"] = sorted(etapes, key=lambda e: ORDRE.index(e["classes"][0]))
    if complet:
        f["complet"] = {c: complet[c] for c in sorted(complet, key=ORDRE.index)}
    return f


def attacher(matiere, *completes):
    """Ajoute aux fils la couche complète rédigée dans des modules séparés.
    Chaque module fournit {id_fil: {classe: K(...)}} ; deux modules ne décrivent pas la même classe d'un fil."""
    fils = {f["id"]: f for d in matiere["domaines"] for f in d["fils"]}
    for complet in completes:
        for id_fil, parClasse in complet.items():
            f = fils[id_fil]
            dejà = f.setdefault("complet", {})
            for c, k in parClasse.items():
                assert c not in dejà, f"{id_fil} {c} décrit deux fois"
                dejà[c] = k
            f["complet"] = {c: dejà[c] for c in sorted(dejà, key=ORDRE.index)}
    return matiere


def D(id_, nom, *fils):
    return {"id": id_, "nom": nom, "fils": list(fils)}


def ecrire(matiere):
    racine = os.path.join(os.path.dirname(__file__), "..", "..", "data", "matieres")
    with open(os.path.join(racine, matiere["id"] + ".json"), "w") as f:
        json.dump(matiere, f, ensure_ascii=False, indent=1)
        f.write("\n")
    idx_path = os.path.join(racine, "index.json")
    ordre = ["francais", "maths", "hg", "sciences", "emc", "eps", "arts", "lv", "evar", "maternelle"]
    idx = json.load(open(idx_path))
    if matiere["id"] not in idx:
        idx.append(matiere["id"])
    idx.sort(key=ordre.index)
    json.dump(idx, open(idx_path, "w"))
