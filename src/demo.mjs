// Données fictives pour le mode démo : jamais lues ni écrites dans le vault.
import { AXES, SPHERES, sphereDe } from './axes.mjs';
import { cleMois, frise, moisPrecedent } from './dates.mjs';

const BASE = {
  Sport: 58, Santé: 66, Alimentation: 48, Sommeil: 42, Esthétique: 55,
  'Amour, amitié, famille': 70, Sociabilité: 52,
  Carrière: 50, Business: 34, Trading: 45, 'Gestion financière': 47,
  'Lecture / écriture': 38, Connaissance: 60, Langage: 44, Art: 30,
  'Développement personnel': 55, 'Gestion des émotions': 46, Résilience: 52, Humilité: 50,
  'Ne pas se plaindre': 35, Reconnaissance: 48, Spiritualité: 25,
  Productivité: 50, Organisation: 40,
};
const PENTE = { Sport: 2.2, Sommeil: 1.4, Business: 2.4, 'Lecture / écriture': 1.8, 'Ne pas se plaindre': 2, Organisation: 2.1, Spiritualité: 0.6, Trading: -0.4 };

const POURQUOI = {
  corps: ['Trois séances par semaine tenues, le cardio revient.', 'Couché trop tard en semaine, rattrapé le week-end.', 'Cuisine maison quatre soirs sur sept.'],
  relations: ['Deux dîners avec les amis, un appel par semaine à la famille.', 'Moins disponible ce mois-ci, beaucoup de travail.'],
  argent: ['Premier client signé, la facture est partie.', 'Budget tenu, 300 € investis.', 'Deux entretiens passés, un retour positif.'],
  savoir: ['Deux livres finis, des notes prises sur chacun.', 'Moins lu, beaucoup de podcasts.'],
  caractere: ['Méditation reprise, dix minutes le matin.', 'Plus calme dans les discussions tendues.', 'Je me suis plaint moins souvent, je l’ai remarqué.'],
  systeme: ['Semaine planifiée chaque dimanche.', 'Trop de choses ouvertes en même temps.'],
};
const PROPRES = {
  Sport: ['Trois séances par semaine tenues, le cardio revient.', 'Deux séances seulement, genou fragile.', 'Record au développé couché, régulier tout le mois.'],
  Sommeil: ['Couché trop tard en semaine, rattrapé le week-end.', 'Sept heures en moyenne, réveil plus facile.'],
  Alimentation: ['Cuisine maison quatre soirs sur sept.', 'Trop de livraisons pendant le rush.'],
  Trading: ['Plan respecté, mais trois stops d’affilée.', 'Pause volontaire, pas de trade forcé.'],
  'Lecture / écriture': ['Deux livres finis, des notes prises sur chacun.', 'Moins lu, beaucoup de podcasts.'],
  'Ne pas se plaindre': ['Je me suis plaint moins souvent, je l’ai remarqué.', 'Râlé au travail, conscient après coup.'],
};
const AMELIORER = {
  corps: 'Bloquer les séances dans le calendrier comme des rendez-vous.',
  relations: 'Un moment sans téléphone par semaine avec un proche.',
  argent: 'Une action commerciale par jour, même petite.',
  savoir: 'Vingt minutes de lecture avant de dormir, écran coupé.',
  caractere: 'Noter une gratitude chaque soir.',
  systeme: 'Trois priorités par jour, pas plus.',
};

function aleatoire(graine) {
  let x = graine;
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
}

export function relevesDemo(aujourdhui = new Date()) {
  const fin = moisPrecedent(cleMois(aujourdhui));
  let debut = fin;
  for (let i = 0; i < 13; i += 1) debut = moisPrecedent(debut);
  const mois = frise(debut, fin).filter((_, i) => i !== 5);
  const hasard = aleatoire(42);
  const releves = mois.map((cle, i) => {
    const notes = {};
    const details = {};
    for (const a of AXES) {
      const brut = BASE[a] + (PENTE[a] ?? 1) * i + (hasard() - 0.5) * 10;
      notes[a] = Math.max(5, Math.min(100, Math.round(brut)));
      const s = sphereDe(a);
      const phrases = PROPRES[a] ?? POURQUOI[s];
      details[a] = { pourquoi: phrases[(i + a.length) % phrases.length], ameliorer: AMELIORER[s] };
    }
    return {
      mois: cle, statut: 'relevé', vuJusquAu: null, faits: [],
      notes, objectifs: Object.fromEntries(AXES.map((a) => [a, i === 0 ? 90 : null])),
      details,
      engagements: i === mois.length - 1 ? ['Trois séances de sport par semaine', 'Coucher avant 23 h en semaine', 'Une action commerciale par jour'] : [],
    };
  });
  const courant = cleMois(aujourdhui);
  const jour = (j) => `${courant}-${String(Math.min(j, 28)).padStart(2, '0')}`;
  releves.push({
    mois: courant, statut: 'en cours', vuJusquAu: null, notes: Object.fromEntries(AXES.map((a) => [a, null])),
    objectifs: Object.fromEntries(AXES.map((a) => [a, null])), details: {}, engagements: [],
    faits: [
      { date: jour(2), axe: 'Sport', texte: 'Séance jambes, record au squat', source: '[[Journal]]' },
      { date: jour(3), axe: 'Business', texte: 'Devis envoyé à un deuxième client', source: 'projet atelier' },
      { date: jour(4), axe: 'Lecture / écriture', texte: 'Note de lecture publiée sur un livre de stratégie', source: '[[Notes]]' },
      { date: jour(5), axe: 'Productivité', texte: 'Semaine du lundi : 31 h de focus (6,2 h/j)', source: 'Promethee' },
      { date: jour(6), axe: 'Sociabilité', texte: 'Afterwork avec l’équipe', source: '[[Journal]]' },
      { date: jour(8), axe: 'Gestion financière', texte: 'Budget du mois bouclé, épargne versée', source: '[[Finances]]' },
    ],
  });
  return releves;
}

export const NOM_DEMO = 'Alex';
export { SPHERES };
