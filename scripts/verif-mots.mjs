// Vérifie que chaque mot-clé [[…]] figure dans le texte officiel cité (règle : termes
// officiels mot pour mot). Comparaison sans casse, accents ni retours à la ligne.
// Usage : node scripts/verif-mots.mjs [matiere]
import { readFile } from 'node:fs/promises';
import { extractKeywords } from '../lib/markup.js';
import { normalize } from '../lib/normalize.js';

// Texte officiel → fichier extrait dans sources/txt/ (cf. Task 3).
const FICHIER = {
  'c1-2024': 'c1-2026', 'c1-2026': 'c1-2026', 'evar-mat-2025': 'evar-mat', 'evar-elem-2025': 'evar-elem',
  'evars-college-2025': 'evars-college', 'fr-c2-2024': 'fr-c2-2024', 'maths-c2-2024': 'maths-c2-2024',
  'fr-c3-2025': 'fr-c3-2025', 'fr-ex-cm1': 'fr-ex-cm1', 'fr-ex-cm2': 'fr-ex-cm2', 'fr-ex-6e': 'fr-ex-6e', 'maths-c3-2025': 'maths-c3-2025', 'maths-ex-cm1': 'maths-ex-cm1', 'maths-ex-cm2': 'maths-ex-cm2', 'maths-ex-6e': 'maths-ex-6e', 'emc-2024': 'emc-2024',
  'hg-c2-2026': 'hg-c2-2026', 'qlm-et-2020': 'c2-2020', 'hg-c3-2026': 'hg-c3-2026', 'hg-c3-2020': 'c3-2023',
  'sci-c2-2026': 'sci-c2-2026', 'qlm-vmo-2020': 'c2-2020', 'sci-c3-2026': 'sci-c3-2026', 'sci-c3-2023': 'c3-2023',
  'eps-c2-2026': 'eps-c2-2026', 'eps-c2-2020': 'c2-2020', 'eps-c3-2026': 'eps-c3-2026', 'eps-c3-2020': 'c3-2023',
  'arts-c2-2020': 'c2-2020', 'arts-c3-2020': 'c3-2023', 'lv-c2-2026': 'lv-c2-2026', 'lv-c2-2020': 'c2-2020',
  'lv-c3-2026': 'lv-c3-2026', 'lv-c3-2020': 'c3-2023', 'lve-6e-2025': 'lve-6e-2025', 'lvr-6e-2026': 'lvr-6e-2026',
};

const plat = (s) => normalize(s).replace(/[’']/g, "'").replace(/-\s*\n\s*/g, '').replace(/[\s\f]+/g, ' ');
// Deux extractions : « -layout » (colonnes préservées) et « -raw » (ordre de lecture),
// car la mise en page en colonnes coupe certaines expressions.
const cache = new Map();
async function texte(id) {
  if (!cache.has(id)) {
    const lire = (dir) => readFile(new URL(`../sources/${dir}/${FICHIER[id]}.txt`, import.meta.url), 'utf8').catch(() => '');
    cache.set(id, plat(await lire('txt')) + ' ¤ ' + plat(await lire('raw')));
  }
  return cache.get(id);
}

const ids = process.argv[2] ? [process.argv[2]]
  : JSON.parse(await readFile(new URL('../data/matieres/index.json', import.meta.url), 'utf8'));
let absents = 0;
let total = 0;
for (const id of ids) {
  const m = JSON.parse(await readFile(new URL(`../data/matieres/${id}.json`, import.meta.url), 'utf8'));
  const tousLesTextes = [...new Set(m.domaines.flatMap(d => d.fils.flatMap(f =>
    [f.socle, ...(f.etapes ?? [])].filter(Boolean).flatMap(b => b.sources))))];
  const blocs = [['intentions', { texte: m.intentions, sources: tousLesTextes }]];
  for (const d of m.domaines) for (const f of d.fils) {
    if (f.socle) blocs.push([`${d.id}/${f.id}/socle`, f.socle]);
    (f.etapes ?? []).forEach((e, i) => blocs.push([`${d.id}/${f.id}/${i + 1} (${e.classes.join(' ')})`, e]));
  }
  for (const [ou, b] of blocs) {
    for (const kw of extractKeywords(b.texte)) {
      total++;
      const k = plat(kw);
      // Encadrés CRPE sans source : on cherche dans tous les textes de la matière.
      const sources = b.sources.length ? b.sources : tousLesTextes;
      const trouve = (await Promise.all(sources.map(texte))).some(t => t.includes(k));
      if (!trouve) { absents++; console.log(`${id}/${ou} : « ${kw} » absent de ${b.sources.join(', ')}`); }
    }
  }
}
console.log(`${total - absents}/${total} mots-clés trouvés mot pour mot dans leur source.`);
process.exit(absents ? 1 : 0);
