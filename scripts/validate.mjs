import { readFile } from 'node:fs/promises';
import { validateData } from '../lib/validate.js';

const read = async (p) => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));

const classes = await read('data/classes.json');
const textes = await read('data/textes.json');
const ids = await read('data/matieres/index.json');
const matieres = await Promise.all(ids.map(id => read(`data/matieres/${id}.json`)));

const errors = validateData({ classes, textes, matieres });

if (process.argv.includes('--links')) {
  for (const url of new Set(textes.map(t => t.pdf))) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (!r.ok) errors.push(`lien ${url} : HTTP ${r.status}`);
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
