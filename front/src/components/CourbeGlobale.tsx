import { motion, useReducedMotion } from 'motion/react';
import { Bloc } from './petits';
import { nomMois } from '@/lib/outils';
import type { Donnees } from '@/types';

const L = 360;
const H = 170;
const M = { haut: 20, droite: 14, bas: 22, gauche: 26 };

/** Le score global (moyenne des 24 notes) de chaque mois, trous compris. */
export function CourbeGlobale({ d }: { d: Donnees }) {
  const calme = useReducedMotion();
  const parMois = Object.fromEntries(d.mois.map((m) => [m.mois, m]));
  const valeurs = d.frise.map((cle) => {
    const notes = Object.values(parMois[cle]?.notes ?? {}).filter((n): n is number => n !== null);
    return notes.length ? Math.round(notes.reduce((a, b) => a + b, 0) / notes.length) : null;
  });
  const dernier = [...valeurs].reverse().find((v) => v !== null) ?? null;
  const premier = valeurs.find((v) => v !== null) ?? null;

  if (d.frise.length < 2) {
    return (
      <Bloc>
        <h2 className="text-[18px] font-semibold">Ta courbe</h2>
        <p className="mt-2 text-[14px] text-[var(--color-doux)]">
          Elle se trace à partir de deux mois notés. Après ton prochain relevé, tu verras d’où tu pars et où tu vas.
        </p>
      </Bloc>
    );
  }

  const presentes = valeurs.filter((v): v is number => v !== null);
  // L'échelle se resserre sur tes valeurs : une progression de 10 points doit se voir.
  const bas = Math.max(0, Math.floor((Math.min(...presentes) - 10) / 10) * 10);
  const haut = Math.min(100, Math.ceil((Math.max(...presentes) + 10) / 10) * 10);
  const x = (i: number) => M.gauche + (i * (L - M.gauche - M.droite)) / (valeurs.length - 1);
  const y = (v: number) => M.haut + ((haut - v) * (H - M.haut - M.bas)) / (haut - bas);
  const segments: string[] = [];
  let courant = '';
  valeurs.forEach((v, i) => {
    if (v === null) { if (courant) segments.push(courant); courant = ''; return; }
    courant += `${courant ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
  });
  if (courant) segments.push(courant);
  // Le pointillé relie les relevés par-dessus les mois vides : on voit la tendance sans inventer de chiffre.
  const pont = valeurs.map((v, i) => (v === null ? null : `${x(i).toFixed(1)} ${y(v).toFixed(1)}`)).filter(Boolean).map((p, k) => `${k ? 'L' : 'M'}${p}`).join(' ');
  const ecart = premier !== null && dernier !== null ? dernier - premier : null;
  const iDernier = valeurs.length - 1 - [...valeurs].reverse().findIndex((v) => v !== null);

  return (
    <Bloc className="pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[18px] font-semibold">Ta courbe</h2>
        {ecart !== null && (
          <span className="text-[14px] text-[var(--color-doux)]">
            <span className={ecart >= 0 ? 'font-semibold text-[var(--color-progres)]' : 'font-semibold text-[var(--color-recul)]'}>
              {ecart >= 0 ? '+' : ''}{ecart} pts
            </span>{' '}depuis {nomMois(d.frise[0])}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${L} ${H}`} className="mt-3 w-full lg:max-h-[260px]" role="img" aria-label="Score global mois par mois">
        {[bas, Math.round((bas + haut) / 2), haut].map((v) => (
          <g key={v}>
            <line x1={M.gauche} x2={L - M.droite} y1={y(v)} y2={y(v)} stroke="var(--color-trait)" strokeWidth={1} />
            <text x={M.gauche - 6} y={y(v) + 4} textAnchor="end" className="fill-[var(--color-sourd)] text-[10px]">{v}</text>
          </g>
        ))}
        {valeurs.map((v, i) => v === null && (
          <rect key={i} x={x(i) - 5} y={M.haut} width={10} height={H - M.haut - M.bas} rx={3} fill="var(--color-panneau-2)" opacity={0.6}>
            <title>{nomMois(d.frise[i])} : pas de relevé</title>
          </rect>
        ))}
        <path d={pont} fill="none" stroke="var(--color-or)" strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="3 5" />
        {segments.map((s, k) => (
          <motion.path
            key={k}
            d={s}
            fill="none"
            stroke="var(--color-or)"
            strokeWidth={2.25}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={calme ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 + k * 0.1 }}
          />
        ))}
        {valeurs.map((v, i) => v !== null && (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === iDernier ? 4.5 : 2.5} fill={i === iDernier ? 'var(--color-or)' : 'var(--color-fond)'} stroke="var(--color-or)" strokeWidth={2}>
            <title>{nomMois(d.frise[i])} : {v}</title>
          </circle>
        ))}
        {dernier !== null && (
          <text x={x(iDernier)} y={y(dernier) - 12} textAnchor="end" className="fill-[var(--color-encre)] text-[13px] font-semibold">{dernier}</text>
        )}
        <text x={M.gauche} y={H - 6} className="fill-[var(--color-sourd)] text-[10px]">{nomMois(d.frise[0], 'court')}</text>
        <text x={L - M.droite} y={H - 6} textAnchor="end" className="fill-[var(--color-sourd)] text-[10px]">{nomMois(d.frise.at(-1)!, 'court')}</text>
      </svg>
    </Bloc>
  );
}
