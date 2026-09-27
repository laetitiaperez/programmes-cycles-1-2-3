"""Éducation physique et sportive PS→6e, programmes applicables en 2026-27 :
PS-GS : c1-2026 (« Agir, s'exprimer, comprendre à travers les activités physiques ») ; CP : eps-c2-2026 ;
CE1-CE2 : eps-c2-2020 ; CM1 : eps-c3-2026 (partie « cours moyen ») ; CM2-6e : eps-c3-2020.
Les quatre domaines de motricité (2026) correspondent aux quatre champs d'apprentissage (2020).
Repères d'âge du C1 : « avant 4 ans » → PS, « à partir de 4 ans » → MS, « à partir de 5 ans » → GS."""
from commun import E, S, F, D, ecrire

c1, cp, c2, cm1, c3 = "c1-2026", "eps-c2-2026", "eps-c2-2020", "eps-c3-2026", "eps-c3-2020"

cadre = D("cadre", "Cadre et finalités",
    F("organisation", "Organisation, horaires, savoirs fondamentaux",
        E("PS MS GS", "repere", "Éducation physique [[quotidienne]], d'une durée effective de [[trente à quarante-cinq minutes]] ; au minimum six à huit séances par activité ; quatre sous-domaines : se déplacer, construire des équilibres, s'exprimer avec son corps, s'opposer.", c1, 21),
        E("CP", "repere", "[[108 heures]] d'EPS annuelle ; [[savoirs sportifs fondamentaux]] : [[savoir nager]] et [[savoir rouler à vélo]] ; quatre domaines « passage obligé » ; deux degrés d'acquisition (CP, cours élémentaire) ; exemples de réussite indicatifs.", cp, 2),
        E("CE1 CE2", "notion", "Programme 2020 : cinq compétences générales et quatre [[champs d’apprentissage]] (performance, déplacements en environnements variés, prestation artistique et/ou acrobatique, affrontement) ; [[APSA]] ; « une attention particulière est portée au savoir nager ».", c2, 35),
        E("CM1", "repere", "Mêmes quatre domaines que le cycle 2 (108 heures, savoir nager, savoir rouler à vélo) ; « consolidation des acquisitions » ; la 6e est traitée à part (préparation du cycle 4).", cm1, 2),
        E("CM2 6e", "attendu", "Valider l'[[attestation scolaire du savoir nager]] (ASSN), conformément à l'arrêté du 9 juillet 2015.", c3, 58),
        E("CP", "notion", "Objectifs de l'EPS : développer sa motricité ; renforcer son « [[capital santé]] » ; culture physique, sportive et artistique ; partager des règles et des rôles ; méthodes et outils de mesure ; école inclusive ; égalité filles-garçons.", cp, 2),
    ),
)

deplacer = D("deplacer", "Se déplacer : courir, sauter, lancer, s'orienter",
    F("courir-sauter-lancer", "Courir, sauter, lancer",
        E("PS", "competence", "Manipuler et lancer des objets ; courir de manière variée ; sauter sans élan un obstacle.", c1, 22),
        E("MS", "competence", "+ Lancer loin ; courir vite en ligne droite ; sauter sans élan plusieurs obstacles.", c1, 22),
        E("GS", "competence", "+ Lancer loin et avec précision ; courir de plus en plus longtemps ; courir puis sauter haut ou loin après une impulsion sur un pied.", c1, 22),
        E("CP", "competence", "Courir vite de façon équilibrée (signaux de départ) ; courir et franchir des obstacles horizontaux ; courir longtemps (« [[contrats de course]] ») ; varier les impulsions ; lancer loin de manière variée.", cp, 5),
        E("CE1 CE2", "attendu", "[[Courir, sauter, lancer à des intensités et des durées variables]] ; différencier courir vite / courir longtemps, lancer loin / lancer précis, sauter haut / sauter loin ; viser une performance mesurée ; activités athlétiques aménagées.", c2, 36),
        E("CM1", "competence", "Courir vite du départ jusqu'à l'arrivée ; se relayer ; franchir obstacles horizontaux et verticaux ; [[course d’élan réduite]] et impulsion sur le [[pied d’appel]].", cm1, 3),
        E("CM2 6e", "attendu", "Aller plus vite, plus longtemps, plus haut, plus loin ; combiner course, saut, lancer pour la meilleure [[performance cumulée]] ; mesurer, enregistrer, représenter les performances ; rôles de chronométreur et d'observateur.", c3, 57),
    ),
    F("orientation", "S'orienter et mesurer ses résultats",
        E("PS MS GS", "competence", "Se situer dans un espace proche puis élargi grâce à des indices (éléments remarquables sur des photographies).", c1, 22),
        E("CP", "competence", "Repérer des éléments visibles sur un plan ; trouver une balise ; explorer des outils de mesure concrets.", cp, 6),
        E("CE1 CE2", "competence", "Activités d'orientation dans des espaces de plus en plus vastes et de moins en moins connus, avec des codes de plus en plus symboliques.", c2, 37),
        E("CM1", "competence", "S'orienter dans un espace partiellement connu ; mesurer avec précision une action motrice sans porter de jugement de valeur.", cm1, 3),
    ),
)

equilibres = D("equilibres", "Construire des équilibres, environnements inhabituels",
    F("equilibres", "Équilibres terrestres et engins",
        E("PS", "competence", "Nouveaux équilibres : tourner, grimper, se déplacer à quatre pattes ; tricycle, draisienne.", c1, 23),
        E("MS", "competence", "+ Marcher à reculons, se suspendre ; échasses, patins, vélo ; comprendre l'intérêt des règles de sécurité.", c1, 23),
        E("GS", "competence", "+ Combiner des actions (sauter puis quadrupédie, se suspendre, se lâcher) ; vélo à deux roues, skis ; parade.", c1, 23),
        E("CP", "competence", "Roulade avant ; saut corps droit ; renversement (quadrupédie) ; équilibre sur un banc ; grimper (moins de trois mètres) ; rouler et glisser en ligne droite (vélo, roller).", cp, 9),
        E("CE1 CE2", "attendu", "[[Réaliser un parcours en adaptant ses déplacements à un environnement inhabituel]] ; roule et glisse, escalade, randonnée ; reconnaître une situation à risque.", c2, 37),
        E("CM1", "competence", "Roulade arrière ; position renversée ; corps suspendu ; circuler, glisser seul et en groupe avec un moyen de locomotion.", cm1, 4),
        E("CM2 6e", "attendu", "Parcours dans plusieurs environnements inhabituels ; règles de sécurité ; identifier la personne à alerter.", c3, 58),
    ),
    F("aquatique", "Milieu aquatique : vers le savoir nager",
        E("PS MS GS", "notion", "Découverte du milieu aquatique et [[aisance aquatique]] visées avant l'âge de 7 ans (note de service du 28-2-2022).", c1, 23),
        E("GS", "competence", "Entrer et sortir seul de l'eau, se déplacer les épaules immergées, immerger la tête plusieurs secondes.", c1, 23),
        E("CP", "competence", "Explorer le milieu aquatique : entrer et sortir seul, s'éloigner du bord, mettre la tête sous l'eau en bloquant sa respiration.", cp, 10),
        E("CE1 CE2", "attendu", "[[Se déplacer dans l’eau sur une quinzaine de mètres sans appui et après un temps d’immersion]].", c2, 37),
        E("CE1 CE2", "repere", "Passer d'un [[équilibre vertical]] à un [[équilibre horizontal]] de nageur, d'une respiration réflexe à une respiration adaptée, d'une propulsion par les jambes à une propulsion par les bras.", c2, 37),
        E("CM1", "competence", "Accepter le déséquilibre et se déplacer grâce à un nouvel équilibre horizontal.", cm1, 4),
        E("CM2 6e", "attendu", "Valider l'attestation scolaire du savoir nager ; la natation, dans la mesure du possible, chaque année du cycle.", c3, 58),
    ),
)

exprimer = D("exprimer", "S'exprimer avec son corps",
    F("danse-cirque", "Danse, gymnastique, arts du cirque",
        E("PS", "competence", "Explorer le mouvement comme vecteur d'expression ; rondes et jeux chantés ; mimer.", c1, 24),
        E("MS", "competence", "+ Geste dansé ; [[espace scénique]] ; posture de spectateur actif.", c1, 24),
        E("GS", "competence", "+ Arts du cirque ; danser seul ou à plusieurs, en miroir, en contact ; chorégraphie simple (entrée, développement, fin) ; conseiller un camarade.", c1, 24),
        E("CP", "competence", "Explorer des actions à visée artistique et l'espace scénique ; reproduire un enchaînement ; explorer la [[posture d’artiste]] ; apprécier une prestation avec un vocabulaire approprié.", cp, 13),
        E("CE1 CE2", "attendu", "[[Mobiliser le pouvoir expressif du corps]] ; mémoriser des pas, figures, enchaînements ; danses collectives, danse de création, activités gymniques, arts du cirque.", c2, 37),
        E("CE1 CE2", "repere", "Passer progressivement de l'exécutant à la composition et à la chorégraphie simple.", c2, 38),
        E("CM1", "competence", "Enrichir ses actions à visée artistique ; enchaînement fluide et mémorisé ; se présenter en tant qu'artiste ; apprécier une prestation et donner des conseils.", cm1, 5),
        E("CM2 6e", "attendu", "Deux séquences en petits groupes : une [[à visée acrobatique destinée à être jugée]], une à visée artistique destinée à être appréciée ; filmer pour faire évoluer.", c3, 59),
    ),
)

opposer = D("opposer", "Coopérer et s'opposer",
    F("jeux", "Jeux collectifs, jeux de combat et de raquette",
        E("PS", "competence", "Comprendre un rôle dans les jeux les plus simples ; poursuivre, esquiver.", c1, 25),
        E("PS", "exemple", "Les déménageurs ; Minuit dans la bergerie ; Le chat et la souris.", c1, 25),
        E("MS", "competence", "+ Jouer en coopérant ; rôles d'[[attaquant]] et de [[défenseur]] ; accepter la défaite.", c1, 25),
        E("GS", "competence", "+ Élaborer des stratégies ; rôle d'[[arbitre]] ; jeux d'opposition avec contacts (sortir son adversaire d'une zone).", c1, 25),
        E("CP", "competence", "Actions d'opposition simples (courir, s'arrêter, lancer, attraper ; pousser, tirer) ; différencier « jouer avec » et « jouer contre » ; explorer les règles ; maîtriser ses émotions.", cp, 16),
        E("CE1 CE2", "attendu", "[[S’engager dans un affrontement individuel ou collectif en respectant les règles du jeu]] ; connaître le but du jeu ; reconnaître partenaires et adversaires ; jeux traditionnels, jeux pré-sportifs, jeux de lutte, jeux de raquettes.", c2, 38),
        E("CM1", "competence", "Coordonner plusieurs actions d'opposition ; orienter ses déplacements vers la cible ; mener un projet d'action ; faire respecter les règles.", cm1, 6),
        E("CM2 6e", "attendu", "S'organiser tactiquement pour gagner ; identifier les situations favorables de marque ; rôles sociaux (joueur, arbitre, observateur) ; accepter le résultat.", c3, 59),
        E("CE1 CE2 CM2 6e", "repere", "[[Réversibilité]] des situations : comprendre qu'il faut attaquer tout en se défendant.", f"{c2} {c3}", 38),
    ),
)

ecrire({
    "id": "eps",
    "nom": "Éducation physique et sportive",
    "nomMaternelle": "Agir, s’exprimer, comprendre à travers les activités physiques",
    "intentions": "Maternelle : développement moteur, sensoriel, affectif, cognitif et relationnel ; un [[répertoire moteur de base]] ; égalité filles-garçons. Élémentaire (programmes 2026) : discipline fondamentale ; quatre domaines complémentaires de la motricité : se déplacer pour agir dans l'espace et sur une durée ; construire des équilibres pour s'adapter à des environnements inhabituels ; s'exprimer avec son corps pour éprouver et partager des émotions ; coopérer et s'opposer pour apprendre à jouer en respectant les règles et les autres. Programme 2020 (CE1-CE2, CM2-6e) : former « un citoyen lucide, autonome, physiquement et socialement éduqué ».",
    "domaines": [cadre, deplacer, equilibres, exprimer, opposer],
})
