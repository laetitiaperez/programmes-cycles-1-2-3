import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateData } from '../lib/validate.js';
import { data } from './fixtures.mjs';

const fil = (d, m, i) => d.matieres[m].domaines[0].fils[i];
const expectError = (d, re) => {
  const errors = validateData(d);
  assert.ok(errors.some(e => re.test(e)), `attendu ${re}, obtenu :\n${errors.join('\n')}`);
};

test('données valides → aucune erreur', () => assert.deepEqual(validateData(data()), []));
test('classe inconnue', () => { const d = data(); fil(d, 0, 0).etapes[0].classes = ['CE3']; expectError(d, /classe inconnue « CE3 »/); });
test('classes hors ordre', () => { const d = data(); fil(d, 0, 0).etapes[0].classes = ['CE1', 'CP']; expectError(d, /classes hors ordre/); });
test('étapes hors ordre', () => {
  const d = data(); const e = fil(d, 0, 0).etapes; [e[0], e[1]] = [e[1], e[0]]; expectError(d, /étapes hors ordre/);
});
test('source inconnue', () => { const d = data(); fil(d, 0, 0).etapes[0].sources = ['xx']; expectError(d, /source inconnue « xx »/); });
test('source qui ne couvre pas la classe', () => {
  const d = data(); fil(d, 1, 0).etapes[0].classes = ['CE1']; expectError(d, /hg-c2-2026 ne s’applique pas à CE1/);
});
test('sources manquantes hors crpe', () => { const d = data(); fil(d, 0, 0).etapes[0].sources = []; expectError(d, /sources manquantes/); });
test('crpe sans source autorisé', () => {
  const d = data(); fil(d, 0, 1).etapes.push({ classes: ['CP'], type: 'crpe', texte: 'Astuce.', sources: [] });
  assert.deepEqual(validateData(d), []);
});
test('balise non fermée', () => { const d = data(); fil(d, 0, 0).etapes[0].texte = 'a [[b'; expectError(d, /non fermée/); });
test('type inconnu', () => { const d = data(); fil(d, 0, 0).etapes[0].type = 'truc'; expectError(d, /type inconnu « truc »/); });
test('page invalide', () => { const d = data(); fil(d, 0, 0).etapes[0].page = 0; expectError(d, /page invalide/); });
test('id de fil en double', () => { const d = data(); fil(d, 0, 1).id = 'fluence'; expectError(d, /id de fil en double/); });
test('fil vide', () => { const d = data(); d.matieres[0].domaines[0].fils.push({ id: 'v', nom: 'V', etapes: [] }); expectError(d, /fil vide/); });
test('nouveauEn hors classes2026', () => { const d = data(); d.textes[1].nouveauEn = ['CE1']; expectError(d, /nouveauEn.*CE1/); });
test('pdf non https', () => { const d = data(); d.textes[0].pdf = 'http://x'; expectError(d, /pdf/); });
