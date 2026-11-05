// Carte par cycle : disciplines d'un cycle, leurs principes, textes en vigueur et domaines.

const blocsDuFil = (fil) => [fil.socle, ...(fil.etapes ?? [])].filter(Boolean);

export function classesDuCycle(classes, cy) {
  return classes.filter(c => c.cycle === Number(cy)).map(c => c.id);
}

// Le cycle 1 a sa propre matière de principes (« maternelle ») : elle est le centre de la carte, pas une branche.
const estPrincipes = (m, cy) => Number(cy) === 1 && m.id === 'maternelle';
const filDansCycle = (fil, dansCycle) => blocsDuFil(fil).some(b => (b.classes ?? []).some(c => dansCycle.has(c)));

export function matiereDansCycle(m, classes, cy) {
  const dansCycle = new Set(classesDuCycle(classes, cy));
  return !estPrincipes(m, cy) && m.domaines.some(d => d.fils.some(f => filDansCycle(f, dansCycle)));
}

// Étiquettes : textes cités par les étapes et socles de la matière dans ce cycle (exemples Éduscol exclus),
// avec les classes du cycle où ils s'appliquent en 2026-2027.
function etiquettes(m, classes, cy, textes) {
  const ordre = classesDuCycle(classes, cy);
  const tx = new Map(textes.map(t => [t.id, t]));
  const parTexte = new Map();
  for (const d of m.domaines) for (const f of d.fils) for (const b of blocsDuFil(f)) {
    for (const id of b.sources ?? []) {
      if (id.includes('-ex-') || !tx.has(id)) continue;
      const cls = (b.classes ?? []).filter(c => ordre.includes(c) && tx.get(id).classes2026.includes(c));
      if (!cls.length) continue;
      if (!parTexte.has(id)) parTexte.set(id, new Set());
      for (const c of cls) parTexte.get(id).add(c);
    }
  }
  return [...parTexte].map(([texteId, cls]) => ({ texteId, classes: ordre.filter(c => cls.has(c)) }))
    .sort((a, b) => ordre.indexOf(a.classes[0]) - ordre.indexOf(b.classes[0]) || a.texteId.localeCompare(b.texteId));
}

export function disciplinesDuCycle(matieres, classes, cy, textes) {
  const dansCycle = new Set(classesDuCycle(classes, cy));
  return matieres.filter(m => matiereDansCycle(m, classes, cy)).map(m => ({
    matiere: m,
    nom: Number(cy) === 1 && m.nomMaternelle ? m.nomMaternelle : m.nom,
    principes: [m.intentionsParCycle?.[String(cy)], m.intentionsParCycle?.tous].filter(Boolean),
    etiquettes: etiquettes(m, classes, cy, textes),
    domaines: m.domaines.filter(d => d.fils.some(f => filDansCycle(f, dansCycle))).map(d => ({ id: d.id, nom: d.nom })),
  }));
}

export function intentionsCompletesDuCycle(m, textesIndex, classes, cy) {
  const dansCycle = classesDuCycle(classes, cy);
  return (m.intentionsCompletes ?? []).filter(b => (textesIndex.get(b.source)?.classes2026 ?? []).some(c => dansCycle.includes(c)));
}

// Centre de la carte : les idées-forces groupées par bloc ; chaque groupe emporte son bloc officiel et les
// sous-parties qui le suivent jusqu'au bloc du groupe suivant (aucun bloc perdu ni répété).
export function sectionsDuCycle(cycle) {
  const blocs = cycle.complet?.blocs ?? [];
  const idees = cycle.idees ?? [];
  if (!idees.length) return [{ idees: [], blocs: [...blocs] }];
  const debuts = [...new Set(idees.map(i => i.bloc))].sort((a, b) => a - b);
  return debuts.map((d, k) => ({
    idees: idees.filter(i => i.bloc === d),
    blocs: blocs.slice(k === 0 ? 0 : d, debuts[k + 1] ?? blocs.length),
  }));
}
