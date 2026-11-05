"""Principes des cycles (carte par cycle) : couche 1 saisie ici, couche 2 générée (cycles_complet.py).
Chaque idée-force renvoie au bloc (index) de la couche 2 qui la développe ; les termes [[…]] figurent mot pour mot
dans la source. Écrit data/cycles.json. Usage : python3 scripts/saisie/cycles.py"""
import json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
from cycles_complet import COMPLETS


def I(bloc, texte):
    return {"texte": texte, "bloc": bloc}


CYCLES = [
    {"id": 1, "nom": "Cycle des apprentissages premiers", "classes": ["PS", "MS", "GS"], "source": "c1-2026", "idees": [
        I(0, "Une première école ambitieuse, fondée sur un principe majeur : [[tous les enfants sont capables d'apprendre et de progresser]] ; la classe, [[communauté d’apprentissage]]."),
        I(1, "Une école qui s’adapte aux besoins et aux [[rythmes de développement]] de chaque élève : accueil des enfants et de leurs parents, prise en compte du développement de l’enfant, accompagnement des transitions."),
        I(5, "Une école qui organise des [[modalités spécifiques d’apprentissage]] : apprendre en jouant, en réfléchissant et en résolvant des problèmes concrets, en s’exerçant, en mémorisant."),
        I(10, "Un enjeu de formation central : « [[Apprendre ensemble et vivre ensemble]] »."),
        I(11, "Accompagner l’enfant à devenir élève et à identifier ses progrès : une [[évaluation positive]]."),
        I(12, "Se construire comme personne singulière au sein d’un groupe ; développer des [[compétences psychosociales]]."),
        I(13, "[[Six domaines d’apprentissage]], à ne pas considérer indépendamment les uns des autres ; la [[place primordiale du langage]]."),
    ]},
    {"id": 2, "nom": "Cycle des apprentissages fondamentaux", "classes": ["CP", "CE1", "CE2"], "source": "volet1-c2-2020", "idees": [
        I(0, "Tous les enseignements interrogent le monde ; la maîtrise des langages, et notamment de la [[langue française]], est centrale."),
        I(1, "Priorité à l’acquisition des [[savoirs fondamentaux]] (lire, écrire, compter, respecter autrui) ; un enseignement [[structuré et explicite]]."),
        I(2, "Le [[sens]] et l’[[automatisation]] se construisent simultanément."),
        I(3, "La langue française, [[objet d’apprentissage central]] ; la [[lecture fluide]] doit être acquise au CP."),
        I(4, "On articule le [[concret et l’abstrait]] : observer, manipuler, expérimenter mènent à la représentation."),
        I(5, "L’oral et l’écrit sont en [[décalage important]]."),
        I(6, "Les [[connaissances intuitives]] tiennent encore une place centrale."),
        I(7, "On apprend à réaliser les [[activités scolaires fondamentales]] : résoudre un problème, lire et comprendre un document, rédiger un texte, créer ou concevoir un objet."),
        I(8, "On apprend à [[justifier de façon rationnelle]] ; l’[[éducation aux médias et à l’information]] prépare l’exercice du jugement."),
    ]},
    {"id": 3, "nom": "Cycle de consolidation", "classes": ["CM1", "CM2", "6e"], "source": "volet1-c3-2023", "idees": [
        I(0, "Une double responsabilité : [[consolider l’acquisition des savoirs fondamentaux]] et permettre une meilleure [[transition entre l’école primaire et le collège]]."),
        I(0, "La [[classe de 6e]] occupe une place particulière : adaptation au collège, continuité avec le CM1 et le CM2."),
        I(1, "Stabiliser et affermir les apprentissages fondamentaux du cycle 2 ; la [[maîtrise de la langue]] reste un objectif central."),
        I(1, "Langages scientifiques : nombres entiers, [[fractions]] et [[nombres décimaux]], au service de la résolution de problèmes."),
        I(1, "Arts : de l’expression à l’investigation de la création ; introduction d’un enseignement d’[[histoire des arts]]."),
        I(1, "Raisonner sur la langue et sur ses méthodes : [[capacités métacognitives]], autonomie dans le travail personnel."),
        I(1, "Entrée dans les différents [[champs disciplinaires]] : histoire, géographie, sciences et technologie."),
        I(1, "Une réflexion plus abstraite ; l’[[esprit critique]] et l’[[autonomie de la pensée]]."),
    ]},
]

if __name__ == "__main__":
    for c in CYCLES:
        c["complet"] = {"blocs": COMPLETS[c["id"]]}
    chemin = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cycles.json")
    with open(chemin, "w", encoding="utf-8") as f:
        json.dump(CYCLES, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{chemin} : {len(CYCLES)} cycles")
