"""Éducation à la vie affective et relationnelle (EVAR) PS→CM2 et à la sexualité (EVARS) en 6e,
programmes de février 2025 (BO n° 6 du 6/02/2025), en vigueur dans toutes les classes :
PS-GS : evar-mat-2025 ; CP-CM2 : evar-elem-2025 ; 6e : evars-college-2025.
Les trois textes reprennent le même préambule et le même tableau d'objectifs par niveau.
Repères d'âge : « avant 4 ans » → PS, « à partir de 4 ans » → MS, « à partir de 5 ans » → GS."""
from commun import E, S, F, D, ecrire

mat, elem, col = "evar-mat-2025", "evar-elem-2025", "evars-college-2025"
tous = f"{mat} {elem} {col}"

cadre = D("cadre", "Cadre, principes, mise en œuvre",
    F("principes", "Principes et organisation",
        E("PS MS GS CP CE1 CE2 CM1 CM2 6e", "repere", "Code de l'éducation (article L. 312-16) : « [[au moins trois séances annuelles]] et par groupes d’âge homogène » ; enseignement obligatoire, public et privé sous contrat ; les parents sont informés des objectifs annuels.", tous, 2),
        E("PS MS GS CP CE1 CE2 CM1 CM2 6e", "notion", "Trois champs : le [[champ biologique]], le [[champ psycho-émotionnel]] et le [[champ juridique et social]] ; construction spiralaire ; lien avec le [[parcours éducatif de santé]] et les [[compétences psychosociales]] (CPS).", tous, 2),
        E("PS MS GS CP CE1 CE2 CM1 CM2", "notion", "À l'école primaire : [[éducation à la vie affective et relationnelle]] ; au collège et au lycée : éducation à la vie affective et relationnelle, et à la sexualité (EVARS).", f"{mat} {elem}", 2),
        E("6e", "repere", "Au collège : séances d'environ deux heures ; modalités participatives ; coanimation avec les personnels de santé et sociaux à privilégier.", col, 5),
        E("PS MS GS", "notion", "Maternelle : partir du corps, des sentiments et des émotions, du respect de l'intimité et de l'égalité filles-garçons ; s'appuyer sur le quotidien de la classe ; attention soutenue au [[repérage d’enfants en danger]].", mat, 6),
        E("CP CE1 CE2 CM1 CM2", "notion", "Élémentaire : connaissances scientifiques plus précises ; veiller à « l’utilisation d’un vocabulaire précis, scientifique » ; au cycle 3, puberté et prévention des [[violences sexistes et sexuelles]].", elem, 7),
    ),
)

corps = D("corps", "Se connaître, vivre et grandir avec son corps",
    F("corps", "Corps, intimité, santé",
        E("PS", "competence", "Connaître son corps. Comprendre ce qu'est l'intimité.", mat, 8),
        E("MS", "competence", "Connaître son corps et identifier des émotions.", mat, 8),
        E("GS", "competence", "Connaître son corps, ses sensations et ses émotions.", mat, 8),
        E("CP", "competence", "Connaître son corps ; comprendre ce qu'est l'intimité : nommer les parties du corps, dont les [[parties intimes]], avec un vocabulaire scientifique précis ; toute personne a droit au respect de son intimité.", elem, 10),
        E("CE1", "competence", "Grandir, avoir une bonne connaissance et [[estime de soi]], protéger son intimité.", elem, 8),
        E("CE2", "competence", "Se sentir bien dans son corps et en prendre soin ; santé physique, mentale et sociale ; savoir demander de l'aide ; numéros d'urgence : [[le 15 et le 119]].", elem, 13),
        E("CM1", "competence", "Connaître les changements de son corps ([[puberté]]).", elem, 15),
        E("CM2", "competence", "Connaître et comprendre les changements de son corps et celui des autres.", elem, 9),
        E("6e", "competence", "Comprendre et apprendre à vivre les changements de son corps.", col, 9),
    ),
)

relations = D("relations", "Rencontrer les autres et construire des relations",
    F("relations", "Émotions, consentement, protection",
        E("PS", "competence", "Apprendre à exprimer son accord ou son refus, à envisager et à respecter un refus.", mat, 8),
        E("MS", "competence", "Identifier une personne de confiance (adulte, enfant), apprendre à faire appel à elle.", mat, 8),
        E("GS", "competence", "Identifier différents types de sentiments dans sa relation à l'autre.", mat, 8),
        E("CP", "competence", "Comprendre la diversité des émotions et des sentiments : les siens et ceux des autres ; résoudre des conflits de façon constructive.", elem, 10),
        E("CE1", "competence", "Comprendre les différentes dimensions (affectives, éthiques, sociales et légales) d'une relation humaine.", elem, 8),
        E("CE2", "competence", "Comprendre ce qu'est le [[consentement]], les différentes manières de le solliciter et de l'exprimer ou d'accepter et de respecter un refus.", elem, 14),
        E("CM1", "competence", "Développer des relations constructives et repérer les situations de [[harcèlement]].", elem, 9),
        E("CM2", "competence", "Promouvoir des relations positives, apprendre à repérer et se protéger des violences sexistes et sexuelles.", elem, 9),
        E("6e", "competence", "Entrer en relation avec les autres et comprendre que les relations peuvent changer.", col, 9),
    ),
)

societe = D("societe", "Trouver sa place dans la société",
    F("societe", "Égalité, familles, droits, numérique",
        E("PS", "competence", "Appréhender et comprendre l'égalité entre les filles et les garçons et la liberté d'être soi-même.", mat, 8),
        E("MS", "competence", "Vivre l'égalité entre les filles et les garçons ; découvrir les différentes [[structures familiales]] et les respecter.", mat, 8),
        E("GS", "competence", "Découvrir les ressemblances et les différences entre les autres et soi ; respecter les autres dans leur différence.", mat, 8),
        E("CP", "competence", "Appartenir à une famille, comprendre la nature, la fonction et le sens des liens familiaux.", elem, 8),
        E("CE1", "competence", "Promouvoir des relations égalitaires, repérer des discriminations issues de [[stéréotypes]], notamment de genre.", elem, 8),
        E("CE2", "competence", "Connaître ses droits.", elem, 8),
        E("CM1", "competence", "Promouvoir des relations égalitaires et positives ; comprendre les stéréotypes pour lutter contre les discriminations.", elem, 9),
        E("CM2", "competence", "[[Prévenir les risques liés à l’usage du numérique et d’Internet]].", elem, 17),
        E("6e", "competence", "Trouver sa place au sein d'un groupe sans renier ses propres sentiments, respecter les autres et en être respecté.", col, 9),
    ),
)

ecrire({
    "id": "evar",
    "nom": "Éducation à la vie affective et relationnelle",
    "intentions": "Programme national de février 2025, obligatoire de la maternelle au lycée. Trois axes suivis tout au long de la scolarité : [[se connaître, vivre et grandir avec son corps]] ; [[rencontrer les autres et construire avec eux des relations, s’y épanouir]] ; [[trouver sa place dans la société, y être libre et responsable]]. EVAR à l'école primaire, EVARS (… et à la sexualité) à partir du collège.",
    "domaines": [cadre, corps, relations, societe],
})
