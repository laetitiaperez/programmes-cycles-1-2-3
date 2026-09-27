import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textesPourClasse, nouveautesCycle, estNouveau, sourcesDivergentes, indexTextes } from '../lib/textes.js';
import { classes, textes, francais, hg } from './fixtures.mjs';

test('textes applicables en CE1', () => {
  assert.deepEqual(textesPourClasse(textes, 'CE1').map(t => t.id), ['fr-c2-2024', 'qlm-et-2020']);
});
test('nouveautés du cycle 2', () => {
  const r = nouveautesCycle(textes, classes, 2);
  assert.deepEqual(r.map(t => [t.id, t.classesCycle]), [['hg-c2-2026', ['CP']]]);
  assert.deepEqual(nouveautesCycle(textes, classes, 3), []);
});
test('estNouveau', () => {
  const tx = indexTextes(textes);
  const [cp, ce] = hg.domaines[0].fils[0].etapes;
  assert.equal(estNouveau(cp, tx), true);
  assert.equal(estNouveau(ce, tx), false);
});
test('sourcesDivergentes', () => {
  assert.equal(sourcesDivergentes(hg.domaines[0].fils[0]), true);
  assert.equal(sourcesDivergentes(francais.domaines[0].fils[0]), false);
});
