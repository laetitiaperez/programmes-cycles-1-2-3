"""École maternelle : principes transversaux du cycle 1 (préambule du programme consolidé, c1-2026, p. 3-6).
Valables pour PS, MS et GS ; les domaines disciplinaires sont rattachés aux matières de l'élémentaire."""
from commun import E, S, F, D, ecrire

c1 = "c1-2026"
M = "PS MS GS"

ecole = D("ecole", "Une école ambitieuse et adaptée",
    F("ambition", "Principes et missions",
        E(M, "notion", "Principe majeur : « [[tous les enfants sont capables d'apprendre et de progresser]] » ; premier jalon du parcours de l'élève ; donner envie d'aller à l'école ; confiance dans son propre pouvoir d'agir et de penser.", c1, 3),
        E(M, "notion", "La classe, [[communauté d’apprentissage]] ; l'enfant devient élève progressivement sur le cycle ; dimension inclusive ; égalité filles-garçons ; [[compétences psychosociales]].", c1, 3),
        E(M, "notion", "Tenir compte du développement de l'enfant (rythmes très variables) ; l'accueil, les récréations, le repos et l'hygiène sont des [[temps d’éducation à part entière]].", c1, 3),
    ),
    F("partenaires", "Familles et transitions",
        E(M, "notion", "Dialogue régulier et constructif avec les parents ; rôle des [[ATSEM]] et des [[AESH]] ; expliquer la place du langage, du corps et du jeu (y compris le jeu libre) ; attention à la séparation, surtout la première année.", c1, 3),
        E(M, "notion", "Une école qui accompagne les transitions : passerelles famille-école, temps scolaire et périscolaire ; concertation avec le cycle 2 pour une [[continuité des apprentissages]].", c1, 4),
    ),
)

apprendre = D("apprendre", "Modalités spécifiques d'apprentissage",
    F("modalites", "Quatre manières d'apprendre",
        E(M, "competence", "[[Apprendre en jouant]] : jeu symbolique, d'exploration, de construction et de manipulation, d'imitation, collectif et de société ; les jeux proposés sont structurés et visent des apprentissages spécifiques.", c1, 4),
        E(M, "competence", "[[Apprendre en réfléchissant et en résolvant des problèmes concrets]] : tâtonnements, essais, erreurs, échanges entre élèves.", c1, 4),
        E(M, "competence", "[[Apprendre en s’exerçant]] : progrès rarement linéaires ; répétitions dans des conditions variées ; pour les plus grands, entrainement voire automatisation, en expliquant l'objectif.", c1, 4),
        E(M, "competence", "[[Apprendre en mémorisant]] : langue riche, adaptée et explicite ; temps d'évocation ; comptines, chansons, poésies, récits.", c1, 5),
        E(M, "notion", "Situations structurées autour d'objectifs précis ; observation et imitation ; projets ; diversifier les exercices « en [[limitant le recours aux fiches]] ».", c1, 4),
    ),
)

ensemble = D("ensemble", "Apprendre et vivre ensemble, évaluer",
    F("vivre-ensemble", "Vivre ensemble et devenir élève",
        E(M, "notion", "Enjeu central : « [[Apprendre ensemble et vivre ensemble]] » ; repérer les rôles des adultes et la fonction des espaces ; fondements de la coopération et du débat.", c1, 5),
        E(M, "notion", "[[Se construire comme personne singulière au sein d’un groupe]] : règles présentées et justifiées, puis élaborées collectivement ; empathie, juste et injuste ; verbaliser et réguler ses émotions ; [[estime de soi]].", c1, 5),
    ),
    F("evaluation", "Évaluation positive",
        E(M, "notion", "[[évaluation positive]] : observation attentive de ce que dit et fait l'élève et interprétation de ses progrès ; elle « n’est pas un instrument de prédiction ni de sélection » ; progrès par rapport à lui-même ; critères de réussite partagés ; progression rendue explicite aux parents.", c1, 5),
    ),
)

domaines = D("domaines", "Les six domaines d'apprentissage",
    F("six-domaines", "Organisation du programme",
        E(M, "notion", "Six domaines, à ne pas considérer indépendamment : développement et structuration du langage (place primordiale) ; activités physiques ; activités artistiques ; premiers outils mathématiques ; se repérer dans le temps et l'espace ; découvrir le monde du vivant, des objets et de la matière.", c1, 6),
        E(M, "notion", "Objectifs et exemples de réussite déclinés par âge ; les exemples « ne sont pas exhaustifs » ; « À ces six domaines s’ajoute » le programme d'EVAR de maternelle.", c1, 6),
        E(M, "crpe", "Sur ce site, chaque domaine est rattaché à sa matière de l'élémentaire (Français, Mathématiques, EPS, Arts, Histoire-géographie, Sciences, EVAR) : les fils démarrent en PS.", "", None),
    ),
)

ecrire({
    "id": "maternelle",
    "nom": "École maternelle — principes",
    "nomMaternelle": "Préambule du programme du cycle 1",
    "intentions": "Une première école ambitieuse, attentive au développement, aux besoins et au bien-être des jeunes enfants. Principes transversaux : adaptation aux rythmes de chacun, relation avec les familles, modalités spécifiques d'apprentissage (jouer, réfléchir, s'exercer, mémoriser), apprendre et vivre ensemble, [[évaluation positive]].",
    "domaines": [ecole, apprendre, ensemble, domaines],
})
