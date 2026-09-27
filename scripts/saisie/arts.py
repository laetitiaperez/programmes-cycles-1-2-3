"""Enseignements artistiques PS→6e, programmes applicables en 2026-27 :
PS-GS : c1-2026 (« Agir, s'exprimer, comprendre à travers les activités artistiques » : arts visuels, univers sonores,
spectacle vivant) ; CP-CE2 : arts-c2-2020 (arts plastiques, éducation musicale) ;
CM1-6e : arts-c3-2020 (arts plastiques, éducation musicale, histoire des arts).
Repères d'âge du C1 : « avant 4 ans » → PS, « à partir de 4 ans » → MS, « à partir de 5 ans » → GS."""
from commun import E, S, F, D, ecrire

c1, c2, c3 = "c1-2026", "arts-c2-2020", "arts-c3-2020"

peac = D("peac", "Parcours d'éducation artistique et culturelle",
    F("peac", "PEAC et démarche",
        E("PS MS GS", "notion", "L'école maternelle est la [[première étape du parcours d’éducation artistique et culturelle]] ; « éduquer à l'art et par l'art » ; quatre axes : s'engager dans des pratiques, découvrir des formes d'expression artistique, éprouver et exprimer des émotions, entrer dans une [[démarche de création]].", c1, 26),
        E("CP CE1 CE2", "notion", "La sensibilité et l'expression artistiques sont « les moyens et les finalités » ; fondement du [[parcours d’éducation artistique et culturelle]] : trois champs d'action, [[rencontres, pratiques et connaissances]] ; démarche de projet.", c2, 29),
        E("CM1 CM2 6e", "notion", "Pratique plus autonome, analysée ; élaborer des intentions artistiques ; rencontre régulière d'œuvres contemporaines et passées, occidentales et extra-occidentales.", c3, 43),
    ),
)

plastiques = D("plastiques", "Arts visuels / arts plastiques",
    F("dessin-graphisme", "Dessiner, graphisme",
        E("PS", "competence", "S'exercer au [[dessin]] pour développer son habileté motrice (gestes amples, grand format vertical) ; commencer à représenter.", c1, 27),
        E("MS", "competence", "+ Expérimenter outils, supports, matériaux ; dessiner avec une intention de représentation ; [[répertoire graphique]] de la classe.", c1, 27),
        E("GS", "competence", "+ Dessiner d'après un modèle ; œuvre collective ; transformer ou détourner des motifs ; composition sous contraintes.", c1, 28),
        E("GS", "exemple", "Représentations du visage d'après Klee, Modigliani, Schjerfbeck, Vigée-Lebrun ; lignes de Sol LeWitt, Mondrian, cercles de Sonia Delaunay.", c1, 27),
        E("CP CE1 CE2", "competence", "La représentation du monde : utiliser le dessin dans toute sa diversité ; carnet de croquis ; points de vue et cadrages.", c2, 30),
    ),
    F("compositions", "Compositions planes ou en volume, matérialité",
        E("PS", "competence", "Explorer outils, médiums, matériaux ; production plastique en volume.", c1, 29),
        E("MS", "competence", "+ Constituants plastiques (couleurs, formes, matières, rythmes) ; composition en deux ou trois dimensions.", c1, 29),
        E("GS", "competence", "+ Combiner matériaux, techniques et procédés ; détournement d'objets (ready-made).", c1, 29),
        E("PS MS GS", "notion", "Variables plastiques : amorce du « [[SMOG]] » : Support, Médium, Outil, Geste.", c1, 29),
        E("CP CE1 CE2", "competence", "L'[[expression des émotions]] : expérimenter les effets des couleurs, des matériaux, des supports ; principes d'organisation (répétition, alternance, superposition, dispersion, équilibre).", c2, 30),
        E("CM1 CM2 6e", "competence", "Trois questions : [[La représentation plastique et les dispositifs de présentation]] ; [[Les fabrications et la relation entre l’objet et l’espace]] ; [[La matérialité de la production plastique et la sensibilité aux constituants de l’œuvre]].", c3, 44),
        E("CM1 CM2 6e", "notion", "Relation de l'œuvre à un dispositif de présentation (cadre, socle, cimaise), au lieu ([[in situ]]) et au spectateur.", c3, 43),
    ),
    F("images", "Images : regarder, raconter, transformer",
        E("PS", "competence", "Regarder avec attention ; décrire les illustrations d'un album.", c1, 30),
        E("MS", "competence", "+ [[Image fixe]] / [[image animée]] ([[stop-motion]]) ; fabriquer des images à partir d'images existantes.", c1, 30),
        E("GS", "competence", "+ Types d'images (portrait, paysage, [[nature morte]]) ; comparer les illustrations d'un même conte.", c1, 30),
        E("CP CE1 CE2", "competence", "[[La narration et le témoignage par les images]] : raconter, témoigner ; transformer une image ; articuler texte et image.", c2, 31),
    ),
    F("attendus-plastiques", "Attendus, s'exprimer sur l'art",
        E("CP CE1 CE2", "attendu", "[[Réaliser et donner à voir]] des productions plastiques ; proposer des réponses inventives ; coopérer ; s'exprimer sur sa production, celle de ses pairs, sur l'art ; comparer quelques œuvres d'art.", c2, 30),
        E("CP CE1 CE2", "crpe", "« Il ne s’agit pas de reproduire mais d’observer » : les œuvres nourrissent l'exploration ; en arts, on cherche plusieurs solutions, pas une seule.", "", None),
    ),
)

musique = D("musique", "Univers sonores / éducation musicale",
    F("chanter", "Voix et chant",
        E("PS", "attendu", "Dépasser les usages courants de la voix ; dire ou chanter [[au moins cinq comptines]].", c1, 31),
        E("MS", "attendu", "+ Explorer la richesse de sa voix ; chanter une émotion ; au moins huit comptines ou chants.", c1, 31),
        E("GS", "attendu", "+ Trouver sa place dans un collectif chantant ; au moins dix comptines ou chants.", c1, 31),
        E("CP CE1 CE2", "competence", "Chanter une mélodie simple avec une [[intonation juste]] ; interpréter avec expressivité ; registres vocaux (aigu, grave).", c2, 33),
        E("CP CE1 CE2", "repere", "[[six à huit chants]] et six à huit œuvres forment le répertoire de la classe.", c2, 34),
        E("CM1 CM2 6e", "competence", "Chanter et interpréter ; techniques vocales et corporelles au service du sens ; [[projet choral]] ambitieux.", c3, 48),
        E("CM1 CM2 6e", "repere", "Chaque année : un répertoire d'[[au moins quatre chants]] et au moins six œuvres écoutées.", c3, 51),
    ),
    F("ecouter", "Écouter, comparer",
        E("PS", "competence", "Traduire la musique en mouvements ; posture d'écoute.", c1, 33),
        E("MS", "competence", "+ Traduire en mots ; au moins deux œuvres patrimoniales.", c1, 33),
        E("GS", "competence", "+ Traduire en dessin ; au moins trois œuvres musicales patrimoniales.", c1, 33),
        E("MS GS", "exemple", "Le Carnaval des animaux (Saint-Saëns), Pierre et le loup (Prokofiev), La Flûte enchantée (Mozart), Lili Boulanger.", c1, 33),
        E("CP CE1 CE2", "competence", "Décrire et comparer des éléments sonores ; lexique : [[timbre]], [[hauteur]], formes simples, [[intensité]], [[tempo]].", c2, 33),
        E("CM1 CM2 6e", "competence", "Écouter, comparer et commenter ; situer une œuvre dans une aire culturelle et une époque ; argumenter un jugement.", c3, 48),
    ),
    F("creer", "Explorer, créer des sons",
        E("PS MS GS", "competence", "Explorer les sonorités du corps, d'objets, d'instruments ; reproduire un rythme ; en GS, créer un [[paysage sonore]].", c1, 32),
        E("CP CE1 CE2", "competence", "Paramètres du son : intensité, hauteur, timbre, durée ; représentations graphiques ou corporelles ; inventer une organisation simple.", c2, 33),
        E("CM1 CM2 6e", "competence", "Explorer, imaginer et créer : organiser des sons dans le temps ; propositions personnelles.", c3, 48),
    ),
)

spectacle = D("spectacle", "Spectacle vivant et histoire des arts",
    F("spectacle-vivant", "Spectacle vivant (maternelle)",
        E("PS", "competence", "Exprimer ses émotions par le corps ; rôles simples ; découvrir des œuvres adaptées et l'espace scénique.", c1, 34),
        E("MS", "competence", "+ Émotions par le corps et la voix ; rencontrer des artistes.", c1, 34),
        E("GS", "competence", "+ Enchaînements d'émotions ; [[marionnettes]] ; personnages archétypaux ; différents genres (mime, théâtre d'ombres, théâtre d'objets).", c1, 34),
    ),
    F("hda", "Histoire des arts (cycle 3)",
        E("CM1 CM2 6e", "notion", "Enseignement [[pluridisciplinaire et transversal]] ; trois champs d'objectifs : esthétique, méthodologique, de connaissance ; en CM, le professeur des écoles « exerce sa polyvalence ».", c3, 52),
        E("CM1 CM2 6e", "attendu", "Décrire une œuvre (caractéristiques techniques et formelles) ; la situer dans une période et une aire géographique, « au risque de l’erreur » ; exprimer un ressenti ; [[se repérer dans un musée ou un centre d’art]].", c3, 53),
        E("CM1 CM2 6e", "competence", "Quatre compétences : [[identifier]], [[analyser]], [[situer]], se repérer.", c3, 53),
    ),
)

ecrire({
    "id": "arts",
    "nom": "Enseignements artistiques",
    "nomMaternelle": "Agir, s’exprimer, comprendre à travers les activités artistiques",
    "intentions": "Maternelle : arts visuels, univers sonores, spectacle vivant ; première étape du PEAC. Cycles 2 et 3 (programmes 2020, en vigueur dans toutes les classes en 2026-27) : arts plastiques et éducation musicale, auxquels s'ajoute l'[[histoire des arts]] au cycle 3 ; deux grands champs en musique : la [[perception]] et la [[production]] ; en arts plastiques, développer le [[potentiel d’invention]].",
    "domaines": [peac, plastiques, musique, spectacle],
})
