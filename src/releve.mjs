import { lireEntete } from './frontmatter.mjs';
import { AXES, SPHERES } from './axes.mjs';
import { titreMois } from './dates.mjs';

/** Titre de la partie où l'agent de nuit range les faits du mois. */
export const SECTION_FAITS = "Ce que l'agent a vu";

export const COLONNES = ['Compétence', 'Note', 'Objectif', 'Statut', 'Pourquoi', "Comment m'améliorer"];
// Tu remplis la note et le Pourquoi ; ton coach IA écrit « Comment m'améliorer » après la rétrospective.
export const CHAMPS = { Pourquoi: 'pourquoi', "Comment m'améliorer": 'ameliorer' };
export const STATUTS = { progres: 'En progrès', stable: 'Stagnation', recul: 'Recule' };

const apostrophes = (t) => t.replace(/’/g, "'");
const nombre = (t) => (/^\d{1,3}$/.test(t.trim()) ? Number(t.trim()) : null);
const echapper = (t) => String(t ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();

export function cellules(ligne) {
  return ligne.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

function sections(texte, niveau) {
  const prefixe = `${'#'.repeat(niveau)} `;
  const resultat = {};
  let courante = null;
  for (const ligne of texte.split('\n')) {
    if (ligne.startsWith(prefixe)) {
      courante = ligne.slice(prefixe.length).trim();
      resultat[courante] = [];
    } else if (courante !== null) {
      resultat[courante].push(ligne);
    }
  }
  return resultat;
}

export function lireTableaux(lignes) {
  const resultat = {};
  let entetes = null;
  for (const ligne of lignes) {
    if (!ligne.trim().startsWith('|')) { entetes = null; continue; }
    const c = cellules(ligne);
    if (!entetes) { entetes = c.map(apostrophes); continue; }
    if (c.every((x) => /^:?-+:?$/.test(x))) continue;
    const valeurs = Object.fromEntries(entetes.map((h, i) => [h, c[i] ?? '']));
    const axe = valeurs['Compétence'];
    if (!AXES.includes(axe)) continue;
    const r = { note: nombre(valeurs.Note ?? ''), objectif: nombre(valeurs.Objectif ?? '') };
    for (const [colonne, cle] of Object.entries(CHAMPS)) if (valeurs[colonne]) r[cle] = valeurs[colonne];
    resultat[axe] = r;
  }
  return resultat;
}

export function lireFait(ligne) {
  const m = ligne.match(/^\s*-\s+(\d{4}-\d{2}-\d{2})\s+·\s+(.+)$/);
  if (!m) return null;
  const morceaux = m[2].split(' · ').map((s) => s.trim());
  if (morceaux.length < 2) return null;
  const [axe, ...reste] = morceaux;
  if (!AXES.includes(axe)) return null;
  const source = reste.length >= 2 ? reste.pop() : null;
  return { date: m[1], axe, texte: reste.join(' · '), source };
}

export function lireReleve(texte) {
  const { entete, corps } = lireEntete(texte);
  const parties = sections(corps, 2);
  const lignes = lireTableaux(parties['Le relevé'] ?? []);
  const details = {};
  for (const [axe, { note, objectif, ...reste }] of Object.entries(lignes)) details[axe] = reste;
  return {
    mois: entete.mois ?? null,
    statut: entete.statut ?? null,
    vuJusquAu: entete.vu_jusqu_au ?? null,
    notes: Object.fromEntries(AXES.map((a) => [a, lignes[a]?.note ?? null])),
    objectifs: Object.fromEntries(AXES.map((a) => [a, lignes[a]?.objectif ?? null])),
    faits: (parties[SECTION_FAITS] ?? []).map(lireFait).filter(Boolean),
    details,
    engagements: (parties.Engagements ?? [])
      .map((l) => l.match(/^\s*(?:\d+\.|[-*])\s+(?:\[.\]\s+)?(.+)$/)?.[1]?.trim())
      .filter(Boolean),
  };
}

/** Tableau aligné comme le formate Obsidian : il n'a plus rien à réécrire, donc moins de conflits de synchro. */
export function tableau(axes, lignes = {}, statuts = {}) {
  const rangs = axes.map((a) => {
    const r = lignes[a] ?? {};
    return [a, String(r.note ?? ''), String(r.objectif ?? ''), statuts[a] ? STATUTS[statuts[a]] : '', ...Object.values(CHAMPS).map((c) => echapper(r[c]))];
  });
  const largeurs = COLONNES.map((titre, i) => Math.max(3, titre.length, ...rangs.map((r) => r[i].length)));
  const ligne = (cases) => `| ${cases.map((c, i) => c.padEnd(largeurs[i])).join(' | ')} |`;
  return [ligne(COLONNES), `| ${largeurs.map((l) => '-'.repeat(l)).join(' | ')} |`, ...rangs.map(ligne)];
}

export function squeletteMois(cle) {
  return [
    '---', `mois: ${cle}`, 'statut: en cours', 'vu_jusqu_au: ', '---', '',
    `# ${titreMois(cle)}`, '',
    `## ${SECTION_FAITS}`, '',
    "*Ajouté par l'exécutant de nuit. Format : `- AAAA-MM-JJ · Compétence · fait · source`.*", '',
    ...SPHERES.flatMap((s) => [`### ${s.emoji} ${s.nom}`, '']),
    '## Le relevé', '',
    ...SPHERES.flatMap((s) => [`### ${s.emoji} ${s.nom}`, '', ...tableau(s.axes), '']),
    '## Engagements', '',
  ].join('\n');
}

function decouper(corps) {
  const blocs = [{ titre: null, lignes: [] }];
  for (const l of corps.split('\n')) {
    if (l.startsWith('## ')) blocs.push({ titre: l.slice(3).trim(), lignes: [] });
    else blocs.at(-1).lignes.push(l);
  }
  return blocs;
}

function sectionReleve(anciennes, lignes, statuts) {
  const libre = { __intro: [] };
  let courant = '__intro';
  for (const l of anciennes) {
    if (l.startsWith('### ')) { courant = l.slice(4).trim(); libre[courant] = []; continue; }
    if (!l.trim().startsWith('|')) libre[courant].push(l);
  }
  const garder = (ls = []) => { const t = ls.join('\n').trim(); return t ? [t, ''] : []; };
  const sortie = ['', ...garder(libre.__intro)];
  for (const s of SPHERES) {
    const titre = `${s.emoji} ${s.nom}`;
    sortie.push(`### ${titre}`, '', ...garder(libre[titre]), ...tableau(s.axes, lignes, statuts), '');
  }
  return sortie;
}

export function ecrireReleve(texte, { lignes = {}, engagements = [] }, statuts = {}) {
  const t = texte.replace(/\r\n/g, '\n');
  const entete = t.match(/^---\n[\s\S]*?\n---\n?/)?.[0] ?? '';
  const blocs = decouper(t.slice(entete.length));
  const bloc = (titre) => blocs.find((b) => b.titre === titre) ?? (blocs.push({ titre, lignes: [] }), blocs.at(-1));
  bloc('Le relevé').lignes = sectionReleve(bloc('Le relevé').lignes, lignes, statuts);
  bloc('Engagements').lignes = ['', ...engagements.filter((e) => e.trim()).map((e, i) => `${i + 1}. ${echapper(e)}`), ''];
  return entete + blocs.map((b) => (b.titre === null ? b.lignes.join('\n') : `## ${b.titre}\n${b.lignes.join('\n')}`)).join('\n');
}

export function nettoyerSaisie({ lignes = {}, engagements = [] } = {}) {
  const borne = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error(`Note invalide : ${v}`);
    return n;
  };
  const texte = (v) => String(v ?? '').slice(0, 2000);
  const propres = {};
  for (const a of AXES) {
    const r = lignes[a];
    if (!r) continue;
    propres[a] = {
      note: borne(r.note),
      objectif: borne(r.objectif),
      ...Object.fromEntries(Object.values(CHAMPS).map((c) => [c, texte(r[c])]).filter(([, v]) => v.trim())),
    };
  }
  return { lignes: propres, engagements: (Array.isArray(engagements) ? engagements : []).slice(0, 3).map(texte) };
}
