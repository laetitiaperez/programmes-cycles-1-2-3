import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLexique, filterLexique } from '../lib/lexique.js';
import { classes, francais, hg } from './fixtures.mjs';

test('termes triés, fusion casse/accents, occurrences par fil', () => {
  const [fr] = buildLexique([francais], classes);
  assert.equal(fr.matiere.id, 'francais');
  assert.deepEqual(fr.termes.map(t => t.terme),
    ['50 mots par minute', 'correspondances graphèmes-phonèmes', 'fluence', 'groupes de souffle', 'lecture']);
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
test('lexique : termes de la couche complète', () => {
  const lex = buildLexique([francais], classes);
  const t = lex[0].termes.find(x => x.terme === 'groupes de souffle');
  assert.ok(t, 'terme de couche 2 absent');
  assert.deepEqual(t.occurrences.map(o => [o.filId, o.classes]), [['fluence', ['CE1']]]);
  const t50 = lex[0].termes.find(x => x.terme === '50 mots par minute');
  assert.deepEqual(t50.occurrences.map(o => o.classes), [['CP']]);
});

test('buildLexique : termes des idées-forces dans « Principes des cycles »', () => {
  const cycles = [{ id: 2, classes: ['CP', 'CE1', 'CE2'], idees: [{ texte: 'Le [[concret et l’abstrait]].', bloc: 0 }], complet: { blocs: [] } }];
  const lex = buildLexique([francais], classes, cycles);
  const g = lex.at(-1);
  assert.deepEqual(g.matiere, { id: 'cycles', nom: 'Principes des cycles' });
  assert.deepEqual(g.termes.map(t => t.terme), ['concret et l’abstrait']);
  assert.deepEqual(g.termes[0].occurrences, [{ cycle: 2, filNom: 'Cycle 2', classes: ['CP', 'CE1', 'CE2'] }]);
  assert.equal(buildLexique([francais], classes).length, 1);
});
