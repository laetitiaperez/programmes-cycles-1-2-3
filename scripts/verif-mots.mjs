// Vérifie que chaque mot-clé [[…]] figure dans le texte officiel cité (règle : termes
// officiels mot pour mot). Comparaison sans casse, accents ni retours à la ligne.
// Usage : node scripts/verif-mots.mjs [matiere]
import { readFile } from 'node:fs/promises';
import { extractKeywords } from '../lib/markup.js';
import { normalize } from '../lib/normalize.js';
import { FICHIER, blocsAVerifier, blocsCycles } from '../lib/fichiers.js';

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
  : [...JSON.parse(await readFile(new URL('../data/matieres/index.json', import.meta.url), 'utf8')), 'cycles'];
let absents = 0;
let total = 0;
for (const id of ids) {
  // « cycles » : principes des cycles (data/cycles.json), chaque idée vérifiée dans le texte de son cycle.
  const blocs = id === 'cycles'
    ? blocsCycles(JSON.parse(await readFile(new URL('../data/cycles.json', import.meta.url), 'utf8')))
    : blocsAVerifier(JSON.parse(await readFile(new URL(`../data/matieres/${id}.json`, import.meta.url), 'utf8')));
  const tousLesTextes = blocs[0].sources;
  for (const b of blocs) {
    for (const kw of extractKeywords(b.texte)) {
      total++;
      const k = plat(kw);
      // Encadrés CRPE sans source : on cherche dans tous les textes de la matière.
      const sources = b.sources.length ? b.sources : tousLesTextes;
      const trouve = (await Promise.all(sources.map(texte))).some(t => t.includes(k));
      if (!trouve) { absents++; console.log(`${id}/${b.ou} : « ${kw} » absent de ${b.sources.join(', ')}`); }
    }
  }
}
console.log(`${total - absents}/${total} mots-clés trouvés mot pour mot dans leur source.`);
process.exit(absents ? 1 : 0);
