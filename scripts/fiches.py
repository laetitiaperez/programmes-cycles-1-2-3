"""Génère les fiches HTML (fiches/<id>.html) depuis fiches/src/<id>.md et data/fiches.json.

Markdown pris en charge (volontairement réduit) :
  # Titre, ## Section, ### Sous-section
  paragraphes ; listes « - » et « 1. » ; tableaux « | a | b | » (1re ligne = en-tête) ;
  **gras**, *italique* ; « > texte » = encadré « À retenir » ; « !> texte » = encadré « Piège ».
En tête de fichier, un bloc de métadonnées :
  ---
  titre: Fiche CRPE — Français, cycles 2 et 3
  matiere: francais
  cycles: 2 3
  resume: Une phrase affichée dans la Bibliothèque.
  pdf: fiches/pdf/francais-c2-c3.pdf   (facultatif)
  ---
Usage : python3 scripts/fiches.py
"""
import html
import json
import os
import re

RACINE = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(RACINE, "fiches", "src")


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)
    return t


def cellules(ligne):
    return [c.strip() for c in ligne.strip().strip("|").split("|")]


def convertir(md):
    lignes = md.split("\n")
    out, i = [], 0
    while i < len(lignes):
        l = lignes[i]
        if not l.strip():
            i += 1
            continue
        m = re.match(r"(#{1,3}) (.*)", l)
        if m:
            n = len(m.group(1))
            txt = inline(m.group(2))
            if n == 2:
                ident = re.sub(r"[^a-z0-9]+", "-", m.group(2).lower()).strip("-")
                out.append(f'<h2 id="{ident}">{txt}</h2>')
            else:
                out.append(f"<h{n}>{txt}</h{n}>")
            i += 1
        elif l.startswith("|"):
            bloc = []
            while i < len(lignes) and lignes[i].startswith("|"):
                if not re.match(r"^\|[\s:|-]+\|$", lignes[i].strip()):
                    bloc.append(cellules(lignes[i]))
                i += 1
            tete, corps = bloc[0], bloc[1:]
            th = "".join(f"<th>{inline(c)}</th>" for c in tete)
            trs = "".join("<tr>" + "".join(
                (f'<th scope="row">{inline(c)}</th>' if j == 0 else f"<td>{inline(c)}</td>")
                for j, c in enumerate(r)) + "</tr>" for r in corps)
            out.append(f'<div class="tableau"><table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>')
        elif re.match(r"(- |\d+\. )", l):
            ordonnee = bool(re.match(r"\d+\. ", l))
            items = []
            while i < len(lignes) and re.match(r"(- |\d+\. )", lignes[i]):
                items.append(inline(re.sub(r"^(- |\d+\. )", "", lignes[i])))
                i += 1
            tag = "ol" if ordonnee else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{x}</li>" for x in items) + f"</{tag}>")
        elif l.startswith(">") or l.startswith("!>"):
            piege = l.startswith("!>")
            bloc = []
            while i < len(lignes) and (lignes[i].startswith(">") or lignes[i].startswith("!>")):
                bloc.append(re.sub(r"^!?> ?", "", lignes[i]))
                i += 1
            classe, titre = ("piege", "Piège") if piege else ("retenir", "À retenir")
            out.append(f'<aside class="{classe}"><strong>{titre}</strong> ' + " ".join(inline(b) for b in bloc) + "</aside>")
        else:
            bloc = []
            while i < len(lignes) and lignes[i].strip() and not re.match(r"(#|\||- |\d+\. |>|!>)", lignes[i]):
                bloc.append(lignes[i].strip())
                i += 1
            out.append("<p>" + inline(" ".join(bloc)) + "</p>")
    return "\n".join(out)


PAGE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre_court}</title>
<meta name="description" content="{resume}">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="fiche.css">
<script>try {{ const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; }} catch (e) {{}}</script>
</head>
<body class="fiche">
<header class="fiche-barre">
  <a class="retour" href="../#vue=biblio">← Bibliothèque</a>
  {lien_pdf}
</header>
<main class="fiche-contenu">
{sommaire}
{corps}
</main>
</body>
</html>
"""


def construire():
    fiches = []
    for nom in sorted(os.listdir(SRC)):
        if not nom.endswith(".md"):
            continue
        ident = nom[:-3]
        brut = open(os.path.join(SRC, nom), encoding="utf-8").read()
        m = re.match(r"---\n(.*?)\n---\n", brut, re.S)
        meta = dict(l.split(": ", 1) for l in m.group(1).split("\n"))
        corps = convertir(brut[m.end():])
        titres = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', corps)
        sommaire = ('<nav class="sommaire" aria-label="Sommaire"><details><summary>Sommaire</summary><ol>'
                    + "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in titres) + "</ol></details></nav>") if titres else ""
        pdf = meta.get("pdf")
        lien_pdf = f'<a class="pdf" href="../{pdf}" download>PDF</a>' if pdf else ""
        titre_court = meta["titre"].replace("Fiche CRPE — ", "Fiche ")
        page = PAGE.format(titre_court=html.escape(titre_court), resume=html.escape(meta["resume"]),
                           lien_pdf=lien_pdf, sommaire=sommaire, corps=corps)
        open(os.path.join(RACINE, "fiches", ident + ".html"), "w", encoding="utf-8").write(page)
        fiches.append({"id": ident, "titre": meta["titre"], "matiere": meta["matiere"],
                       "cycles": [int(c) for c in meta["cycles"].split()], "resume": meta["resume"],
                       "html": f"fiches/{ident}.html", **({"pdf": pdf} if pdf else {})})
    ordre = ["maternelle", "francais", "maths", "hg", "sciences", "emc", "eps", "arts", "lv", "evar"]
    fiches.sort(key=lambda f: (ordre.index(f["matiere"]) if f["matiere"] in ordre else 99, f["id"]))
    with open(os.path.join(RACINE, "data", "fiches.json"), "w", encoding="utf-8") as f:
        json.dump(fiches, f, ensure_ascii=False, indent=1)
    print(f"{len(fiches)} fiches générées.")


if __name__ == "__main__":
    construire()
