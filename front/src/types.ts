export type Statut = 'progres' | 'stable' | 'recul' | null;

export interface Sphere {
  id: SphereId;
  nom: string;
  emoji: string;
  axes: string[];
}

export type SphereId = 'corps' | 'relations' | 'argent' | 'savoir' | 'caractere' | 'systeme';

export interface Fait {
  date: string;
  axe: string;
  texte: string;
  source: string | null;
}

export interface Detail {
  pourquoi?: string;
  ameliorer?: string;
}

export interface Mois {
  mois: string;
  statut: string | null;
  vuJusquAu: string | null;
  notes: Record<string, number | null>;
  objectifs: Record<string, number | null>;
  statuts: Record<string, Statut>;
  moyennes: Record<SphereId, number | null>;
  faits: Fait[];
  details: Record<string, Detail>;
  engagements: string[];
}

export interface Succes {
  id: string;
  titre: string;
  detail: string;
  obtenu: boolean;
}

export interface Jeu {
  global: number | null;
  niveau: number;
  versNiveau: number | null;
  xp: number;
  serie: number;
  meilleureSerie: number;
  succes: Succes[];
}

export interface Donnees {
  spheres: Sphere[];
  descriptions: Record<string, string>;
  mois: Mois[];
  tendances: Record<string, Statut>;
  dernierReleve: string | null;
  moisEnCours: string;
  frise: string[];
  jeu: Jeu;
  nom: string;
  coach: string;
  demo: boolean;
}

export interface Saisie {
  lignes: Record<string, { note: number | null; objectif: number | null; pourquoi: string; ameliorer: string }>;
  engagements: string[];
}
