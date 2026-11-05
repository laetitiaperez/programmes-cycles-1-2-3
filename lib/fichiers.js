// Correspondances et listes communes aux contrôles de contenu (fidélité, complétude).

// Texte officiel → fichier extrait dans sources/txt/ (cf. Task 3).
export const FICHIER = {
  'c1-2024': 'c1-2026', 'c1-2026': 'c1-2026', 'evar-mat-2025': 'evar-mat', 'evar-elem-2025': 'evar-elem',
  'evars-college-2025': 'evars-college', 'fr-c2-2024': 'fr-c2-2024', 'maths-c2-2024': 'maths-c2-2024',
  'fr-c3-2025': 'fr-c3-2025', 'fr-ex-cm1': 'fr-ex-cm1', 'fr-ex-cm2': 'fr-ex-cm2', 'fr-ex-6e': 'fr-ex-6e', 'maths-c3-2025': 'maths-c3-2025', 'maths-ex-cm1': 'maths-ex-cm1', 'maths-ex-cm2': 'maths-ex-cm2', 'maths-ex-6e': 'maths-ex-6e', 'emc-2024': 'emc-2024',
  'hg-c2-2026': 'hg-c2-2026', 'qlm-et-2020': 'c2-2020', 'hg-c3-2026': 'hg-c3-2026', 'hg-c3-2020': 'c3-2023',
  'sci-c2-2026': 'sci-c2-2026', 'qlm-vmo-2020': 'c2-2020', 'sci-c3-2026': 'sci-c3-2026', 'sci-c3-2023': 'c3-2023',
  'eps-c2-2026': 'eps-c2-2026', 'eps-c2-2020': 'c2-2020', 'eps-c3-2026': 'eps-c3-2026', 'eps-c3-2020': 'c3-2023',
  'arts-c2-2020': 'c2-2020', 'arts-c3-2020': 'c3-2023', 'lv-c2-2026': 'lv-c2-2026', 'lv-c2-2020': 'c2-2020',
  'lv-c3-2026': 'lv-c3-2026', 'lv-c3-2020': 'c3-2023', 'lve-6e-2025': 'lve-6e-2025', 'lvr-6e-2026': 'lvr-6e-2026',
  'volet1-c2-2020': 'c2-2020', 'volet1-c3-2023': 'c3-2023',
};

// Tous les textes à contrôler d'une matière, avec les textes officiels où chercher.
export function blocsAVerifier(m) {
  const sourcesFil = (f) => [f.socle, ...(f.etapes ?? [])].filter(Boolean).flatMap(b => b.sources);
  const tous = [...new Set(m.domaines.flatMap(d => d.fils.flatMap(sourcesFil)))];
  const blocs = [{ ou: 'intentions', texte: m.intentions, sources: tous }];
  (m.intentionsCompletes ?? []).forEach((b, i) => {
    for (const it of b.items ?? []) blocs.push({ ou: `intentions complètes/bloc ${i + 1}`, texte: it, sources: [b.source] });
  });
  for (const d of m.domaines) for (const f of d.fils) {
    if (f.socle) blocs.push({ ou: `${d.id}/${f.id}/socle`, texte: f.socle.texte, sources: f.socle.sources });
    (f.etapes ?? []).forEach((e, i) => blocs.push({ ou: `${d.id}/${f.id}/${i + 1} (${e.classes.join(' ')})`, texte: e.texte, sources: e.sources }));
    for (const [c, k] of Object.entries(f.complet ?? {})) {
      (k.blocs ?? []).forEach((b, i) => {
        for (const it of b.items ?? []) blocs.push({ ou: `${d.id}/${f.id}/complet ${c}/bloc ${i + 1}`, texte: it, sources: [b.source] });
      });
      for (const r of k.reconduit ?? []) {
        const src = [...new Set((f.complet[r.de]?.blocs ?? []).map(b => b.source))];
        blocs.push({ ou: `${d.id}/${f.id}/complet ${c}/reconduit de ${r.de}`, texte: r.texte, sources: src });
      }
    }
  }
  return blocs;
}
