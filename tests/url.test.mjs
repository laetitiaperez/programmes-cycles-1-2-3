import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, toHash, sanitizeState, DEFAULT_STATE, VUES } from '../lib/url.js';
import { data } from './fixtures.mjs';

const d = data();
const ctx = { classes: d.classes, matieres: d.matieres };
const san = (h) => sanitizeState(parseHash(h), ctx);

test('vues', () => assert.deepEqual(VUES, ['accueil', 'carte', 'classe', 'lexique', 'biblio', 'recherche']));
test('hash vide → accueil', () => assert.deepEqual(parseHash(''), { ...DEFAULT_STATE }));
test('toHash : défaut → chaîne vide', () => assert.equal(toHash(DEFAULT_STATE), ''));
test('aller-retour', () => {
  const h = '#vue=carte&m=francais&d=lecture&fil=fluence&c=CE1';
  assert.equal(toHash(parseHash(h)), h);
});
test('aller-retour avec accents et apostrophes', () => {
  const s = { ...DEFAULT_STATE, vue: 'recherche', q: 'chaîne d’accords' };
  assert.deepEqual(parseHash(toHash(s)), s);
});
test('carte : le fil fixe son domaine', () => {
  assert.deepEqual(san('#vue=carte&m=francais&fil=decodage&c=CP'),
    { ...DEFAULT_STATE, vue: 'carte', m: 'francais', d: 'lecture', fil: 'decodage', c: 'CP' });
});
test('anciens liens : vue=matiere avec classe', () => {
  assert.deepEqual(san('#vue=matiere&m=hg&c=CE1'), { ...DEFAULT_STATE, vue: 'carte', m: 'hg' });
});
test('anciens liens : m et f sans vue', () => {
  assert.deepEqual(san('#m=francais&f=fluence'), { ...DEFAULT_STATE, vue: 'carte', m: 'francais', d: 'lecture', fil: 'fluence' });
});
test('fil inconnu', () => assert.equal(san('#vue=carte&m=francais&fil=inconnu').fil, ''));
test('classe inconnue', () => assert.equal(san('#vue=classe&c=CE3').c, ''));
test('classe hors du fil', () => assert.equal(san('#vue=carte&m=hg&fil=frise&c=6e').c, ''));
test('domaine inconnu', () => assert.equal(san('#vue=carte&m=hg&d=xx').d, ''));
test('carte sans matière → accueil', () => assert.equal(san('#vue=carte&m=truc').vue, 'accueil'));
test('recherche sans q → accueil', () => assert.equal(san('#vue=recherche').vue, 'accueil'));
test('vue classe garde sa classe', () => assert.deepEqual(san('#vue=classe&c=CE1'), { ...DEFAULT_STATE, vue: 'classe', c: 'CE1' }));
test('lexique et biblio reconnus', () => {
  assert.equal(san('#vue=lexique').vue, 'lexique');
  assert.equal(san('#vue=biblio&q=fluence').q, 'fluence');
});
