import { normalize } from './normalize.js';
import { stripMarkup } from './markup.js';

// Intitulés des textes officiels : ce ne sont pas des énoncés à reprendre.
export const INTITULES = [
  "Objectifs d'apprentissage", 'Objectifs', 'Exemples de réussite', "Attendus de fin d'année",
  'Repères de progressivité', 'Connaissances et compétences associées', 'Cours préparatoire',
  'Cours élémentaire première année', 'Cours élémentaire deuxième année', 'Cours moyen première année',
  'Cours moyen deuxième année', 'Sixième',
];

const MOTS_VIDES = new Set(['dans', 'pour', 'avec', 'elle', 'elles', 'leur', 'leurs', 'sont', 'etre', 'cette',
  'ces', 'une', 'des', 'les', 'aux', 'par', 'plus', 'sans', 'ainsi', 'entre', 'tout', 'tous', 'toute', 'toutes',
  'comme', 'meme', 'aussi', 'dont', 'quand', 'tres']);

const comparable = (s) => normalize(s).replace(/’/g, "'");
const intitules = new Set(INTITULES.map(comparable));
// En-têtes : « Objectifs d'apprentissage Exemples de réussite » (titres de colonnes accolés), repères d'âge de la maternelle.
const EN_TETES = [/^objectifs( d'apprentissage)? exemples de reussite$/, /^• a (aborder avant|partir de) \d ans/];
const estEnTete = (s) => { const c = comparable(s).replace(/\s*:$/, ''); return intitules.has(c) || EN_TETES.some(re => re.test(c)); };

export function motsPleins(s) {
  const mots = comparable(s).split(/[^\p{L}\p{N}]+/u)
    .filter(m => m.length >= 4 && !MOTS_VIDES.has(m))
    .map(m => m.replace(/[sx]$/, ''));
  return new Set(mots);
}

export function segmenter(page) {
  const segments = [];
  for (const brute of String(page ?? '').split('\n')) {
    const ligne = brute.trim();
    if (!ligne) continue;
    // Puce privée (\uF0B7…) : liste d'œuvres proposées, pas un énoncé du programme.
    const ouvre = /^[-•\p{Co}]/u.test(ligne) || /^\p{Lu}/u.test(ligne);
    if (ouvre || !segments.length) segments.push(ligne);
    else {
      const prec = segments[segments.length - 1];
      // « circonstan-⏎ciels » : mot coupé en fin de ligne.
      segments[segments.length - 1] = /\p{L}-$/u.test(prec) ? prec.slice(0, -1) + ligne : `${prec} ${ligne}`;
    }
  }
  return segments.filter(s => !/^\p{Co}/u.test(s) && !estEnTete(s) && motsPleins(s).size >= 4);
}

function texteBrut(t) {
  try { return stripMarkup(t); } catch { return t; }
}

export function couverture(segment, items) {
  const attendus = motsPleins(segment);
  if (!attendus.size) return 1;
  const presents = new Set(items.flatMap(it => [...motsPleins(texteBrut(it))]));
  return [...attendus].filter(m => presents.has(m)).length / attendus.size;
}

export function rapport({ pages, items, exclus, seuil = 0.6 }) {
  const ecartes = exclus.map(comparable);
  const manquants = [];
  pages.forEach((texte, i) => {
    const page = i + 1;
    const voisins = items.filter(it => Math.abs(it.page - page) <= 1).map(it => it.texte);
    for (const segment of segmenter(texte)) {
      const debut = comparable(segment).replace(/^[-•]\s*/, '');
      if (ecartes.some(e => debut.startsWith(e))) continue;
      const score = couverture(segment, voisins);
      if (score < seuil) manquants.push({ page, segment, score });
    }
  });
  return manquants;
}
