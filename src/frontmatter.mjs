const EN_TETE = /^---\n([\s\S]*?)\n---\n?/;

function valeur(brut) {
  const v = brut.trim().replace(/^["']|["']$/g, '');
  if (v === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

const cleDe = (ligne) => (ligne.includes(':') ? ligne.slice(0, ligne.indexOf(':')).trim() : null);

export function lireEntete(texte) {
  const t = texte.replace(/\r\n/g, '\n');
  const m = t.match(EN_TETE);
  if (!m) return { entete: {}, corps: texte };
  const entete = {};
  for (const ligne of m[1].split('\n')) {
    const cle = cleDe(ligne);
    if (cle) entete[cle] = valeur(ligne.slice(ligne.indexOf(':') + 1));
  }
  return { entete, corps: t.slice(m[0].length) };
}

export function ecrireCle(texte, cle, val) {
  const t = texte.replace(/\r\n/g, '\n');
  const m = t.match(EN_TETE);
  if (!m) throw new Error("Pas d'en-tête dans le fichier");
  const lignes = m[1].split('\n');
  const i = lignes.findIndex((l) => cleDe(l) === cle);
  const nouvelle = `${cle}: ${val ?? ''}`;
  if (i >= 0) lignes[i] = nouvelle;
  else lignes.push(nouvelle);
  return `---\n${lignes.join('\n')}\n---\n${t.slice(m[0].length)}`;
}
