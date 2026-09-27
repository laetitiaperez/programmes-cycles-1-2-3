import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLexique, filterLexique } from '../lib/lexique.js';
import { classes, francais, hg } from './fixtures.mjs';

test('termes triés, fusion casse/accents, occurrences par fil', () => {
  const [fr] = buildLexique([francais], classes);
  assert.equal(fr.matiere.id, 'francais');
  assert.deepEqual(fr.termes.map(t => t.terme),
    ['50 mots par minute', 'correspondances graphèmes-phonèmes', 'fluence', 'lecture']);
  const fluence = fr.termes.find(t => t.terme === 'fluence');
  assert.deepEqual(fluence.occurrences,
    [{ domaineId: 'lecture', filId: 'fluence', filNom: 'Fluence', classes: ['CP', 'CE1', 'CE2'] }]);
  const lecture = fr.termes.find(t => t.terme === 'lecture');
  assert.deepEqual(lecture.occurrences, [{ domaineId: null, filId: null, filNom: 'Intentions', classes: [] }]);
});
test('fusion « Frise » / « frise », classes ordonnées', () => {
  const [, h] = buildLexique([francais, hg], classes);
  const frise = h.termes.find(t => t.terme === 'Frise chronologique');
  assert.deepEqual(frise.occurrences[0].classes, ['CP', 'CE1', 'CE2']);
});
test('filterLexique', () => {
  const r = filterLexique(buildLexique([francais, hg], classes), 'FRISE');
  assert.deepEqual(r.map(e => e.matiere.id), ['hg']);
  assert.deepEqual(r[0].termes.map(t => t.terme), ['Frise chronologique']);
});
