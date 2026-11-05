import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, chmod, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { passage } from '../src/lancer-passage.mjs';
import { lireEntete } from '../src/frontmatter.mjs';

async function preparer(reponse) {
  const racine = await mkdtemp(join(tmpdir(), 'gml-passage-'));
  const vault = join(racine, 'vault');
  const releves = join(vault, 'Relevés');
  await mkdir(releves, { recursive: true });
  await mkdir(join(racine, 'projets'));
  await writeFile(join(vault, 'note.md'), 'x');
  await utimes(join(vault, 'note.md'), new Date(2026, 10, 2), new Date(2026, 10, 2));
  await writeFile(join(racine, 'brief.md'), 'Tu es un exécutant.');
  const faux = join(racine, 'faux-claude.mjs');
  await writeFile(faux, [
    '#!/usr/bin/env node',
    "import { writeFileSync } from 'node:fs';",
    `writeFileSync(${JSON.stringify(join(racine, 'args.json'))}, JSON.stringify(process.argv.slice(2)));`,
    `process.stdout.write(${JSON.stringify(JSON.stringify(reponse))});`,
  ].join('\n'));
  await chmod(faux, 0o755);
  return {
    racine,
    env: {
      VAULT: vault, RELEVES_DIR: releves, BRIEF: join(racine, 'brief.md'), PROJETS_DIR: join(racine, 'projets'),
      RUN_DIR: join(racine, 'run'), CLAUDE_BIN: faux, PROMETHEE_MCP: 'promethee', N8N_ALERTE_URL: '',
    },
  };
}

test('passage réussi : fichier du mois créé, claude bridé, vu_jusqu_au avancé', async () => {
  const { racine, env } = await preparer({ is_error: false, result: 'OK — 2 faits ajoutés' });
  const r = await passage(env, new Date(2026, 10, 4, 4, 0));
  assert.equal(r.ok, true);
  const mois = await readFile(join(env.RELEVES_DIR, '2026-11.md'), 'utf8');
  assert.equal(lireEntete(mois).entete.vu_jusqu_au, '2026-11-04T04:00');
  const args = JSON.parse(await readFile(join(racine, 'args.json'), 'utf8'));
  for (const attendu of ['--print', 'sonnet', 'dontAsk', '--settings', '--strict-mcp-config']) assert.ok(args.includes(attendu), attendu);
  const mcp = JSON.parse(await readFile(join(env.RUN_DIR, 'mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(mcp.mcpServers), ['promethee']);
  assert.match(args.at(-1), /^Tu es un exécutant\./);
  assert.match(args.at(-1), /- note\.md/);
  assert.doesNotMatch(args.at(-1), /- Relevés\/2026-11\.md/);
  const reglagesJson = JSON.parse(await readFile(join(env.RUN_DIR, 'reglages.json'), 'utf8'));
  assert.ok(reglagesJson.permissions.allow.includes(`Edit(/${join(env.RELEVES_DIR, '2026-11.md')})`));
  assert.ok(reglagesJson.permissions.allow.includes('mcp__promethee'));
});

test('fenêtre à cheval sur deux mois : les deux fichiers sont ouverts en écriture', async () => {
  const { env } = await preparer({ is_error: false, result: 'OK' });
  await writeFile(join(env.RELEVES_DIR, '2026-10.md'), '---\nmois: 2026-10\nvu_jusqu_au: 2026-10-30T04:00\n---\n');
  await passage(env, new Date(2026, 10, 2, 4, 0));
  const reglagesJson = JSON.parse(await readFile(join(env.RUN_DIR, 'reglages.json'), 'utf8'));
  assert.ok(reglagesJson.permissions.allow.includes(`Edit(/${join(env.RELEVES_DIR, '2026-10.md')})`));
  assert.ok(reglagesJson.permissions.allow.includes(`Edit(/${join(env.RELEVES_DIR, '2026-11.md')})`));
});

test('passage raté : alerte n8n, vu_jusqu_au inchangé', async (t) => {
  const recus = [];
  const n8n = createServer((req, res) => {
    let corps = '';
    req.on('data', (c) => { corps += c; });
    req.on('end', () => { recus.push(JSON.parse(corps)); res.end('ok'); });
  });
  await new Promise((r) => n8n.listen(0, '127.0.0.1', r));
  t.after(() => n8n.close());
  const { env } = await preparer({ is_error: true, subtype: 'error_max_turns' });
  env.N8N_ALERTE_URL = `http://127.0.0.1:${n8n.address().port}/webhook/growth-alerte`;
  const r = await passage(env, new Date(2026, 10, 4, 4, 0));
  assert.equal(r.ok, false);
  assert.match(recus[0].raison, /error_max_turns/);
  const mois = await readFile(join(env.RELEVES_DIR, '2026-11.md'), 'utf8');
  assert.equal(lireEntete(mois).entete.vu_jusqu_au, null);
});
