export const indexTextes = (textes) => new Map(textes.map(t => [t.id, t]));

export const textesPourClasse = (textes, classe) => textes.filter(t => t.classes2026.includes(classe));

export function nouveautesCycle(textes, classes, cycle) {
  const ids = new Set(classes.filter(c => c.cycle === cycle).map(c => c.id));
  return textes
    .map(t => ({ ...t, classesCycle: (t.nouveauEn ?? []).filter(c => ids.has(c)) }))
    .filter(t => t.classesCycle.length);
}

// Une étape (ou un socle) est « nouvelle » si l'une de ses classes entre en
// vigueur en 2026-27 pour l'un des textes cités.
export function estNouveau(bloc, textesMap) {
  return (bloc.sources ?? []).some(id => {
    const t = textesMap.get(id);
    return t && bloc.classes.some(c => (t.nouveauEn ?? []).includes(c));
  });
}

export function sourcesDivergentes(fil) {
  const ids = new Set([...(fil.socle?.sources ?? []), ...(fil.etapes ?? []).flatMap(e => e.sources ?? [])]);
  return ids.size > 1;
}
