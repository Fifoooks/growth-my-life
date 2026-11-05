import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { lireReleve, cellules, ecrireReleve, squeletteMois } from './releve.mjs';
import { SPHERES, AXES } from './axes.mjs';
import { cleMois, frise, moisPrecedent } from './dates.mjs';

export const SEUIL_TENDANCE = 5;
export const FICHIER_MOIS = /^\d{4}-\d{2}\.md$/;

export function moyenne(valeurs) {
  const v = valeurs.filter((x) => typeof x === 'number');
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}

export function tendance(avant, apres) {
  if (typeof avant !== 'number' || typeof apres !== 'number') return null;
  const ecart = apres - avant;
  if (ecart >= SEUIL_TENDANCE) return 'progres';
  if (ecart <= -SEUIL_TENDANCE) return 'recul';
  return 'stable';
}

export const SUCCES = [
  { id: 'premier', titre: 'Premier relevé', detail: 'Un mois entier noté.' },
  { id: 'complet', titre: 'Tour complet', detail: 'Les 24 compétences notées le même mois.' },
  { id: 'serie3', titre: "Trois mois d'affilée", detail: 'Trois relevés consécutifs, sans trou.' },
  { id: 'serie12', titre: 'Une année pleine', detail: 'Douze relevés consécutifs.' },
  { id: 'progres10', titre: '+10 en un mois', detail: "Une compétence gagne 10 points d'un relevé à l'autre." },
  { id: 'quatrevingt', titre: 'Maîtrise', detail: 'Une compétence à 80 ou plus.' },
  { id: 'finDuJeu', titre: 'Fin du jeu', detail: 'Une compétence à 100.' },
];

export function jeu(mois, aujourdhui = new Date()) {
  const notes = mois.filter((m) => AXES.some((a) => m.notes[a] !== null));
  const dernier = notes.at(-1) ?? null;
  const global = dernier ? moyenne(AXES.map((a) => dernier.notes[a])) : null;
  const xp = notes.reduce((total, m) => total + AXES.reduce((s, a) => s + (m.notes[a] ?? 0), 0), 0);
  const notes_ = new Set(notes.map((m) => m.mois));
  let curseur = cleMois(aujourdhui);
  if (!notes_.has(curseur)) curseur = moisPrecedent(curseur);
  let serie = 0;
  while (notes_.has(curseur)) { serie += 1; curseur = moisPrecedent(curseur); }
  let meilleureSerie = 0;
  let courante = 0;
  if (notes.length) {
    for (const cle of frise(notes[0].mois, dernier.mois)) {
      courante = notes_.has(cle) ? courante + 1 : 0;
      meilleureSerie = Math.max(meilleureSerie, courante);
    }
  }
  const precedente = {};
  let progres10 = false;
  for (const m of notes) {
    for (const a of AXES) {
      const n = m.notes[a];
      if (n === null) continue;
      if (typeof precedente[a] === 'number' && n - precedente[a] >= 10) progres10 = true;
      precedente[a] = n;
    }
  }
  const valeurs = notes.flatMap((m) => AXES.map((a) => m.notes[a]).filter((n) => n !== null));
  const obtenus = {
    premier: notes.length > 0,
    complet: notes.some((m) => AXES.every((a) => m.notes[a] !== null)),
    serie3: meilleureSerie >= 3,
    serie12: meilleureSerie >= 12,
    progres10,
    quatrevingt: valeurs.some((n) => n >= 80),
    finDuJeu: valeurs.some((n) => n >= 100),
  };
  return {
    global,
    niveau: global === null ? 0 : Math.floor(global / 10),
    versNiveau: global === null ? null : (Math.floor(global / 10) + 1) * 10 - global,
    xp,
    serie,
    meilleureSerie,
    succes: SUCCES.map((s) => ({ ...s, obtenu: obtenus[s.id] })),
  };
}

export function assembler(releves, descriptions = {}, aujourdhui = new Date()) {
  const derniereNote = {};
  const dernierObjectif = {};
  const mois = [...releves].sort((a, b) => a.mois.localeCompare(b.mois)).map((r) => {
    const statuts = {};
    const objectifs = {};
    for (const a of AXES) {
      statuts[a] = tendance(derniereNote[a], r.notes[a]);
      objectifs[a] = r.objectifs?.[a] ?? dernierObjectif[a] ?? null;
      if (r.notes[a] !== null) derniereNote[a] = r.notes[a];
      if (objectifs[a] !== null) dernierObjectif[a] = objectifs[a];
    }
    const moyennes = Object.fromEntries(SPHERES.map((s) => [s.id, moyenne(s.axes.map((a) => r.notes[a]))]));
    return { ...r, objectifs, statuts, moyennes };
  });
  const notes = mois.filter((m) => AXES.some((a) => m.notes[a] !== null));
  const dernier = notes.at(-1) ?? null;
  return {
    spheres: SPHERES,
    descriptions,
    mois,
    tendances: dernier ? dernier.statuts : Object.fromEntries(AXES.map((a) => [a, null])),
    dernierReleve: dernier?.mois ?? null,
    moisEnCours: cleMois(aujourdhui),
    frise: notes.length ? frise(notes[0].mois, dernier.mois) : [],
    jeu: jeu(mois, aujourdhui),
  };
}

export async function lireDescriptions(dossier) {
  let texte;
  try {
    texte = await readFile(join(dossier, '_compétences.md'), 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw e;
  }
  const resultat = {};
  for (const ligne of texte.split('\n')) {
    if (!ligne.trim().startsWith('|')) continue;
    const [competence, , description] = cellules(ligne);
    if (AXES.includes(competence) && description) resultat[competence] = description;
  }
  return resultat;
}

export async function chargerDonnees(dossier, aujourdhui = new Date()) {
  const noms = (await readdir(dossier)).filter((n) => FICHIER_MOIS.test(n));
  const releves = await Promise.all(noms.map(async (n) => {
    const r = lireReleve(await readFile(join(dossier, n), 'utf8'));
    return { ...r, mois: r.mois ?? n.slice(0, 7) };
  }));
  return assembler(releves, await lireDescriptions(dossier), aujourdhui);
}

export async function enregistrerReleve(dossier, mois, { lignes, engagements }) {
  const fichier = join(dossier, `${mois}.md`);
  let texte;
  try {
    texte = await readFile(fichier, 'utf8');
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    texte = squeletteMois(mois);
  }
  const precedentes = {};
  for (const m of (await chargerDonnees(dossier)).mois) {
    if (m.mois >= mois) break;
    for (const a of AXES) if (m.notes[a] !== null) precedentes[a] = m.notes[a];
  }
  const statuts = Object.fromEntries(AXES.map((a) => [a, tendance(precedentes[a], lignes[a]?.note ?? null)]));
  await writeFile(fichier, ecrireReleve(texte, { lignes, engagements }, statuts));
}
