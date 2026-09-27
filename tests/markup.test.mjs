import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkup, extractKeywords, stripMarkup } from '../lib/markup.js';

test('découpe texte et mots-clés', () => {
  assert.deepEqual(parseMarkup('Lire avec [[fluence]] et [[compréhension]].'), [
    { kind: 'text', value: 'Lire avec ' }, { kind: 'kw', value: 'fluence' },
    { kind: 'text', value: ' et ' }, { kind: 'kw', value: 'compréhension' }, { kind: 'text', value: '.' },
  ]);
});
test('texte sans balise', () => assert.deepEqual(parseMarkup('abc'), [{ kind: 'text', value: 'abc' }]));
test('texte vide', () => assert.deepEqual(parseMarkup(''), []));
test('balise non fermée', () => assert.throws(() => parseMarkup('a [[fluence b'), /non fermée/));
test(']] orphelin', () => assert.throws(() => parseMarkup('a fluence]] b'), /orphelin/));
test('balise vide', () => assert.throws(() => parseMarkup('a [[ ]] b'), /vide/));
test('balise imbriquée', () => assert.throws(() => parseMarkup('[[a [[b]]'), /imbriquée/));
test('extractKeywords et stripMarkup', () => {
  assert.deepEqual(extractKeywords('x [[a]] y [[b c]]'), ['a', 'b c']);
  assert.equal(stripMarkup('x [[a]] y'), 'x a y');
});
