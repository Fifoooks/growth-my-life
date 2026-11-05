import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { squeletteMois, depuisQuand, fichiersModifies, activiteCode, reglages, construirePrompt } from './passage.mjs';
import { ecrireCle } from './frontmatter.mjs';
import { cleMois, horodatage } from './dates.mjs';

const run = promisify(execFile);

export async function alerter(url, raison) {
  if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ raison }) });
  } catch {
    // n8n injoignable : le journal systemd garde la trace
  }
}

export async function passage(env, maintenant = new Date()) {
  const { VAULT, RELEVES_DIR, BRIEF, PROJETS_DIR, RUN_DIR, CLAUDE_BIN = 'claude', PROMETHEE_MCP = '', PROMETHEE_URL = 'https://mcp.promethee.io/mcp', N8N_ALERTE_URL = '', PRIVES = '' } = env;
  // Chemins du vault (relatifs) que l'agent ne doit jamais lire, séparés par « ; ».
  const prives = PRIVES.split(';').map((p) => p.trim().replace(/\/+$/, '')).filter(Boolean);
  const serveurPromethee = PROMETHEE_MCP || null;
  const debut = await depuisQuand(RELEVES_DIR, maintenant);
  const cles = [...new Set([cleMois(debut), cleMois(maintenant)])];
  const fichiersMois = cles.map((c) => join(RELEVES_DIR, `${c}.md`));
  for (const [i, f] of fichiersMois.entries()) {
    try { await access(f); } catch { await writeFile(f, squeletteMois(cles[i])); }
  }

  const modifies = await fichiersModifies(VAULT, debut, [relative(VAULT, RELEVES_DIR), ...prives]);
  const code = PROJETS_DIR ? await activiteCode(PROJETS_DIR, debut) : '';
  const brief = await readFile(BRIEF, 'utf8');
  await mkdir(RUN_DIR, { recursive: true });
  const fichierReglages = join(RUN_DIR, 'reglages.json');
  await writeFile(fichierReglages, JSON.stringify(reglages({ vault: VAULT, fichiersMois, serveurPromethee, prives }), null, 2));
  // Seul Promethee est chargé : les connecteurs claude.ai (Notion, Figma…) gonflent le contexte d'un tiers.
  const fichierMcp = join(RUN_DIR, 'mcp.json');
  const serveurs = serveurPromethee ? { [serveurPromethee]: { type: 'http', url: PROMETHEE_URL } } : {};
  await writeFile(fichierMcp, JSON.stringify({ mcpServers: serveurs }, null, 2));
  const prompt = construirePrompt({ brief, debut, fin: maintenant, fichiersMois, modifies, code, serveurPromethee });

  try {
    const appel = run(CLAUDE_BIN, [
      '--print', '--model', 'sonnet', '--permission-mode', 'dontAsk', '--settings', fichierReglages,
      '--strict-mcp-config', '--mcp-config', fichierMcp,
      '--max-turns', '80', '--output-format', 'json', prompt,
    ], { cwd: RUN_DIR, maxBuffer: 20 * 1024 * 1024, timeout: 45 * 60 * 1000, env: { ...process.env, ENABLE_CLAUDEAI_MCP_SERVERS: 'false' } });
    appel.child.stdin.end();
    const { stdout } = await appel;
    await writeFile(join(RUN_DIR, 'dernier-passage.json'), stdout);
    const resultat = JSON.parse(stdout);
    if (resultat.is_error) throw new Error(`claude : ${resultat.subtype ?? 'erreur'}`);
  } catch (e) {
    await alerter(N8N_ALERTE_URL, `Passage du ${horodatage(maintenant)} raté : ${String(e.message).slice(0, 300)}`);
    return { ok: false, raison: e.message };
  }

  const courant = fichiersMois.at(-1);
  await writeFile(courant, ecrireCle(await readFile(courant, 'utf8'), 'vu_jusqu_au', horodatage(maintenant)));
  return { ok: true, debut: horodatage(debut), fin: horodatage(maintenant), fichiers: modifies.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manquants = ['VAULT', 'RELEVES_DIR', 'BRIEF', 'RUN_DIR'].filter((k) => !process.env[k]);
  if (manquants.length) { console.error(`Variables manquantes : ${manquants.join(', ')}`); process.exit(1); }
  const r = await passage(process.env);
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
}
