"""Enseignement moral et civique CP→6e. Source unique : emc-2024 (programme CP → terminale, BO n° 24 du 13/06/2024).
Nouveau en 2026-27 pour le CE2 et la 6e (nouveauEn). Pas de domaine EMC en maternelle."""
from commun import E, S, F, D, ecrire

e = "emc-2024"

cadre = D("cadre", "Cadre et méthodes",
    F("dimensions", "Culture de la démocratie : quatre dimensions",
        E("CP CE1 CE2 CM1 CM2 6e", "notion", "Valeurs et principes : [[liberté, l’égalité, la fraternité et la laïcité]] ; s'en déduisent l'égalité entre les femmes et les hommes, le refus de toutes les discriminations, la solidarité. Quatre dimensions (cadre du Conseil de l'Europe) : [[valeurs]], [[domaines de connaissances]], [[attitudes]], [[aptitudes]]. L'EMC structure le [[parcours citoyen]].", e, 2),
        E("CP CE1 CE2 CM1 CM2 6e", "notion", "Programme [[annualisé]] ; [[logique spiralaire]] ; méthodes : situations réelles, analyses savantes, descriptions imaginaires (littérature, arts) ; [[débat réglé]], discussion argumentée (le [[dilemme moral]] à partir du cycle 4) ; liens avec l'[[EMI]], l'[[EDD]], les [[compétences psychosociales]] et l'EVAR.", e, 4),
        E("CE2 6e", "crpe", "Le programme d'EMC de 2024 entre en vigueur en CE2 et en 6e à la rentrée 2026 (il s'applique déjà du CP au CE1 et en CM1-CM2).", "", None),
    ),
)

soi = D("soi", "Soi et les autres",
    F("emotions-empathie", "Émotions, empathie, fraternité",
        E("CP", "competence", "[[Connaissance et maîtrise de soi]] : comprendre ses émotions et ses sentiments ; confiance et [[estime de soi]].", e, 7),
        E("CP", "exemple", "À partir d'albums, identifier les émotions de base (joie, tristesse, peur, colère, dégoût, surprise) ; décoder les signaux non verbaux par des saynètes.", e, 7),
        E("CE1", "competence", "[[Altérité et sociabilité]] : reconnaître les émotions d'autrui ; développer sa capacité d'[[empathie]] ; s'entraider ; la diversité comme richesse ; reconnaître les situations de violence et de [[harcèlement]] (auteur, cible, témoin ; programme [[Phare]]).", e, 8),
        E("CM1", "competence", "Comment faire société : comprendre la notion de [[fraternité]] ; ce qu'implique et permet l'empathie ; égoïsme et altruisme (débat réglé).", e, 12),
    ),
    F("intimite", "Hygiène, intimité, vie privée",
        E("CP", "competence", "[[Règles d’hygiène et exigence d’intimité]] : avoir conscience de son intégrité ; règles élémentaires d'hygiène et d'intimité ; égalité filles-garçons (lien avec l'EVAR).", e, 8),
        E("CE1", "competence", "+ Intimité et respect de la vie privée (sanitaires, vestiaires, ENT) ; violences sexistes.", e, 9),
        E("6e", "competence", "Le [[droit à la vie privée]] (CIDE art. 16) : intimité, droit à l'image ; [[majorité numérique]] à quinze ans (loi du 7 juillet 2023) ; traces numériques.", e, 16),
    ),
)

regles = D("regles", "Règles, droits et devoirs",
    F("regles-collectives", "Règles collectives et responsabilité",
        E("CP", "competence", "[[Les règles collectives et l’autonomie]] : s'approprier les règles de l'école ([[droits et devoirs]]) ; respecter les adultes ; identifier les risques ; respecter les biens communs ; la règle comme protection.", e, 7),
        E("CP", "repere", "[[Attestation de première éducation à la route]] (APER).", e, 8),
        E("CE1", "competence", "+ Règles de vie et de [[civilité]] ; identifier les dangers ; donner l'alerte (APS).", e, 9),
        E("CE2", "competence", "Participer à l'élaboration collective des règles de vie ; conseils d'élèves, décision à la majorité.", e, 10),
        E("CM1", "competence", "[[Civisme]] : action d'un individu en fonction du bien public ; [[incivilités]] ; politesse.", e, 11),
        E("CM2", "competence", "Devoirs du citoyen : respecter les lois, contribuer aux dépenses publiques (DDHC art. 13) ; « Voter est un droit, c'est aussi un devoir civique ».", e, 12),
    ),
    F("droits", "Droits de l'enfant et libertés fondamentales",
        E("CP", "competence", "Savoir que les enfants ont des droits : [[Convention internationale des droits de l’enfant]] (1989).", e, 8),
        E("CM1", "competence", "[[L’égalité dans la dignité]] : égalité en droit ; [[dignité de la personne humaine]] ; cyberviolences.", e, 11),
        E("CM2", "competence", "Libertés et droits fondamentaux : DDHC (1789), Déclaration universelle (1948), Charte des droits fondamentaux de l'UE (2000) ; liberté d'expression (art. 11) et ses limites ; droits de « troisième génération » (Charte de l'environnement).", e, 13),
        E("6e", "competence", "Avoir des droits en tant que personne et respecter ceux des autres (5 à 6 heures).", e, 16),
    ),
    F("discriminations", "Préjugés et discriminations",
        E("CE1", "competence", "Première approche des [[stéréotypes]] (publicité, dessin animé) ; les préjugés ont une incidence sur le rapport à l'autre.", e, 9),
        E("CM1", "competence", "Identifier des situations de [[discrimination]] ou d'atteinte à la personne.", e, 11),
        E("CM2", "competence", "[[Respecter les droits de tous]] : déconstruction des [[préjugés]] et des stéréotypes ; racisme, antisémitisme, sexisme, xénophobie, homophobie, harcèlement : l'expression des discriminations est sanctionnée par la loi ; rôle du témoin.", e, 14),
    ),
)

republique = D("republique", "La République",
    F("symboles", "Symboles et valeurs de la République",
        E("CP", "competence", "[[Être élève à l’école de la République]] : identifier le drapeau français ; reconnaître [[La Marseillaise]].", e, 8),
        E("CE1", "competence", "+ Symboles républicains ; chanter le 1er couplet et le refrain de La Marseillaise ; comprendre la devise « [[Liberté, Égalité, Fraternité]] » ; lieux de mémoire, cérémonies ; le français est la langue de la République.", e, 9),
        E("CE2", "competence", "+ Approfondir la devise : la liberté sans l'égalité fait régner la loi du plus fort…", e, 10),
        E("CM2", "competence", "+ Symboles mentionnés par la Constitution (drapeau, hymne, devise) et [[Marianne]] ; fête nationale du [[14 juillet]] (héritière de la Fête de la Fédération de 1790) ; commémoration du 11 novembre ; drapeau et hymne européens ; la France membre de l'[[Union européenne]].", e, 13),
    ),
    F("laicite", "Laïcité",
        E("CE1", "competence", "Aborder le principe de la [[liberté de conscience]] : liberté de croire, de ne pas croire ou de changer de croyance ; [[Charte de la laïcité]].", e, 9),
        E("CM2", "competence", "[[À l’école laïque]] : respect des croyances, dont l'expression est limitée par la loi ; nul ne peut imposer ses croyances ; lois scolaires de 1881-1882, loi de 1905, loi du 15 mars 2004.", e, 14),
        E("CM2", "repere", "Journée de la laïcité : 9 décembre.", e, 14),
        E("6e", "competence", "+ La laïcité garantit la liberté de conscience et l'égalité ; [[neutralité de l’État]] ; « un principe juridique et non une opinion » (différent de l'athéisme) ; l'école, espace à l'abri des [[prosélytismes]].", e, 15),
    ),
    F("democratie", "Démocratie, institutions, citoyenneté",
        E("CE2", "competence", "[[La République et son fonctionnement]] : le chef de l'État est le [[président de la République]], élu ; le [[maire]] est un élu local et le représentant de l'État dans la commune (état civil, école, environnement).", e, 10),
        E("CM1", "competence", "Signification de « [[démocratie]] » et [[suffrage direct]] ; DDHC art. 3, 6 et 16 : souveraineté, volonté générale, égalité devant la loi, séparation des pouvoirs ; démocratie scolaire.", e, 11),
        E("CM2", "competence", "Citoyenneté et [[nationalité]] ; [[droits civils]] et [[droits politiques]] (vote, éligibilité) ; conseillers municipaux juniors ; Parlement des enfants.", e, 12),
        E("6e", "competence", "Représenter les autres et servir l'intérêt général : [[représentation]], vote, délégués, écodélégués, échelles jusqu'au Parlement européen.", e, 14),
    ),
    F("bien-commun", "Bien commun et intérêt général",
        E("CE2", "competence", "[[L’engagement pour le bien commun]] : différencier [[intérêt particulier]] et [[intérêt général]] ; [[éco-gestes]] ; institutions et associations au service du bien commun (pompiers, santé…).", e, 10),
        E("6e", "competence", "+ L'intérêt général prend en compte les générations futures ([[ODD]]).", e, 15),
    ),
)

numerique = D("numerique", "Numérique, médias, environnement",
    F("emi", "EMI et civisme numérique",
        E("CE1", "competence", "Première approche des stéréotypes dans la production visuelle et audiovisuelle.", e, 5),
        E("CE2", "competence", "L'information relève de l'intérêt général ; photo-langage.", e, 5),
        E("CM1", "competence", "[[Civisme numérique]] : recherches en ligne, notion de « source » ; [[sobriété numérique]] ; droit à la déconnexion ; cyberviolences.", e, 11),
        E("CM2", "competence", "Liberté d'expression en ligne ; réseaux sociaux (« pas un espace de non-droit ») ; [[désinformation]].", e, 14),
        E("6e", "competence", "Données personnelles, traces numériques, réputation numérique ; PIX.", e, 16),
    ),
)

ecrire({
    "id": "emc",
    "nom": "Enseignement moral et civique",
    "intentions": "Former les élèves « à l’exercice et à une conscience claire de leur citoyenneté » ; faire partager les valeurs de la République (Code de l'éducation, art. L 111-1). Titres annuels : CP « Se reconnaitre comme individu et élève » ; CE1 « Respecter les autres » ; CE2 « Apprendre ensemble et vivre ensemble » ; CM1 « Faire société » ; CM2 « Vivre en République » ; 6e « Apprendre à vivre dans une société démocratique ».",
    "domaines": [cadre, soi, regles, republique, numerique],
})
