import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn, STATUT } from '@/lib/outils';
import type { Statut } from '@/types';

/** Dix crans de niveau : un cran par dizaine de points. */
export function Crans({ note, couleur = 'var(--color-pip)', className }: { note: number | null; couleur?: string; className?: string }) {
  const pleins = note === null ? 0 : Math.floor(note / 10);
  return (
    <span className={cn('flex gap-[3px]', className)} aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className="h-2 flex-1 rounded-[2px] transition-colors duration-300"
          style={{ background: i < pleins ? couleur : 'var(--color-panneau-2)' }}
        />
      ))}
    </span>
  );
}

export function BadgeStatut({ statut, className }: { statut: Statut; className?: string }) {
  if (!statut) return null;
  const Icone = statut === 'progres' ? ArrowUpRight : statut === 'recul' ? ArrowDownRight : ArrowRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold',
        statut === 'progres' && 'bg-[color-mix(in_oklab,var(--color-progres)_16%,transparent)] text-[var(--color-progres)]',
        statut === 'recul' && 'bg-[color-mix(in_oklab,var(--color-recul)_16%,transparent)] text-[var(--color-recul)]',
        statut === 'stable' && 'bg-[var(--color-panneau-2)] text-[var(--color-doux)]',
        className,
      )}
    >
      <Icone className="size-3.5" strokeWidth={2.25} aria-hidden />
      {STATUT[statut]}
    </span>
  );
}

/** Un nombre qui monte jusqu'à sa valeur, une seule fois. */
export function Compteur({ valeur, className }: { valeur: number | null; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const calme = useReducedMotion();
  useEffect(() => {
    const noeud = ref.current;
    if (!noeud) return;
    if (valeur === null) { noeud.textContent = '—'; return; }
    if (calme) { noeud.textContent = String(valeur); return; }
    const controle = animate(0, valeur, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { noeud.textContent = String(Math.round(v)); },
    });
    return () => controle.stop();
  }, [valeur, calme]);
  return <span ref={ref} className={className}>{valeur ?? '—'}</span>;
}

export function Bloc({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-2xl bg-[var(--color-panneau)] p-5', className)}>{children}</section>;
}
