import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, toHash, sanitizeState, DEFAULT_STATE } from '../lib/url.js';
import { classes } from './fixtures.mjs';

const ctx = { classes, matiereIds: ['francais', 'hg'], types: ['attendu', 'exemple', 'notion'] };

test('hash vide → état par défaut', () => assert.deepEqual(parseHash(''), { ...DEFAULT_STATE, t: [] }));
test('parse complet', () => {
  assert.deepEqual(parseHash('#vue=classe&c=CE1&t=attendu,exemple&q=fluence'),
    { vue: 'classe', m: '', cy: '', c: 'CE1', t: ['attendu', 'exemple'], q: 'fluence', f: '' });
});
test('vue inconnue → matiere', () => assert.equal(parseHash('#vue=nimporte').vue, 'matiere'));
test('toHash : défaut → chaîne vide', () => assert.equal(toHash(DEFAULT_STATE), ''));
test('toHash', () => assert.equal(toHash({ ...DEFAULT_STATE, vue: 'classe', c: 'CE1', t: ['attendu'] }), '#vue=classe&c=CE1&t=attendu'));
test('aller-retour avec accents et espaces', () => {
  const s = { ...DEFAULT_STATE, m: 'hg', q: 'démarche d’investigation', t: ['notion'] };
  assert.deepEqual(parseHash(toHash(s)), s);
});
test('sanitizeState ignore les valeurs inconnues', () => {
  const s = sanitizeState(parseHash('#c=CE3&m=truc&t=xx,notion&cy=7'), ctx);
  assert.deepEqual([s.c, s.m, s.t, s.cy], ['', '', ['notion'], '']);
});
test('sanitizeState : la classe fixe le cycle', () => {
  assert.equal(sanitizeState(parseHash('#c=CE1&cy=3'), ctx).cy, '2');
});
test('vue bibliothèque reconnue', () => assert.equal(parseHash('#vue=biblio').vue, 'biblio'));
