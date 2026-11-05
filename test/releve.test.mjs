import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireReleve, lireFait, ecrireReleve, nettoyerSaisie, squeletteMois } from '../src/releve.mjs';

const MOIS = `---
mois: 2026-11
statut: relevé
vu_jusqu_au: 2026-11-30T04:00
---

# Novembre 2026

## Ce que l'agent a vu

### 🫀 Corps & Santé
- 2026-11-04 · Sport · Séance de dips reprise · [[2026-11-04]]
- 2026-11-05 · Inconnu · Ligne ignorée · [[x]]

### ⚙️ Système & Efficacité
- 2026-11-09 · Productivité · Semaine du 03/11 : 27 h de focus (5,4 h/j) · Promethee
- 2026-11-10 · Business · Site mis en ligne

## Le relevé

### 🫀 Corps & Santé

Texte libre de la sphère.

| Compétence | Note | Objectif | Statut | Pourquoi | Comment m’améliorer |
|---|---|---|---|---|---|
| Sport | 72 | 90 | Recule | reprise, 6 séances \\| 2 sorties | 3 séances par semaine |
| Sommeil |  |  |  |  |  |

## Engagements
1. Trois séances par semaine
2. Coucher 23 h
`;

test("lit l'en-tête et les tableaux : notes, objectifs", () => {
  const r = lireReleve(MOIS);
  assert.equal(r.mois, '2026-11');
  assert.equal(r.statut, 'relevé');
  assert.equal(r.vuJusquAu, '2026-11-30T04:00');
  assert.equal(r.notes.Sport, 72);
  assert.equal(r.notes.Sommeil, null);
  assert.equal(r.notes.Trading, null);
  assert.equal(Object.keys(r.notes).length, 24);
  assert.equal(r.objectifs.Sport, 90);
  assert.equal(r.objectifs.Sommeil, null);
});

test('lit les faits et ignore les compétences inconnues', () => {
  const r = lireReleve(MOIS);
  assert.equal(r.faits.length, 3);
  assert.deepEqual(r.faits[0], { date: '2026-11-04', axe: 'Sport', texte: 'Séance de dips reprise', source: '[[2026-11-04]]' });
  assert.equal(r.faits[1].source, 'Promethee');
  assert.deepEqual(r.faits[2], { date: '2026-11-10', axe: 'Business', texte: 'Site mis en ligne', source: null });
});

test('lit le détail (pipes échappés, apostrophes typographiques) et les engagements', () => {
  const r = lireReleve(MOIS);
  assert.deepEqual(r.details.Sport, { pourquoi: 'reprise, 6 séances | 2 sorties', ameliorer: '3 séances par semaine' });
  assert.deepEqual(r.engagements, ['Trois séances par semaine', 'Coucher 23 h']);
});

test('lireFait refuse une ligne hors format', () => {
  assert.equal(lireFait('- pas une date · Sport · x'), null);
  assert.equal(lireFait('Texte libre'), null);
});

test('ecrireReleve réécrit tableaux et engagements, garde le reste', () => {
  const texte = ecrireReleve(MOIS, {
    lignes: { Sport: { note: 75, objectif: 90, pourquoi: 'mieux | plus régulier', ameliorer: '4 séances' }, Sommeil: { note: 50, objectif: null } },
    engagements: ['Coucher 23 h'],
  }, { Sport: 'progres' });
  const r = lireReleve(texte);
  assert.equal(r.notes.Sport, 75);
  assert.equal(r.notes.Sommeil, 50);
  assert.deepEqual(r.details.Sport, { pourquoi: 'mieux | plus régulier', ameliorer: '4 séances' });
  assert.deepEqual(r.engagements, ['Coucher 23 h']);
  assert.equal(r.faits.length, 3);
  assert.match(texte, /Texte libre de la sphère\./);
  assert.match(texte, /\| Sport\s+\| 75\s+\| 90\s+\| En progrès\s+\|/);
  assert.match(texte, /^### 📚 Savoir & Création$/m);
  assert.ok(texte.startsWith('---\nmois: 2026-11\n'));
});

test('squeletteMois : un mois vide, 24 lignes de tableau', () => {
  const texte = squeletteMois('2026-11');
  const r = lireReleve(texte);
  assert.equal(r.mois, '2026-11');
  assert.equal(r.statut, 'en cours');
  assert.equal(r.vuJusquAu, null);
  assert.ok(Object.values(r.notes).every((n) => n === null));
  assert.equal(Object.keys(r.details).length, 24);
  assert.match(texte, /^# Novembre 2026$/m);
});

test('nettoyerSaisie : bornes, compétences connues, 3 engagements max', () => {
  const s = nettoyerSaisie({ lignes: { Sport: { note: '80', objectif: '', pourquoi: ' ok ' }, Inconnu: { note: 5 } }, engagements: ['a', 'b', 'c', 'd'] });
  assert.deepEqual(s.lignes, { Sport: { note: 80, objectif: null, pourquoi: ' ok ' } });
  assert.deepEqual(s.engagements, ['a', 'b', 'c']);
  assert.throws(() => nettoyerSaisie({ lignes: { Sport: { note: 150 } } }), /Note invalide/);
});
