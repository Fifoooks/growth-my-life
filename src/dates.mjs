const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const deux = (n) => String(n).padStart(2, '0');

export const cleMois = (d) => `${d.getFullYear()}-${deux(d.getMonth() + 1)}`;

export const horodatage = (d) => `${cleMois(d)}-${deux(d.getDate())}T${deux(d.getHours())}:${deux(d.getMinutes())}`;

export function titreMois(cle) {
  const [annee, mois] = cle.split('-').map(Number);
  const nom = MOIS_FR[mois - 1];
  return `${nom[0].toUpperCase()}${nom.slice(1)} ${annee}`;
}

export function frise(debut, fin) {
  const resultat = [];
  let [a, m] = debut.split('-').map(Number);
  const [af, mf] = fin.split('-').map(Number);
  while (a < af || (a === af && m <= mf)) {
    resultat.push(`${a}-${deux(m)}`);
    m += 1;
    if (m > 12) { m = 1; a += 1; }
  }
  return resultat;
}

export function moisPrecedent(cle) {
  const [a, m] = cle.split('-').map(Number);
  return m === 1 ? `${a - 1}-12` : `${a}-${deux(m - 1)}`;
}
