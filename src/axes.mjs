export const SPHERES = [
  { id: 'corps', nom: 'Corps & Santé', emoji: '🫀', axes: ['Sport', 'Santé', 'Alimentation', 'Sommeil', 'Esthétique'] },
  { id: 'relations', nom: 'Relations', emoji: '❤️', axes: ['Amour, amitié, famille', 'Sociabilité'] },
  { id: 'argent', nom: 'Argent & Métier', emoji: '💰', axes: ['Carrière', 'Business', 'Trading', 'Gestion financière'] },
  { id: 'savoir', nom: 'Savoir & Création', emoji: '📚', axes: ['Lecture / écriture', 'Connaissance', 'Langage', 'Art'] },
  {
    id: 'caractere', nom: 'Caractère & Intérieur', emoji: '🧭',
    axes: ['Développement personnel', 'Gestion des émotions', 'Résilience', 'Humilité', 'Ne pas se plaindre', 'Reconnaissance', 'Spiritualité'],
  },
  { id: 'systeme', nom: 'Système & Efficacité', emoji: '⚙️', axes: ['Productivité', 'Organisation'] },
];

export const AXES = SPHERES.flatMap((s) => s.axes);

export function sphereDe(axe) {
  return SPHERES.find((s) => s.axes.includes(axe))?.id ?? null;
}
