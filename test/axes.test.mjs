import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AXES, SPHERES, sphereDe } from '../src/axes.mjs';

test('24 axes uniques répartis en 6 sphères', () => {
  assert.equal(SPHERES.length, 6);
  assert.equal(AXES.length, 24);
  assert.equal(new Set(AXES).size, 24);
});

test("sphereDe retrouve la sphère d'un axe", () => {
  assert.equal(sphereDe('Trading'), 'argent');
  assert.equal(sphereDe('Amour, amitié, famille'), 'relations');
  assert.equal(sphereDe('Inconnu'), null);
});
