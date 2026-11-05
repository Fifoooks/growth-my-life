import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { creerServeur } from '../src/serveur.mjs';
import { squeletteMois, ecrireReleve } from '../src/releve.mjs';

test('sert les données et la page, enregistre un relevé, refuse le reste', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'gml-'));
  await writeFile(join(dir, '2026-10.md'), ecrireReleve(squeletteMois('2026-10'), { lignes: { Sport: { note: 70, objectif: null } }, engagements: [] }));
  const page = join(dir, 'page') + '/';
  await mkdir(page);
  await writeFile(join(page, 'index.html'), '<!doctype html><title>t</title>');
  const serveur = creerServeur({ dossierReleves: dir, nom: 'Alex', coach: 'Coach', dossierPage: page });
  await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
  t.after(() => serveur.close());
  const base = `http://127.0.0.1:${serveur.address().port}`;

  const api = await fetch(`${base}/api/donnees`);
  assert.equal(api.status, 200);
  assert.equal((await api.json()).mois[0].notes.Sport, 70);

  const accueil = await fetch(`${base}/`);
  assert.equal(accueil.status, 200);
  assert.match(accueil.headers.get('content-type'), /text\/html/);

  const put = await fetch(`${base}/api/releve/2026-11`, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lignes: { Sport: { note: 75 } }, engagements: [] }),
  });
  assert.equal(put.status, 204);
  const apres = await (await fetch(`${base}/api/donnees`)).json();
  assert.equal(apres.mois.find((m) => m.mois === '2026-11').notes.Sport, 75);

  const mauvais = await fetch(`${base}/api/releve/2026-11`, { method: 'PUT', body: JSON.stringify({ lignes: { Sport: { note: 150 } } }) });
  assert.equal(mauvais.status, 400);
  assert.equal((await fetch(`${base}/inexistant.js`)).status, 404);
  const demo = await (await fetch(`${base}/api/donnees?demo=1`)).json();
  assert.equal(demo.demo, true);
  assert.ok(demo.mois.filter((m) => m.notes.Sport !== null).length >= 12);
  assert.equal(demo.mois.at(-1).faits.length, 6);
  assert.equal((await fetch(`${base}/api/releve/2026-11?demo=1`, { method: 'PUT', body: '{}' })).status, 403);
  assert.equal((await fetch(`${base}/api/donnees`, { method: 'POST' })).status, 405);
});
