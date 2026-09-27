"""Langues vivantes (étrangères ou régionales) PS→6e, programmes applicables en 2026-27 :
PS-GS : c1-2024 (« S'éveiller à la diversité linguistique », domaine du langage) ; CP : lv-c2-2026 ;
CE1-CE2 : lv-c2-2020 ; CM1 : lv-c3-2026 ; CM2 : lv-c3-2020 ; 6e : lve-6e-2025 (anglais) et lvr-6e-2026
(langues régionales, cadre commun). Les niveaux du CECRL sont des mots-clés."""
from commun import E, S, F, D, ecrire

c1, cp, c2, cm1, c3, ang, lvr = "c1-2024", "lv-c2-2026", "lv-c2-2020", "lv-c3-2026", "lv-c3-2020", "lve-6e-2025", "lvr-6e-2026"

cadre = D("cadre", "Cadre : niveaux, horaires, démarche",
    F("niveaux", "Niveaux du CECRL visés",
        E("PS MS GS", "notion", "Pas d'apprentissage structuré : [[éveil à la diversité linguistique]] (langues régionales, étrangères, parlées dans les familles, [[langue des signes française]]) ; séances d'exposition « sur des temps courts et variés ».", c1, 15),
        E("CP", "repere", "[[Pré-A1 pour les activités orales]] (parcours renforcés : pré-A1 pour les activités orales et la médiation) ; langue obligatoire commencée au CP.", cp, 2),
        E("CE1 CE2", "repere", "Programme 2020 : enseignement correspondant au [[niveau A1]] à l'oral du [[CECRL]] ; « [[La langue orale est la priorité]] ».", c2, 22),
        E("CM1", "repere", "[[A1 pour toutes les activités langagières]] ; A1+ possible (parcours renforcés, bilingues, [[EMILE]]).", cm1, 2),
        E("CM2", "repere", "Au moins le niveau A1 dans les [[cinq activités langagières]] ; A2 atteignable ; A1 et A2 : « [[niveau de l'utilisateur élémentaire]] ».", c3, 33),
        E("6e", "repere", "[[LVA]] (langue apprise dès le primaire) : [[A1+]] ; [[LVB]] (bilangue) : A1. Langues régionales : A1+ si déjà pratiquée dès le primaire, A1 en enseignement facultatif.", f"{ang} {lvr}", 6),
        E("CP", "crpe", "Échelle à retenir : pré-A1 (CP) → A1 visé en fin de CM2 → A1+ en 6e (LVA) → A2 fin de 5e → B1 fin de 3e (LVA).", "", None),
    ),
    F("horaires-demarche", "Horaires et démarche",
        E("CP", "repere", "[[54 heures annuelles]], soit 90 minutes par semaine ; séances régulières de 20 à 30 minutes ; exemples surtout en anglais, transposables aux autres langues.", cp, 3),
        E("CP", "notion", "[[perspective actionnelle]] : projet pédagogique, lien « entre le dire et le faire » ; critères d'évaluation explicites, autoévaluation, évaluation entre pairs ; approches plurilingues et interculturelles.", cp, 3),
        E("CE1 CE2", "notion", "Comportements à développer : [[curiosité, écoute, attention, mémorisation, confiance en soi]] ; répétition, régularité, [[ritualisation]] ; « Le travail sur la langue est indissociable de celui sur la culture ».", c2, 22),
        E("CM1", "repere", "[[90 minutes hebdomadaires]] ; articulation des activités langagières, en réception et production, à l'oral et à l'écrit.", cm1, 3),
        E("CM2", "notion", "« C’est l’exposition régulière et quotidienne à la langue qui favorise les progrès des élèves » ; début de réflexion sur le fonctionnement de la langue.", c3, 33),
        E("6e", "notion", "Six activités langagières : compréhension de l'oral, de l'écrit, expression orale en continu, expression écrite, interaction, [[médiation]] ; place plus importante de l'écrit.", ang, 2),
    ),
)

eveil = D("eveil", "Maternelle : éveil à la diversité linguistique",
    F("eveil", "S'éveiller à la diversité linguistique",
        E("PS MS GS", "competence", "Découvrir que la communication peut passer par d'autres langues ; jouer avec le matériau sonore ; [[habiletés phonologiques]] (musicalité, intonation, accentuation, rythme, prononciation) ; mémoriser un lexique simple et usuel.", c1, 15),
        E("PS MS GS", "notion", "Valoriser la langue d'origine des élèves ; « le multilinguisme est une richesse » ; démarche comparative.", c1, 15),
        E("PS MS GS", "exemple", "Une même comptine en français et dans une autre langue ; un [[imagier bilingue]] ; cartes-images, jeux, albums, chants.", c1, 15),
    ),
)

oral = D("oral", "Comprendre et parler",
    F("comprendre-oral", "Compréhension de l'oral (CO)",
        E("CP", "attendu", "[[Comprendre quelques mots familiers et expressions très courantes]] : consignes, jours, dates, nombres, prix, prononcés clairement et lentement ; suivre le fil d'une histoire ; comprendre et agir.", cp, 4),
        E("CP", "exemple", "Formules d'accueil (Hello! Goodbye!) avec la mascotte ; comptine « 1, 2, buckle my shoe » : l'élève montre les nombres avec ses doigts ; jeu de la boite-déjeuner.", cp, 5),
        E("CE1 CE2", "attendu", "Comprendre des mots familiers et des expressions très courantes au sujet de soi, de sa famille et de l'environnement concret et immédiat, si les gens parlent lentement et distinctement.", c2, 23),
        E("CE1 CE2", "repere", "CE1 : une dizaine de consignes, 3 ou 4 instructions relatives aux gestes ; CE2 : suivre le fil d'une histoire simple (comptines, chansons, albums).", c2, 24),
        E("CM1", "attendu", "[[Suivre le fil d’une histoire simple]] ; comprendre un message oral court sur un sujet familier ou d'actualité ; comprendre et agir ; associer un document oral à un visuel.", cm1, 4),
        E("CM2", "attendu", "A1 : comprendre des mots familiers et des expressions très courantes ; A2 : comprendre une intervention brève si elle est claire et simple ; utiliser les [[indices extralinguistiques]].", c3, 34),
    ),
    F("parler-continu", "Expression orale en continu (EOC)",
        E("CP", "attendu", "[[Repères phonologiques]] : prononcer un répertoire de quelques mots ; [[Reproduire un modèle oral]] court ; raconter une partie d'histoire avec des images et des expressions toutes faites ; se décrire.", cp, 12),
        E("CE1 CE2", "attendu", "Utiliser des expressions et des phrases simples pour se décrire, décrire le lieu d'habitation et les gens de l'entourage ; « [[L’intelligibilité prend le pas sur la correction formelle]] ».", c2, 24),
        E("CE1 CE2", "repere", "CE1 : se présenter (nom, prénom, âge, lieu d'habitation) ; CE2 : reproduire la date, lire à haute voix des textes brefs, raconter une histoire courte à partir d'images.", c2, 25),
        E("CM1", "attendu", "Prononcer de manière compréhensible ; lire à haute voix un texte bref préparé ; [[Se présenter oralement et exprimer ses gouts, présenter les autres]] ; raconter ; décrire son environnement quotidien.", cm1, 7),
        E("CM2", "competence", "Parler en continu : mémoriser et reproduire des énoncés ; s'exprimer de manière audible, en modulant débit et voix.", c3, 33),
    ),
    F("interaction", "Expression orale en interaction (EOI)",
        E("CP", "attendu", "Saluer et se présenter ; poser des questions très simples ; exprimer ses émotions (gestes, mimiques) et des souhaits élémentaires ; signifier son incompréhension.", cp, 18),
        E("CE1 CE2", "attendu", "Poser des questions simples sur des sujets familiers ou sur ce dont on a immédiatement besoin, et y répondre ; saluer, se présenter, formules de politesse, épeler.", c2, 25),
        E("CE1 CE2", "notion", "Le dialogue est plus difficile à mettre en œuvre que l'expression en continu ; il ne fait pas l'objet d'évaluations formelles.", c2, 25),
        E("CM1", "attendu", "Échanger des informations (nouvelles, formules de politesse, questions ritualisées) ; exprimer ses émotions ou ses souhaits et réagir ; établir un contact.", cm1, 10),
        E("CM2", "competence", "Réagir et dialoguer : poser des questions simples ; utiliser des procédés très simples pour commencer, poursuivre et terminer une conversation brève.", c3, 34),
    ),
)

ecrit = D("ecrit", "Lire et écrire",
    F("lire", "Compréhension de l'écrit (CE)",
        E("CE1 CE2", "notion", "Un premier contact avec l'écrit peut s'envisager lorsque les situations langagières le justifient.", c2, 22),
        E("CM1", "attendu", "[[Comprendre des textes courts et simples]] : repérer des mots isolés ; comprendre messages, courriels, annonces, courts récits illustrés ; identifier la trame narrative.", cm1, 13),
        E("CM2", "competence", "Lire et comprendre : utiliser le contexte et les illustrations ; reconnaître des mots isolés ; percevoir la relation entre certains [[graphèmes et phonèmes]] spécifiques à la langue.", c3, 33),
    ),
    F("ecrire", "Expression écrite (EE)",
        E("CM1", "attendu", "[[Épeler, copier ou écrire sous la dictée des éléments connus]] ; raconter ; écrire des phrases en s'appuyant sur une trame connue ; écrire pour décrire ou informer.", cm1, 16),
        E("CM2", "competence", "Écrire des mots et des expressions dont l'orthographe et la syntaxe ont été mémorisées ; mobiliser des structures simples en s'appuyant sur une trame connue.", c3, 34),
    ),
)

culture = D("culture", "Culture et médiation",
    F("mediation", "Médiation (M) et repères culturels",
        E("CP", "attendu", "[[Identifier les repères culturels]] : indiquer par des gestes simples des besoins élémentaires ; animer un travail collectif, coopérer et contribuer à des échanges interculturels.", cp, 29),
        E("CE1 CE2", "competence", "Découvrir quelques aspects culturels : identifier quelques grands repères culturels de l'environnement quotidien des élèves du même âge dans les pays ou régions étudiés.", c2, 22),
        E("CM1", "attendu", "Identifier une similitude ou une différence culturelle ; expliciter un message pour autrui ; prendre des notes ; participer à un travail collectif.", cm1, 18),
        E("CM2", "competence", "Mobiliser ses connaissances culturelles pour décrire ou raconter des personnages réels ou imaginaires.", c3, 34),
    ),
    F("themes", "Thématiques culturelles",
        E("CP", "notion", "[[ancrage culturel]] intensifié chaque année : albums, comptines, fêtes, spécialités culinaires ; thématiques autour de l'enfant et de son univers quotidien.", cp, 2),
        E("CE1 CE2", "notion", "Trois thématiques : [[L’enfant]], [[La classe]], [[L’univers enfantin]].", c2, 23),
        E("CM2", "notion", "Trois thématiques : [[La personne et la vie quotidienne]] ; des repères géographiques, historiques et culturels des villes, pays et régions dont on étudie la langue ; [[L'imaginaire]].", c3, 40),
        E("6e", "notion", "Cinq axes, tous traités dans l'année : [[Personnes et personnages]] ; [[Le quotidien : vivre, jouer, apprendre]] ; [[Pays et paysages]] ; [[Imaginaire, contes et légendes]] ; [[Arts et expression des sentiments]].", f"{ang} {lvr}", 6),
        E("6e", "notion", "Langues régionales : « langues de France » ; pas d'enseignement en LVA mais en LVB et LVC ; souvent bilingue dès le premier degré ; médiation particulièrement riche.", lvr, 6),
    ),
)

ecrire({
    "id": "lv",
    "nom": "Langues vivantes",
    "nomMaternelle": "S’éveiller à la diversité linguistique",
    "intentions": "Une langue vivante obligatoire dès le CP, pour toutes les langues étrangères et régionales. Cinq activités langagières du [[Cadre européen commun de référence pour les langues]] : compréhension de l'oral, expression orale (en continu et en interaction), compréhension de l'écrit, expression écrite, médiation. L'oral prime au cycle 2 ; l'écrit s'installe à partir du CE2 et au cycle 3. Progression pré-A1 (CP) → A1 (fin de CM2) → A1+ (6e, LVA).",
    "domaines": [cadre, eveil, oral, ecrit, culture],
})
