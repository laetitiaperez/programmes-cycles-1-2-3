import { readFile } from 'node:fs/promises';
import { validateData } from '../lib/validate.js';

const read = async (p) => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));

const classes = await read('data/classes.json');
const textes = await read('data/textes.json');
const ids = await read('data/matieres/index.json');
const matieres = await Promise.all(ids.map(id => read(`data/matieres/${id}.json`)));

const errors = validateData({ classes, textes, matieres });

if (process.argv.includes('--links')) {
  const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh) programmes-cycles-validate' };
  for (const url of new Set(textes.map(t => t.pdf))) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers });
      // 403 = protection anti-robot d'Éduscol / du BO : le lien marche dans un navigateur.
      if (r.status === 403) console.warn(`avertissement : ${url} refuse les robots (403), à vérifier dans un navigateur`);
      else if (!r.ok) errors.push(`lien ${url} : HTTP ${r.status}`);
    } catch (e) {
      errors.push(`lien ${url} : ${e.message}`);
    }
  }
}

if (errors.length) {
  console.error(`${errors.length} erreur(s) :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK : ${textes.length} textes, ${matieres.length} matières.`);
