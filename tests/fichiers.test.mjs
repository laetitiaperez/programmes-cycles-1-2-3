import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blocsAVerifier } from '../lib/fichiers.js';
import { francais } from './fixtures.mjs';

test('blocsAVerifier inclut la couche complète', () => {
  const blocs = blocsAVerifier(francais);
  assert.deepEqual(blocs.find(b => b.ou === 'lecture/fluence/complet CP/bloc 1'),
    { ou: 'lecture/fluence/complet CP/bloc 1', texte: 'Lire [[50 mots par minute]] après préparation.', sources: ['fr-c2-2024'] });
});
test('blocsAVerifier garde intentions, socles et étapes', () => {
  const blocs = blocsAVerifier(francais).filter(b => !b.ou.includes('complet'));
  assert.equal(blocs.length, 6); // intentions + 1 socle + 4 étapes
  assert.equal(blocs[0].ou, 'intentions');
});
test('blocsAVerifier inclut les reconduits avec les sources de la classe d’origine', () => {
  const r = blocsAVerifier(francais).find(b => b.ou === 'lecture/fluence/complet CE1/reconduit de CP');
  assert.deepEqual(r.sources, ['fr-c2-2024']);
});
test('blocsAVerifier inclut les intentions complètes', () => {
  const m = { ...francais, intentionsCompletes: [{ titre: 'Principes', source: 'fr-c2-2024', page: 3, items: ['La [[fluence]] chaque jour.'] }] };
  assert.ok(blocsAVerifier(m).some(b => b.ou === 'intentions complètes/bloc 1' && b.sources[0] === 'fr-c2-2024'));
});
