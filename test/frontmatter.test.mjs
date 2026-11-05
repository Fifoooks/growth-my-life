import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireEntete, ecrireCle } from '../src/frontmatter.mjs';

const TEXTE = '---\nmois: 2026-11\nSport: 80\nSommeil: \nvu_jusqu_au: "2026-11-05T04:00"\n---\n# Corps\n';

test('lit les clés : texte, nombres, vides, guillemets', () => {
  const { entete, corps } = lireEntete(TEXTE);
  assert.deepEqual(entete, { mois: '2026-11', Sport: 80, Sommeil: null, vu_jusqu_au: '2026-11-05T04:00' });
  assert.equal(corps, '# Corps\n');
});

test('sans en-tête : entete vide, corps intact', () => {
  assert.deepEqual(lireEntete('# Rien\n'), { entete: {}, corps: '# Rien\n' });
});

test('ecrireCle remplace une clé existante sans toucher au corps', () => {
  const t = ecrireCle(TEXTE, 'Sommeil', 45);
  assert.equal(lireEntete(t).entete.Sommeil, 45);
  assert.ok(t.endsWith('# Corps\n'));
});

test('ecrireCle ajoute une clé absente', () => {
  assert.equal(lireEntete(ecrireCle(TEXTE, 'statut', 'relevé')).entete.statut, 'relevé');
});
