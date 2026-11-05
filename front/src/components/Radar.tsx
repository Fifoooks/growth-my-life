import { motion, useReducedMotion } from 'motion/react';

export interface AxeRadar {
  label: string;
  valeur: number | null;
}

interface Props {
  axes: AxeRadar[];
  fantome?: (number | null)[];
  couleur: string;
  /** Change quand le jeu de données change de nature (sphère ouverte) : rejoue la croissance depuis le centre. */
  cle: string;
  onAxe?: (index: number) => void;
  titre: string;
  /** Une couleur par sommet (la couleur de chaque sphère). */
  couleursPoints?: string[];
}

const C = 180;
const R = 112;

function point(i: number, n: number, rayon: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [C + rayon * Math.cos(angle), C + rayon * Math.sin(angle)];
}

function chemin(valeurs: (number | null)[]): string {
  return valeurs
    .map((v, i) => {
      const [x, y] = point(i, valeurs.length, (R * Math.max(v ?? 0, 0)) / 100);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}

function lignes(label: string): string[] {
  if (label.length <= 13 || !label.includes(' ')) return [label];
  const mots = label.split(' ');
  let meilleur = 1;
  let ecart = Infinity;
  for (let k = 1; k < mots.length; k += 1) {
    const d = Math.abs(mots.slice(0, k).join(' ').length - mots.slice(k).join(' ').length);
    if (d < ecart) { ecart = d; meilleur = k; }
  }
  return [mots.slice(0, meilleur).join(' '), mots.slice(meilleur).join(' ')];
}

export function Radar({ axes, fantome, couleur, cle, onAxe, titre, couleursPoints }: Props) {
  const calme = useReducedMotion();
  const n = axes.length;
  const valeurs = axes.map((a) => a.valeur);
  const anneaux = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 360 360" role="img" aria-label={titre} className="w-full max-w-[420px] overflow-visible lg:max-w-[500px]">
      {anneaux.map((f) => (
        <path
          key={f}
          d={chemin(Array(n).fill(f * 100))}
          fill="none"
          stroke="var(--color-trait)"
          strokeWidth={f === 1 ? 1.25 : 1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, n, R);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--color-trait)" strokeWidth={1} />;
      })}
      {fantome && (
        <path
          d={chemin(fantome)}
          fill="none"
          stroke="var(--color-doux)"
          strokeOpacity={0.45}
          strokeWidth={1.25}
          strokeDasharray="4 4"
        />
      )}
      <motion.g
        key={cle}
        initial={calme ? false : { scale: 0.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.9 }}
        style={{ transformOrigin: `${C}px ${C}px` }}
      >
        <motion.path
          initial={false}
          animate={{ d: chemin(valeurs) }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          fill={couleur}
          fillOpacity={0.16}
          stroke={couleur}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {valeurs.map((v, i) => {
          if (v === null) return null;
          const [x, y] = point(i, n, (R * v) / 100);
          return <circle key={i} cx={x} cy={y} r={couleursPoints ? 5 : 3.5} fill={couleursPoints ? couleursPoints[i] : "var(--color-fond)"} stroke={couleursPoints ? "var(--color-panneau)" : couleur} strokeWidth={2} />;
        })}
      </motion.g>
      {axes.map((a, i) => {
        const [x, y] = point(i, n, R + 30);
        const morceaux = lignes(a.label);
        const ancre = Math.abs(x - C) < 8 ? 'middle' : x > C ? 'start' : 'end';
        const decalage = (morceaux.length - 1) * 7;
        return (
          <g
            key={a.label}
            role={onAxe ? 'button' : undefined}
            tabIndex={onAxe ? 0 : undefined}
            aria-label={onAxe ? `${a.label}, ${a.valeur ?? 'pas de note'}` : undefined}
            onClick={onAxe ? () => onAxe(i) : undefined}
            onKeyDown={onAxe ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAxe(i); } } : undefined}
            className={onAxe ? 'cursor-pointer outline-none [&:focus-visible_text]:fill-[var(--color-or)]' : undefined}
          >
            <text x={x} y={y - decalage - 4} textAnchor={ancre} className="fill-[var(--color-doux)] text-[11px] font-semibold uppercase tracking-[0.08em]">
              {morceaux.map((m, k) => (
                <tspan key={k} x={x} dy={k === 0 ? 0 : 13}>{m}</tspan>
              ))}
            </text>
            <text x={x} y={y + decalage + 14} textAnchor={ancre} className="fill-[var(--color-encre)] text-[15px] font-semibold">
              {a.valeur ?? '—'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
