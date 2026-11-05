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
test('chaque source doit couvrir une classe de l’étape', () => {
  const d = data();
  fil(d, 1, 0).etapes[1].sources = ['qlm-et-2020', 'hg-c2-2026']; // étape CE1-CE2, hg-c2-2026 = CP seulement
  expectError(d, /hg-c2-2026 ne s’applique à aucune des classes CE1, CE2/);
});
test('âge manquant', () => { const d = data(); delete d.classes[0].age; expectError(d, /classes\/PS : âge invalide/); });

const cp = (d) => fil(d, 0, 0).complet;
test('données valides avec complet → aucune erreur', () => { const d = data(); assert.ok(cp(d).CP); assert.deepEqual(validateData(d), []); });
test('complet : classe inconnue', () => { const d = data(); cp(d).CE3 = cp(d).CP; expectError(d, /complet : classe inconnue « CE3 »/); });
test('complet : classe absente du fil', () => { const d = data(); cp(d).CM1 = cp(d).CP; expectError(d, /complet CM1 : classe absente des étapes du fil/); });
test('complet : aucun bloc', () => { const d = data(); cp(d).CP.blocs = []; expectError(d, /complet CP : aucun bloc/); });
test('complet : page manquante', () => { const d = data(); delete cp(d).CP.blocs[0].page; expectError(d, /complet CP\/bloc 1 : page invalide/); });
test('complet : source inconnue', () => { const d = data(); cp(d).CP.blocs[0].source = 'xx'; expectError(d, /complet CP\/bloc 1 : source inconnue « xx »/); });
test('complet : source hors classe', () => { const d = data(); cp(d).CP.blocs[0].source = 'qlm-et-2020'; expectError(d, /complet CP\/bloc 1 : qlm-et-2020 ne s’applique pas à CP en 2026-27/); });
test('complet : aucun item', () => { const d = data(); cp(d).CP.blocs[0].items = []; expectError(d, /complet CP\/bloc 1 : aucun item/); });
test('complet : balise non fermée', () => { const d = data(); cp(d).CP.blocs[0].items = ['a [[b']; expectError(d, /complet CP\/bloc 1.*non fermée/); });
test('complet : reconduit d’une classe non antérieure', () => {
  const d = data(); cp(d).CP.reconduit = [{ de: 'CE1', texte: 'Lire 70 mots par minute.' }]; expectError(d, /reconduit de CE1 : classe non antérieure/);
});
test('complet : reconduit introuvable', () => { const d = data(); cp(d).CE1.reconduit[0].texte = 'Autre chose.'; expectError(d, /reconduit de CP introuvable/); });
test('complet : reconduit avec apostrophe typographique', () => {
  const d = data(); cp(d).CP.blocs[0].items.push('Lire l’album.'); cp(d).CE1.reconduit.push({ de: 'CP', texte: "Lire l'album." });
  assert.deepEqual(validateData(d), []);
});
test('coucheComplete : complet manquant', () => { const d = data(); d.matieres[0].coucheComplete = true; expectError(d, /decodage : complet manquant pour CP/); });
test('intentionsCompletes valides', () => {
  const d = data(); d.matieres[0].intentionsCompletes = [{ titre: 'Principes', source: 'fr-c2-2024', page: 3, items: ['Lire chaque jour.'] }];
  assert.deepEqual(validateData(d), []);
});
test('intentionsCompletes : bloc invalide', () => {
  const d = data(); d.matieres[0].intentionsCompletes = [{ titre: 'Principes', source: 'xx', page: 0, items: [] }];
  expectError(d, /intentions complètes\/bloc 1 : source inconnue « xx »/);
  expectError(d, /intentions complètes\/bloc 1 : page invalide/);
  expectError(d, /intentions complètes\/bloc 1 : aucun item/);
});
test('coucheComplete : une étape multi-classes demande la couche 2 à sa première classe seulement', () => {
  const d = data();
  d.matieres[1].coucheComplete = true;
  const frise = d.matieres[1].domaines[0].fils[0]; // étapes CP puis CE1-CE2
  frise.complet = {
    CP: { blocs: [{ titre: 'Objectifs', source: 'hg-c2-2026', page: 2, items: ['Frise de l’année.'] }] },
    CE1: { blocs: [{ titre: 'Objectifs', source: 'qlm-et-2020', page: 3, items: ['Repères sur la frise.'] }] },
  };
  assert.deepEqual(validateData(d), []);
});
