import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Donnees, Mois, Saisie, SphereId, Statut } from '@/types';

export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes));

export const COULEUR: Record<SphereId, string> = {
  corps: 'var(--color-corps)',
  relations: 'var(--color-relations)',
  argent: 'var(--color-argent)',
  savoir: 'var(--color-savoir)',
  caractere: 'var(--color-caractere)',
  systeme: 'var(--color-systeme)',
};

export const COURT: Record<SphereId, string> = {
  corps: 'Corps',
  relations: 'Relations',
  argent: 'Argent',
  savoir: 'Savoir',
  caractere: 'Caractère',
  systeme: 'Système',
};

export const STATUT: Record<Exclude<Statut, null>, string> = {
  progres: 'En progrès',
  stable: 'Stagnation',
  recul: 'Recule',
};

export const SEUIL = 5;

export function statutDe(avant: number | null | undefined, apres: number | null | undefined): Statut {
  if (typeof avant !== 'number' || typeof apres !== 'number') return null;
  if (apres - avant >= SEUIL) return 'progres';
  if (apres - avant <= -SEUIL) return 'recul';
  return 'stable';
}

/** Rampe de chaleur des notes : rouge, sable, olive, vert. */
export function chaleur(note: number | null | undefined): string {
  if (typeof note !== 'number') return 'transparent';
  if (note < 30) return '#a8352a';
  if (note < 50) return '#b98744';
  if (note < 65) return '#97994a';
  if (note < 80) return '#6f9f4e';
  return '#3f9a5f';
}

export function nomMois(cle: string, format: 'long' | 'court' = 'long'): string {
  const date = new Date(`${cle}-01T12:00:00`);
  return date.toLocaleDateString('fr-FR', format === 'long' ? { month: 'long', year: 'numeric' } : { month: 'short', year: '2-digit' });
}

const ABREGES = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
export const moisAbrege = (cle: string) => ABREGES[Number(cle.slice(5, 7)) - 1];

/** « de novembre 2026 », « d’octobre 2026 » : l’élision devant voyelle. */
export function deMois(cle: string): string {
  const nom = nomMois(cle);
  return /^[aeiouyàâéèêîôû]/i.test(nom) ? `d’${nom}` : `de ${nom}`;
}

export function moisPrecedent(cle: string): string {
  const [a, m] = cle.split('-').map(Number);
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
}

export const sphereDe = (d: Donnees, axe: string) => d.spheres.find((s) => s.axes.includes(axe))!;

export const notesDuMois = (m: Mois) => Object.values(m.notes).some((n) => n !== null);

export function relevesNotes(d: Donnees): Mois[] {
  return d.mois.filter(notesDuMois);
}

export function notesAvant(d: Donnees, mois: string): Record<string, number> {
  const resultat: Record<string, number> = {};
  for (const m of d.mois) {
    if (m.mois >= mois) break;
    for (const [axe, note] of Object.entries(m.notes)) if (note !== null) resultat[axe] = note;
  }
  return resultat;
}

export function objectifAvant(d: Donnees, mois: string, axe: string): number | null {
  let objectif: number | null = null;
  for (const m of d.mois) {
    if (m.mois > mois) break;
    if (m.objectifs[axe] !== null) objectif = m.objectifs[axe];
  }
  return objectif;
}

export async function chargerDonnees(demo: boolean): Promise<Donnees> {
  const reponse = await fetch(`/api/donnees${demo ? '?demo=1' : ''}`);
  if (!reponse.ok) throw new Error(`Le serveur a répondu ${reponse.status}`);
  return reponse.json();
}

export async function enregistrerReleve(mois: string, saisie: Saisie): Promise<void> {
  const reponse = await fetch(`/api/releve/${mois}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(saisie),
  });
  if (!reponse.ok) throw new Error((await reponse.text()) || `Erreur ${reponse.status}`);
}
