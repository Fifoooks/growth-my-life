import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tendance, moyenne, assembler, chargerDonnees, enregistrerReleve, jeu } from '../src/donnees.mjs';
import { squeletteMois, ecrireReleve } from '../src/releve.mjs';
import { AXES } from '../src/axes.mjs';

const vide = () => Object.fromEntries(AXES.map((a) => [a, null]));
const releve = (mois, notes, objectifs = {}) => ({
  mois, statut: 'relevé', vuJusquAu: null, faits: [], details: {}, engagements: [],
  notes: { ...vide(), ...notes }, objectifs: { ...vide(), ...objectifs },
});
const avecSport = (cle, note) => ecrireReleve(squeletteMois(cle), { lignes: { Sport: { note, objectif: null } }, engagements: [] });

test('tendance : seuil de 5 points', () => {
  assert.equal(tendance(60, 65), 'progres');
  assert.equal(tendance(60, 64), 'stable');
  assert.equal(tendance(60, 55), 'recul');
  assert.equal(tendance(null, 55), null);
  assert.equal(tendance(undefined, 55), null);
});

test('moyenne ignore les trous', () => {
  assert.equal(moyenne([80, null, 61]), 71);
  assert.equal(moyenne([null]), null);
});

test('assembler : tri, statuts par mois, objectifs reportés, frise', () => {
  const d = assembler(
    [releve('2026-10', { Sport: 60 }), releve('2025-12', { Sport: 80 }, { Sport: 100 }), releve('2026-11', {})],
    { Sport: 'Ta force.' },
    new Date(2026, 10, 15),
  );
  assert.deepEqual(d.mois.map((m) => m.mois), ['2025-12', '2026-10', '2026-11']);
  assert.equal(d.mois[0].statuts.Sport, null);
  assert.equal(d.mois[1].statuts.Sport, 'recul');
  assert.equal(d.mois[1].objectifs.Sport, 100);
  assert.equal(d.mois[2].objectifs.Sport, 100);
  assert.equal(d.dernierReleve, '2026-10');
  assert.equal(d.tendances.Sport, 'recul');
  assert.equal(d.descriptions.Sport, 'Ta force.');
  assert.equal(d.moisEnCours, '2026-11');
  assert.equal(d.mois[0].moyennes.corps, 80);
  assert.equal(d.frise.length, 11);
  assert.equal(d.frise.at(-1), '2026-10');
});

test('chargerDonnees lit les mois et les descriptions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gml-'));
  await writeFile(join(dir, '2026-10.md'), avecSport('2026-10', 70));
  await writeFile(join(dir, '_compétences.md'), '| Compétence | Sphère | Description |\n|---|---|---|\n| Sport | 🫀 Corps & Santé | Ta force. |\n');
  await writeFile(join(dir, 'notes.md'), 'ignoré');
  const d = await chargerDonnees(dir, new Date(2026, 10, 3));
  assert.equal(d.mois.length, 1);
  assert.equal(d.mois[0].notes.Sport, 70);
  assert.deepEqual(d.descriptions, { Sport: 'Ta force.' });
});

test('enregistrerReleve crée le mois au besoin et calcule le statut', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gml-'));
  await writeFile(join(dir, '2026-10.md'), avecSport('2026-10', 60));
  await enregistrerReleve(dir, '2026-11', { lignes: { Sport: { note: 70, objectif: 90 } }, engagements: ['Courir'] });
  const texte = await readFile(join(dir, '2026-11.md'), 'utf8');
  assert.match(texte, /\| Sport\s+\| 70\s+\| 90\s+\| En progrès\s+\|/);
  assert.match(texte, /^1\. Courir$/m);
  assert.match(texte, /^## Ce que l'agent a vu$/m);
});

test('jeu : niveau, XP, série, succès', () => {
  const mois = assembler([releve('2026-08', { Sport: 60 }), releve('2026-09', { Sport: 72 }), releve('2026-10', { Sport: 80 })], {}, new Date(2026, 10, 15)).mois;
  const j = jeu(mois, new Date(2026, 10, 15));
  assert.equal(j.global, 80);
  assert.equal(j.niveau, 8);
  assert.equal(j.versNiveau, 10);
  assert.equal(j.xp, 212);
  assert.equal(j.serie, 3);
  assert.equal(j.meilleureSerie, 3);
  const obtenu = Object.fromEntries(j.succes.map((s) => [s.id, s.obtenu]));
  assert.deepEqual(obtenu, { premier: true, complet: false, serie3: true, serie12: false, progres10: true, quatrevingt: true, finDuJeu: false });
  const casse = jeu(assembler([releve('2026-07', { Sport: 50 }), releve('2026-09', { Sport: 50 })], {}, new Date(2026, 10, 2)).mois, new Date(2026, 10, 2));
  assert.equal(casse.serie, 0);
  assert.equal(casse.meilleureSerie, 1);
});
