import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classesDuCycle, disciplinesDuCycle, intentionsCompletesDuCycle, sectionsDuCycle } from '../lib/cycles.js';
import { classes, textes as textesBase, francais, hg } from './fixtures.mjs';

const textes = [...textesBase,
  { id: 'c1-2026', titre: 'Programme de l’école maternelle', matiere: 'c1', bo: 'BO', classes2026: ['PS', 'MS', 'GS'], nouveauEn: [], pdf: 'https://example.org/c1.pdf' },
  { id: 'fr-ex-cp', titre: 'Exemples CP', matiere: 'francais', bo: 'Éduscol', classes2026: ['CP'], nouveauEn: [], pdf: 'https://example.org/ex.pdf' },
];
const maternelle = { id: 'maternelle', nom: 'École maternelle — principes', intentions: 'Principes.', domaines: [{ id: 'ecole', nom: 'École', fils: [
  { id: 'ambition', nom: 'Ambition', etapes: [{ classes: ['PS', 'MS', 'GS'], type: 'notion', texte: 'Ambition.', sources: ['c1-2026'] }] }] }] };
const arts = { id: 'arts', nom: 'Enseignements artistiques', nomMaternelle: 'Agir à travers les activités artistiques',
  intentions: 'Maternelle : [[PEAC]]. Cycles 2 et 3 : arts plastiques.',
  intentionsParCycle: { 1: '[[PEAC]].', 2: 'Arts plastiques.', tous: 'Pour tous.' },
  domaines: [
    { id: 'visuels', nom: 'Arts visuels', fils: [{ id: 'dessin', nom: 'Dessin', etapes: [
      { classes: ['PS'], type: 'notion', texte: 'Dessiner.', sources: ['c1-2026'] },
      { classes: ['CP'], type: 'notion', texte: 'Dessiner encore.', sources: ['fr-c2-2024'] }] }] },
    { id: 'musique', nom: 'Musique', fils: [{ id: 'chant', nom: 'Chant', etapes: [
      { classes: ['CE1'], type: 'notion', texte: 'Chanter.', sources: ['fr-c2-2024'] }] }] },
  ] };
const fr = structuredClone(francais);
fr.domaines[0].fils[1].etapes.push({ classes: ['CP'], type: 'exemple', texte: 'Exemple.', sources: ['fr-ex-cp'] });
const matieres = [fr, hg, arts, maternelle];

test('classesDuCycle : cycle 2 → CP, CE1, CE2', () => assert.deepEqual(classesDuCycle(classes, 2), ['CP', 'CE1', 'CE2']));
test('disciplinesDuCycle : seules les matières ayant un fil dans le cycle, dans l’ordre reçu', () => {
  assert.deepEqual(disciplinesDuCycle(matieres, classes, 2, textes).map(d => d.matiere.id), ['francais', 'hg', 'arts']);
  assert.deepEqual(disciplinesDuCycle(matieres, classes, 3, textes).map(d => d.matiere.id), []);
});
test('disciplinesDuCycle : cycle 1 exclut « maternelle » et prend nomMaternelle', () => {
  const d = disciplinesDuCycle(matieres, classes, 1, textes);
  assert.deepEqual(d.map(x => x.matiere.id), ['arts']);
  assert.equal(d[0].nom, 'Agir à travers les activités artistiques');
  assert.equal(disciplinesDuCycle(matieres, classes, 2, textes).find(x => x.matiere.id === 'arts').nom, 'Enseignements artistiques');
});
test('disciplinesDuCycle : principes = cycle puis « tous » ; aucun → liste vide', () => {
  const d2 = disciplinesDuCycle(matieres, classes, 2, textes);
  assert.deepEqual(d2.find(x => x.matiere.id === 'arts').principes, ['Arts plastiques.', 'Pour tous.']);
  assert.deepEqual(d2.find(x => x.matiere.id === 'hg').principes, []);
});
test('disciplinesDuCycle : étiquettes HG cycle 2 regroupées par texte', () => {
  const hgC2 = disciplinesDuCycle(matieres, classes, 2, textes).find(x => x.matiere.id === 'hg');
  assert.deepEqual(hgC2.etiquettes, [{ texteId: 'hg-c2-2026', classes: ['CP'] }, { texteId: 'qlm-et-2020', classes: ['CE1', 'CE2'] }]);
});
test('disciplinesDuCycle : un exemple *-ex-* ne donne pas d’étiquette', () => {
  const frC2 = disciplinesDuCycle(matieres, classes, 2, textes).find(x => x.matiere.id === 'francais');
  assert.deepEqual(frC2.etiquettes.map(e => e.texteId), ['fr-c2-2024']);
});
test('disciplinesDuCycle : domaines limités à ceux qui ont un fil dans le cycle', () => {
  const a1 = disciplinesDuCycle(matieres, classes, 1, textes)[0];
  assert.deepEqual(a1.domaines, [{ id: 'visuels', nom: 'Arts visuels' }]);
  const a2 = disciplinesDuCycle(matieres, classes, 2, textes).find(x => x.matiere.id === 'arts');
  assert.deepEqual(a2.domaines.map(d => d.id), ['visuels', 'musique']);
});
test('intentionsCompletesDuCycle : garde les blocs dont la source vaut pour le cycle', () => {
  const m = { intentionsCompletes: [
    { titre: 'Maternelle', source: 'c1-2026', page: 1, items: ['a'] },
    { titre: 'Cycle 2', source: 'fr-c2-2024', page: 2, items: ['b'] }] };
  const idx = new Map(textes.map(t => [t.id, t]));
  assert.deepEqual(intentionsCompletesDuCycle(m, idx, classes, 2).map(b => b.titre), ['Cycle 2']);
  assert.deepEqual(intentionsCompletesDuCycle({}, idx, classes, 2), []);
});

test('sectionsDuCycle : chaque groupe d’idées emporte son bloc et les sous-parties qui suivent', () => {
  const b = (t) => ({ titre: t, source: 's', page: 1, items: ['x'] });
  const cycle = { idees: [{ texte: 'A', bloc: 1 }, { texte: 'B', bloc: 3 }, { texte: 'C', bloc: 3 }],
    complet: { blocs: [b('0'), b('1'), b('2'), b('3'), b('4')] } };
  const s = sectionsDuCycle(cycle);
  assert.deepEqual(s.map(x => x.idees.map(i => i.texte)), [['A'], ['B', 'C']]);
  // les blocs avant la première idée vont dans la première section ; aucun bloc perdu ni dupliqué
  assert.deepEqual(s.map(x => x.blocs.map(bl => bl.titre)), [['0', '1', '2'], ['3', '4']]);
});
test('sectionsDuCycle : sans idées, une seule section avec tous les blocs', () => {
  const cycle = { idees: [], complet: { blocs: [{ titre: 'T', items: ['x'] }] } };
  assert.deepEqual(sectionsDuCycle(cycle), [{ idees: [], blocs: [{ titre: 'T', items: ['x'] }] }]);
});
