// Repère les énoncés des textes officiels qu'aucun item de la couche complète ne reprend.
// Portée : data/completude-portee.json ; exclusions justifiées : data/completude-exclus.json.
// Usage : node scripts/verif-completude.mjs <matiere> [--source <id>] [--pages a-b]
import { readFile } from 'node:fs/promises';
import { FICHIER } from '../lib/fichiers.js';
import { rapport } from '../lib/completude.js';

const read = async (p) => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));
const args = process.argv.slice(2);
const opt = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const matiere = args[0];
if (!matiere || matiere.startsWith('--')) { console.error('Usage : verif-completude.mjs <matiere> [--source <id>] [--pages a-b]'); process.exit(2); }

const portee = (await read('data/completude-portee.json'))[matiere];
if (!portee) { console.error(`Aucune portée pour « ${matiere} » dans data/completude-portee.json`); process.exit(2); }
const exclus = await read('data/completude-exclus.json');
const m = await read(`data/matieres/${matiere}.json`);
const [pa, pb] = (opt('--pages') ?? '').split('-').map(Number);

let manquants = 0;
let total = 0;
for (const [id, plages] of Object.entries(portee)) {
  if (opt('--source') && opt('--source') !== id) continue;
  const brut = await readFile(new URL(`../sources/raw/${FICHIER[id]}.txt`, import.meta.url), 'utf8');
  const toutes = brut.split('\f');
  const garder = (p) => plages.some(([a, b]) => p >= a && p <= b) && (!pa || (p >= pa && p <= (pb || pa)));
  const pages = toutes.map((t, i) => (garder(i + 1) ? t : ''));
  const intentions = (m.intentionsCompletes ?? []).filter(b => b.source === id).flatMap(b => b.items.map(texte => ({ page: b.page, texte })));
  const items = intentions.concat(m.domaines.flatMap(d => d.fils.flatMap(f => Object.values(f.complet ?? {}).flatMap(k => [
    // Le titre d'un bloc reprend l'intitulé officiel qui le précède.
    ...(k.blocs ?? []).filter(b => b.source === id).flatMap(b => [b.titre, ...b.items].map(texte => ({ page: b.page, texte }))),
    ...(k.reconduit ?? []).flatMap(r => (k.blocs ?? []).filter(b => b.source === id).slice(0, 1).map(b => ({ page: b.page, texte: r.texte }))),
  ]))));
  // Les exemples Éduscol (« -ex- ») listent des œuvres à puce privée : ressources, pas énoncés.
  const listesOeuvres = id.includes('-ex-');
  const r = rapport({ pages, items, exclus: exclus.filter(e => e.source === id).map(e => e.debut), listesOeuvres });
  total += rapport({ pages, items: [], exclus: [], listesOeuvres }).length;
  for (const x of r) console.log(`${id} p.${x.page} (${Math.round(x.score * 100)} %) : ${x.segment}`);
  manquants += r.length;
}
console.log(`${manquants} segment(s) non repris sur ${total}`);
process.exit(manquants ? 1 : 0);
