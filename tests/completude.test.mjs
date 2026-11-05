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
test('segmenter : listes d’œuvres (puce privée) écartées', () => {
  assert.deepEqual(segmenter('Lire une œuvre longue et se l’approprier pleinement\n Marcel Aymé, Les contes du chat perché\nGallimard jeunesse'),
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
