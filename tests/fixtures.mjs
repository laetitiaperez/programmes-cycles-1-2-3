export const classes = [
  { id: 'PS', cycle: 1 }, { id: 'MS', cycle: 1 }, { id: 'GS', cycle: 1 },
  { id: 'CP', cycle: 2 }, { id: 'CE1', cycle: 2 }, { id: 'CE2', cycle: 2 },
  { id: 'CM1', cycle: 3 }, { id: 'CM2', cycle: 3 }, { id: '6e', cycle: 3 },
];

export const textes = [
  { id: 'fr-c2-2024', titre: 'Français cycle 2', matiere: 'francais', bo: 'BO n° 41 du 31 octobre 2024',
    classes2026: ['CP', 'CE1', 'CE2'], nouveauEn: [], pdf: 'https://example.org/fr-c2.pdf' },
  { id: 'hg-c2-2026', titre: 'Histoire-géographie cycle 2', matiere: 'hg', bo: 'BO n° 22 du 28 mai 2026',
    classes2026: ['CP'], nouveauEn: ['CP'], pdf: 'https://example.org/hg-c2.pdf' },
  { id: 'qlm-et-2020', titre: 'Questionner l’espace et le temps (2020)', matiere: 'hg', bo: 'BO n° 31 du 30 juillet 2020',
    classes2026: ['CE1', 'CE2'], nouveauEn: [], pdf: 'https://example.org/c2-2020.pdf' },
];

export const francais = {
  id: 'francais', nom: 'Français', intentions: 'Priorité à la [[lecture]].',
  domaines: [{ id: 'lecture', nom: 'Lecture', fils: [
    { id: 'fluence', nom: 'Fluence',
      socle: { classes: ['CP', 'CE1', 'CE2'], texte: 'Lire à voix haute avec [[fluence]].', sources: ['fr-c2-2024'] },
      etapes: [
        { classes: ['CP'], type: 'attendu', texte: 'Lire [[50 mots par minute]].', sources: ['fr-c2-2024'], page: 8 },
        { classes: ['CE1'], type: 'attendu', texte: '+ 70 mots par minute, [[Fluence]] régulière.', sources: ['fr-c2-2024'] },
        { classes: ['CE1'], type: 'exemple', texte: 'Lecture théâtralisée.', sources: ['fr-c2-2024'] },
      ] },
    { id: 'decodage', nom: 'Décodage', etapes: [
        { classes: ['CP'], type: 'competence', texte: 'Maîtriser les [[correspondances graphèmes-phonèmes]].', sources: ['fr-c2-2024'] },
      ] },
  ] }],
};

export const hg = {
  id: 'hg', nom: 'Histoire-géographie', intentions: 'Se repérer dans le [[temps]].',
  domaines: [{ id: 'temps', nom: 'Temps', fils: [
    { id: 'frise', nom: 'Frise chronologique', etapes: [
      { classes: ['CP'], type: 'notion', texte: '[[Frise chronologique]] de l’année.', sources: ['hg-c2-2026'] },
      { classes: ['CE1', 'CE2'], type: 'notion', texte: 'Repères sur la [[frise chronologique]] (siècle).', sources: ['qlm-et-2020'] },
    ] },
  ] }],
};

export const data = () => structuredClone({ classes, textes, matieres: [francais, hg] });
