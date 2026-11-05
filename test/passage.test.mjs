import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, utimes } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { depuisQuand, fichiersModifies, activiteCode, reglages, construirePrompt } from '../src/passage.mjs';
import { squeletteMois } from '../src/releve.mjs';

const run = promisify(execFile);

test('depuisQuand : début du mois sans historique, sinon dernier vu_jusqu_au', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gml-'));
  assert.deepEqual(await depuisQuand(dir, new Date(2026, 10, 4, 4)), new Date(2026, 10, 1));
  await writeFile(join(dir, '2026-10.md'), '---\nmois: 2026-10\nvu_jusqu_au: 2026-10-30T04:00\n---\n');
  await writeFile(join(dir, '2026-11.md'), squeletteMois('2026-11'));
  assert.deepEqual(await depuisQuand(dir, new Date(2026, 10, 4, 4)), new Date(2026, 9, 30, 4, 0));
});

test('fichiersModifies : .md récents, exclusions respectées', async () => {
  const v = await mkdtemp(join(tmpdir(), 'vault-'));
  await mkdir(join(v, 'Lectures'));
  await mkdir(join(v, 'Perso'), { recursive: true });
  await mkdir(join(v, '.obsidian'));
  await mkdir(join(v, 'Relevés'));
  const recent = new Date(2026, 10, 2);
  const ancien = new Date(2026, 9, 1);
  for (const f of ['Lectures/neuf.md', 'Lectures/vieux.md', 'Perso/journal.md', 'Perso/profil.md', '.obsidian/x.md', 'Lectures/image.png', 'Relevés/2026-11.md']) {
    await writeFile(join(v, f), 'x');
    await utimes(join(v, f), recent, recent);
  }
  await utimes(join(v, 'Lectures/vieux.md'), ancien, ancien);
  const r = await fichiersModifies(v, new Date(2026, 9, 15), ['Relevés', 'Perso/journal.md']);
  assert.deepEqual(r, ['Lectures/neuf.md', 'Perso/profil.md']);
});

test('activiteCode : commits de la fenêtre, dossiers sans git ignorés', async () => {
  const p = await mkdtemp(join(tmpdir(), 'projets-'));
  const depot = join(p, 'site');
  await mkdir(depot);
  const git = (...a) => run('git', ['-C', depot, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a]);
  await git('init', '-q');
  await writeFile(join(depot, 'a'), 'a');
  await git('add', 'a');
  await git('commit', '-qm', 'Page accueil');
  await mkdir(join(p, 'pas-un-depot'));
  const texte = await activiteCode(p, new Date(Date.now() - 3600_000));
  assert.match(texte, /### site/);
  assert.match(texte, /Page accueil/);
  assert.doesNotMatch(texte, /pas-un-depot/);
});

test("reglages : lecture du vault, écriture des seuls fichiers du mois, fichiers privés interdits", () => {
  const r = reglages({ vault: '/v', fichiersMois: ['/v/R/2026-11.md'], serveurPromethee: 'promethee', prives: ['Journal intime.md', 'Santé'] });
  assert.deepEqual(r.permissions.additionalDirectories, ['/v']);
  assert.ok(r.permissions.allow.includes('Edit(//v/R/2026-11.md)'));
  assert.ok(r.permissions.allow.includes('mcp__promethee'));
  assert.ok(r.permissions.deny.includes('Read(//v/Journal intime.md)'));
  assert.ok(r.permissions.deny.includes('Read(//v/Santé/**)'));
  assert.ok(r.permissions.deny.includes('Bash'));
  const sans = reglages({ vault: '/v', fichiersMois: [], serveurPromethee: null });
  assert.ok(!sans.permissions.allow.some((a) => a.startsWith('mcp__')));
});

test('construirePrompt : brief en tête, fenêtre, fichiers, liste plafonnée', () => {
  const modifies = Array.from({ length: 305 }, (_, i) => `n${i}.md`);
  const p = construirePrompt({
    brief: 'Tu es un exécutant.', debut: new Date(2026, 10, 1), fin: new Date(2026, 10, 4, 4),
    fichiersMois: ['/v/R/2026-11.md'], modifies, code: '### site\n2026-11-02 Page accueil', serveurPromethee: null,
  });
  assert.match(p, /^Tu es un exécutant\./);
  assert.match(p, /du 2026-11-01T00:00 au 2026-11-04T04:00/);
  assert.match(p, /- \/v\/R\/2026-11\.md/);
  assert.match(p, /Promethee : indisponible/);
  assert.match(p, /- n299\.md/);
  assert.doesNotMatch(p, /- n300\.md/);
  assert.match(p, /… et 5 autres/);
});
