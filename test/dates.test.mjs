import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleMois, horodatage, titreMois, frise, moisPrecedent } from '../src/dates.mjs';

test('cleMois et horodatage en heure locale', () => {
  assert.equal(cleMois(new Date(2026, 0, 5)), '2026-01');
  assert.equal(horodatage(new Date(2026, 10, 4, 4, 7)), '2026-11-04T04:07');
});

test('titreMois en français, majuscule', () => {
  assert.equal(titreMois('2026-08'), 'Août 2026');
  assert.equal(titreMois('2026-11'), 'Novembre 2026');
});

test('frise couvre tous les mois, trous compris', () => {
  assert.deepEqual(frise('2025-11', '2026-02'), ['2025-11', '2025-12', '2026-01', '2026-02']);
  assert.deepEqual(frise('2026-03', '2026-03'), ['2026-03']);
});

test('moisPrecedent passe l\'année', () => {
  assert.equal(moisPrecedent('2026-01'), '2025-12');
  assert.equal(moisPrecedent('2026-11'), '2026-10');
});
