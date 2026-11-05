import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classesDuFil, friseDuFil, vueClasse, rechercher, grouperTextes } from '../lib/carte.js';
import { data } from './fixtures.mjs';

const order = (classes) => new Map(classes.map((c, i) => [c.id, i]));
const filDe = (m, id) => m.domaines.flatMap(d => d.fils).find(f => f.id === id);
function jeu() {
  const d = data();
  d.matieres.push({ id: 'maternelle', nom: 'École maternelle — principes', intentions: 'x', domaines: [{ id: 'ecole', nom: 'École', fils: [
    { id: 'jeu', nom: 'Apprendre en jouant', etapes: [{ classes: ['PS'], type: 'notion', texte: 'Le jeu.', sources: ['c1-2026'] }] },
  ] }] });
  filDe(d.matieres[0], 'fluence').complet.CE1.blocs[0].items.push('Réaliser la [[chaîne d’accords]] dans le groupe nominal.');
  return d;
}

test('classesDuFil : union triée socle + étapes', () => {
  const d = jeu();
  assert.deepEqual(classesDuFil(filDe(d.matieres[0], 'fluence'), order(d.classes)), ['CP', 'CE1', 'CE2']);
});
test('frise', () => {
  const d = jeu();
  const f = friseDuFil(filDe(d.matieres[0], 'fluence'), d.classes);
  assert.deepEqual(f.map(c => c.classe), ['CP', 'CE1', 'CE2']);
  assert.equal(f[0].age, 6); assert.equal(f[0].cycle, 2);
  assert.equal(f[0].etapes.length, 1); assert.equal(f[0].complet.blocs.length, 1);
  assert.equal(f[2].etapes.length, 0); assert.ok(f[2].socle);
  assert.equal(f[1].etapes.length, 2);
});
test('frise sans complet', () => {
  const d = jeu();
  assert.equal(friseDuFil(filDe(d.matieres[0], 'decodage'), d.classes)[0].complet, null);
});
test('étape multi-classes', () => {
  const d = jeu();
  const f = friseDuFil(filDe(d.matieres[1], 'frise'), d.classes);
  const multi = (c) => f.find(x => x.classe === c).etapes.some(e => e.classes.join(' ') === 'CE1 CE2');
  assert.ok(multi('CE1') && multi('CE2'));
  const v = vueClasse(d.matieres, 'CE2');
  const hg = v.find(x => x.matiere.id === 'hg');
  assert.ok(hg.domaines[0].fils.some(x => x.fil.id === 'frise' && x.etapes.length === 1));
});
test('vue classe maternelle', () => {
  const d = jeu();
  const ids = (c) => vueClasse(d.matieres, c).map(x => x.matiere.id);
  assert.ok(ids('PS').includes('maternelle'));
  assert.ok(!ids('CP').includes('maternelle'));
  assert.deepEqual(ids('GS'), ['maternelle'].filter(() => false));
  assert.ok(ids('CE2').includes('francais')); // le socle de fluence couvre CE2
});
test('recherche apostrophes', () => {
  const d = jeu();
  const r = rechercher(d.matieres, "chaine d'accords");
  assert.equal(r.length, 1);
  assert.equal(r[0].filId, 'fluence'); assert.equal(r[0].classe, 'CE1'); assert.equal(r[0].matiereId, 'francais');
  assert.ok(!r[0].extrait.includes('[['));
});
test('recherche courte', () => assert.deepEqual(rechercher(jeu().matieres, 'a'), []));
test('recherche : un résultat par fil et par classe', () => {
  const r = rechercher(jeu().matieres, 'minute');
  const cles = r.map(x => `${x.filId}/${x.classe}`);
  assert.equal(new Set(cles).size, cles.length);
  assert.ok(cles.includes('fluence/CP') && cles.includes('fluence/CE1'));
});
test('grouperTextes : ordre des matières', () => {
  const g = grouperTextes(jeu().textes);
  assert.deepEqual(g.map(x => x.matiere), ['francais', 'hg']);
});
test('frise : renvoi vers la première classe d’une étape multi-classes', () => {
  const d = jeu();
  const f = filDe(d.matieres[1], 'frise');
  f.complet = { CE1: { blocs: [{ titre: 'Objectifs', source: 'qlm-et-2020', page: 3, items: ['Repères.'] }] } };
  const cases = friseDuFil(f, d.classes);
  assert.equal(cases.find(c => c.classe === 'CE2').renvoi, 'CE1');
  assert.equal(cases.find(c => c.classe === 'CE1').renvoi, null);
  assert.equal(cases.find(c => c.classe === 'CP').renvoi, null);
});
test('frise : partage vers le contenu commun d’une étape multi-classes même quand la classe a sa couche 2', () => {
  const d = jeu();
  const f = filDe(d.matieres[1], 'frise');
  f.complet = {
    CE1: { blocs: [{ titre: 'Principes (CE1 → CE2)', source: 'qlm-et-2020', page: 3, items: ['Commun.'] }] },
    CE2: { blocs: [{ titre: 'Objectifs', source: 'qlm-et-2020', page: 4, items: ['Propre au CE2.'] }] },
  };
  const ce2 = friseDuFil(f, d.classes).find(c => c.classe === 'CE2');
  assert.equal(ce2.renvoi, null);
  assert.deepEqual(ce2.partage, ['CE1']);
  assert.deepEqual(friseDuFil(f, d.classes).find(c => c.classe === 'CE1').partage, []);
});

// Principes des cycles dans la recherche
const cyclesJeu = [{ id: 2, nom: 'Cycle des apprentissages fondamentaux', classes: ['CP', 'CE1', 'CE2'], source: 'fr-c2-2024',
  idees: [{ texte: 'On articule le [[concret et l’abstrait]].', bloc: 0 }],
  complet: { blocs: [{ titre: 'Au cycle 2', source: 'fr-c2-2024', page: 2, items: ['Observer et agir, manipuler, expérimenter.'] }] } }];
test('rechercher : trouve une idée-force de cycle', () => {
  const r = rechercher(jeu().matieres, 'abstrait', cyclesJeu);
  assert.equal(r.length, 1);
  assert.equal(r[0].cycle, 2);
  assert.equal(r[0].matiereId, null);
});
test('rechercher : trouve la couche 2 d’un cycle', () => {
  const r = rechercher(jeu().matieres, 'manipuler', cyclesJeu);
  assert.deepEqual(r.map(x => x.cycle), [2]);
});
test('rechercher : sans cycles, résultats inchangés', () => {
  assert.deepEqual(rechercher(jeu().matieres, 'minute', []), rechercher(jeu().matieres, 'minute'));
});
