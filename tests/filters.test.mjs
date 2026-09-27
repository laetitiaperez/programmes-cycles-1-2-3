import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterFil, filterMatiere, selectedClasses } from '../lib/filters.js';
import { classes, francais } from './fixtures.mjs';

const fluence = francais.domaines[0].fils[0];
const decodage = francais.domaines[0].fils[1];

test('sans filtre : fil complet', () => assert.deepEqual(filterFil(fluence, classes, {}), fluence));
test('classe CE1 : socle + étapes CE1', () => {
  const r = filterFil(fluence, classes, { classe: 'CE1' });
  assert.ok(r.socle);
  assert.equal(r.etapes.length, 2);
  assert.ok(r.etapes.every(e => e.classes.includes('CE1')));
});
test('classe CM1 : fil masqué', () => assert.equal(filterFil(fluence, classes, { classe: 'CM1' }), null));
test('cycle 2 → CP, CE1, CE2', () => assert.deepEqual([...selectedClasses(classes, { cycle: '2' })], ['CP', 'CE1', 'CE2']));
test('la classe prime sur le cycle', () => assert.deepEqual([...selectedClasses(classes, { cycle: '3', classe: 'CP' })], ['CP']));
test('aucun filtre de classe → null', () => assert.equal(selectedClasses(classes, {}), null));
test('filtre type attendu', () => {
  const r = filterFil(fluence, classes, { types: ['attendu'] });
  assert.deepEqual(r.etapes.map(e => e.type), ['attendu', 'attendu']);
});
test('recherche insensible à la casse (nom du fil) → fil entier', () => {
  assert.equal(filterFil(fluence, classes, { q: 'FLUENCE' }).etapes.length, 3);
});
test('recherche insensible aux accents', () => {
  assert.equal(filterFil(decodage, classes, { q: 'graphemes' }).etapes.length, 1);
});
test('recherche dans une étape seulement', () => {
  const r = filterFil(fluence, classes, { q: 'theatralisee' });
  assert.deepEqual(r.etapes.map(e => e.type), ['exemple']);
  assert.ok(r.socle);
});
test('recherche sans résultat', () => assert.equal(filterFil(fluence, classes, { q: 'zzz' }), null));
test('socle seul si aucune étape pour la classe', () => {
  const r = filterFil(fluence, classes, { classe: 'CE2' });
  assert.ok(r.socle);
  assert.deepEqual(r.etapes, []);
});
test('filtre type sans étape → masqué même avec socle', () => {
  assert.equal(filterFil(fluence, classes, { classe: 'CE2', types: ['attendu'] }), null);
});
test('filterMatiere : null si rien, fils vides retirés', () => {
  assert.equal(filterMatiere(francais, classes, { classe: 'CM1' }), null);
  assert.deepEqual(filterMatiere(francais, classes, { classe: 'CE1' }).domaines[0].fils.map(f => f.id), ['fluence']);
});
