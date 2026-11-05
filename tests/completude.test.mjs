import { test } from 'node:test';
import assert from 'node:assert/strict';
import { segmenter, motsPleins, couverture, rapport } from '../lib/completude.js';

test('segmenter : puces et lignes de continuation', () => {
  const s = segmenter('Objectifs\n- Comprendre les notions de masculin et de féminin.\n- Comprendre les notions de singulier et de pluriel\n(plusieurs, plus qu’un).');
  assert.equal(s.length, 2);
  assert.ok(s[1].endsWith('(plusieurs, plus qu’un).'));
});
test('segmenter : lignes sans puce (cycle 3)', () => {
  const s = segmenter('Repérer et nommer le nom noyau dans le groupe nominal\nAborder la notion d’épithète dans le groupe\nnominal étendu');
  assert.deepEqual(s, ['Repérer et nommer le nom noyau dans le groupe nominal', 'Aborder la notion d’épithète dans le groupe nominal étendu']);
});
test('segmenter : coupure de mot en fin de ligne recollée', () => {
  assert.deepEqual(segmenter('Identifier les compléments circonstan-\nciels dans une phrase simple'), ['Identifier les compléments circonstanciels dans une phrase simple']);
});
test('motsPleins', () => assert.deepEqual(motsPleins('La chaîne d’accords des noms'), new Set(['chaine', 'accord', 'nom'])));
test('couverture complète malgré balises et apostrophes', () => {
  assert.equal(couverture('Reconnaître le GN et la chaîne d’accords', ["Reconnaître le [[GN]] ; [[chaîne d'accords]]"]), 1);
});
test('rapport : segment non repris, puis exclu', () => {
  const page = '- Comprendre les notions de masculin et de féminin.\n- Observer les différentes formes verbales fréquentes et régulières.';
  const items = [{ page: 1, texte: 'Comprendre les notions de masculin et de féminin.' }];
  const r = rapport({ pages: [page], items, exclus: [] });
  assert.equal(r.length, 1);
  assert.equal(r[0].page, 1);
  assert.match(r[0].segment, /^- Observer/);
  assert.deepEqual(rapport({ pages: [page], items, exclus: ['Observer les différentes formes'] }), []);
});
test('rapport : items de la page voisine comptent, pas ceux à deux pages', () => {
  const pages = ['', '- Observer les différentes formes verbales fréquentes et régulières.', '', ''];
  const texte = 'Observer les différentes formes verbales fréquentes et régulières.';
  assert.deepEqual(rapport({ pages, items: [{ page: 3, texte }], exclus: [] }), []);
  assert.equal(rapport({ pages, items: [{ page: 4, texte }], exclus: [] }).length, 1);
});
test('segmenter : listes d’œuvres (puce privée) écartées sur option', () => {
  assert.deepEqual(segmenter('Lire une œuvre longue et se l’approprier pleinement\n\uF0B7 Marcel Aymé, Les contes du chat perché\nGallimard jeunesse', { listesOeuvres: true }),
    ['Lire une œuvre longue et se l’approprier pleinement']);
});
test('segmenter : en-têtes de tableau et d’âge écartés', () => {
  assert.deepEqual(segmenter([
    'Objectifs d’apprentissage Exemples de réussite',
    '• À aborder avant 4 ans',
    '• À partir de 4 ans ou dès que les apprentissages précédents ont pu être observés',
    '- Diversifier les pronoms employés dans les phrases.',
  ].join('\n')), ['- Diversifier les pronoms employés dans les phrases.']);
});
test('segmenter : puces « − » (U+2212)', () => {
  assert.deepEqual(segmenter('Le professeur organise la classe :\n− aborde la diversité linguistique par l’écoute des sons ;\n− a recours à des cartes-images, des jeux, des albums.'),
    ['Le professeur organise la classe :', '− aborde la diversité linguistique par l’écoute des sons ;', '− a recours à des cartes-images, des jeux, des albums.'].filter(s => s !== 'Le professeur organise la classe :'));
});
test('rapport : exclusion d’une puce « − »', () => {
  const page = '− aborde la diversité linguistique par l’écoute des sons et de la langue choisie ;';
  assert.deepEqual(rapport({ pages: [page], items: [], exclus: ['aborde la diversité linguistique'] }), []);
});
test('segmenter : puce privée ordinaire gardée hors listes d’œuvres', () => {
  assert.deepEqual(segmenter('Lire chaque jour des textes variés\n\uF02D l’apprentissage puis l’automatisation du décodage des mots ;'),
    ['Lire chaque jour des textes variés', '\uF02D l’apprentissage puis l’automatisation du décodage des mots ;']);
});
test('rapport : option listesOeuvres transmise', () => {
  const page = '\uF0B7 Marcel Aymé, Les contes bleus du chat perché, Gallimard';
  assert.equal(rapport({ pages: [page], items: [], exclus: [] }).length, 1);
  assert.equal(rapport({ pages: [page], items: [], exclus: [], listesOeuvres: true }).length, 0);
});
test('segmenter : en-têtes et titres des listes d’œuvres écartés sur option', () => {
  const page = 'Savourer le gout des mots, imaginer et créer en poésie\nLes élèves pourront lire notamment :\nŒuvres proposées en lecture cursive\nPistes de prolongements artistiques et culturels\nIl lit des poèmes de siècles différents à voix haute en classe.';
  assert.deepEqual(segmenter(page, { listesOeuvres: true }), ['Il lit des poèmes de siècles différents à voix haute en classe.']);
  assert.equal(segmenter(page).length, 5);
});

test('borner : garde le texte entre debut et fin, conserve les sauts de page', async () => {
  const { borner } = await import('../lib/completude.js');
  const brut = 'avant\fTitre A\ncorps\fsuite\nFin B\napres';
  const r = borner(brut, { debut: 'Titre A', fin: 'Fin B' });
  assert.equal(r.split('\f').length, 3);
  assert.ok(!r.includes('avant') && !r.includes('apres') && !r.includes('Fin B'));
  assert.ok(r.includes('Titre A') && r.includes('corps') && r.includes('suite'));
});
test('borner : sans marqueurs, renvoie le texte inchangé', async () => {
  const { borner } = await import('../lib/completude.js');
  assert.equal(borner('a\fb', {}), 'a\fb');
});
