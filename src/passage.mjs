import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { lireEntete } from './frontmatter.mjs';
import { horodatage } from './dates.mjs';
import { FICHIER_MOIS } from './donnees.mjs';
import { squeletteMois } from './releve.mjs';

export { squeletteMois };

const run = promisify(execFile);
export const EXCLUS = ['.obsidian', '.trash', '.git', 'node_modules'];
const PLAFOND = 300;

export async function depuisQuand(dossierReleves, maintenant) {
  const noms = (await readdir(dossierReleves)).filter((n) => FICHIER_MOIS.test(n)).sort().reverse();
  for (const n of noms) {
    const { entete } = lireEntete(await readFile(join(dossierReleves, n), 'utf8'));
    if (entete.vu_jusqu_au) return new Date(entete.vu_jusqu_au);
  }
  return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
}

export async function fichiersModifies(racine, depuis, exclusEnPlus = []) {
  const exclus = [...EXCLUS, ...exclusEnPlus];
  const trouves = [];
  async function parcourir(dossier) {
    for (const entree of await readdir(dossier, { withFileTypes: true })) {
      const complet = join(dossier, entree.name);
      const rel = relative(racine, complet);
      if (exclus.some((e) => rel === e || rel.startsWith(`${e}/`))) continue;
      if (entree.isDirectory()) await parcourir(complet);
      else if (entree.isFile() && entree.name.endsWith('.md') && (await stat(complet)).mtime > depuis) trouves.push(rel);
    }
  }
  await parcourir(racine);
  return trouves.sort();
}

export async function activiteCode(dossierProjets, depuis) {
  const blocs = [];
  for (const e of await readdir(dossierProjets, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    try {
      const { stdout } = await run('git', ['-C', join(dossierProjets, e.name), 'log', `--since=${depuis.toISOString()}`, '--date=short', '--pretty=format:%ad %s']);
      if (stdout.trim()) blocs.push(`### ${e.name}\n${stdout.trim()}`);
    } catch {
      // pas un dépôt git : rien à dire
    }
  }
  return blocs.join('\n');
}

export function reglages({ vault, fichiersMois, serveurPromethee, prives = [] }) {
  return {
    permissions: {
      allow: ['Read', 'Glob', 'Grep', ...fichiersMois.map((f) => `Edit(/${f})`), ...(serveurPromethee ? [`mcp__${serveurPromethee}`] : [])],
      deny: ['Bash', 'WebFetch', 'WebSearch', 'Agent', ...prives.map((p) => `Read(/${join(vault, p)}${p.endsWith('.md') ? '' : '/**'})`)],
      additionalDirectories: [vault],
    },
  };
}

export function construirePrompt({ brief, debut, fin, fichiersMois, modifies, code, serveurPromethee }) {
  const listes = modifies.slice(0, PLAFOND).map((f) => `- ${f}`);
  if (modifies.length > PLAFOND) listes.push(`- … et ${modifies.length - PLAFOND} autres (cherche-les avec Glob si besoin)`);
  return [
    brief.trim(), '', '---', '',
    `Fenêtre de ce passage : du ${horodatage(debut)} au ${horodatage(fin)}.`, '',
    'Fichiers du mois où tu peux écrire (un fait va dans le fichier du mois de sa date) :',
    ...fichiersMois.map((f) => `- ${f}`), '',
    serveurPromethee ? `Promethee : outils MCP « ${serveurPromethee} » disponibles.` : 'Promethee : indisponible pour ce passage, ne le cherche pas.', '',
    `Fichiers du vault modifiés dans la fenêtre (${modifies.length}) :`,
    ...(listes.length ? listes : ['- aucun']), '',
    'Activité des projets de code :', code || '- aucune', '',
  ].join('\n');
}
