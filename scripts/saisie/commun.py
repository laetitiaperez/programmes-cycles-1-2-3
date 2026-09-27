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


def F(id_, nom, *etapes, socle=None):
    f = {"id": id_, "nom": nom}
    if socle:
        f["socle"] = socle
    # Tri stable par première classe : l'ordre de saisie est gardé à classe égale,
    # les plages larges (notions communes) saisies en premier restent en tête.
    f["etapes"] = sorted(etapes, key=lambda e: ORDRE.index(e["classes"][0]))
    return f


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
