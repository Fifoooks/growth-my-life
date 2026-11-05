import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import { chaleur, cn, nomMois } from '@/lib/outils';
import type { Donnees } from '@/types';

const MOYENNE = (notes: Record<string, number | null>) => {
  const v = Object.values(notes).filter((n): n is number => n !== null);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
};
const NOM = (cle: string) => new Date(`${cle}-01T12:00:00`).toLocaleDateString('fr-FR', { month: 'long' });

/** Choisir le mois du relevé, comme un menu de téléphone : une feuille qui monte du bas, une liste groupée par année. */
export function ChoixMois({ d, choix, mois, onChange }: { d: Donnees; choix: string[]; mois: string; onChange: (m: string) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const moyennes = Object.fromEntries(d.mois.map((m) => [m.mois, MOYENNE(m.notes)]));
  const annees = [...new Set(choix.map((c) => c.slice(0, 4)))].sort().reverse();

  return (
    <Dialog.Root open={ouvert} onOpenChange={setOuvert}>
      <Dialog.Trigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-trait)] bg-[var(--color-panneau)] px-4 py-3 text-left transition-colors hover:border-[var(--color-sourd)] sm:w-auto">
          <CalendarDays className="size-5 text-[var(--color-or)]" aria-hidden />
          <span className="flex-1">
            <span className="block text-[12px] text-[var(--color-sourd)]">Mois du relevé</span>
            <span className="block text-[16px] font-semibold capitalize text-[var(--color-encre)]">{nomMois(mois)}</span>
          </span>
          <ChevronDown className="size-4 text-[var(--color-sourd)]" aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-3xl bg-[var(--color-fond)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-[var(--color-trait)]">
          <div className="relative flex shrink-0 items-center justify-center border-b border-[var(--color-trait)] px-5 pb-3 pt-2">
            <span className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-[var(--color-trait)] sm:hidden" aria-hidden />
            <Dialog.Title className="mt-3 text-[16px] font-semibold">Mois du relevé</Dialog.Title>
            <Dialog.Close className="absolute right-4 top-4 text-[16px] font-semibold text-[var(--color-or)]">OK</Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Choisis le mois à relever. La pastille donne ta moyenne du mois.</Dialog.Description>

          <div className="overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {annees.map((an) => (
              <section key={an} className="mt-5">
                <h3 className="mb-1.5 px-4 text-[13px] font-medium uppercase tracking-wide text-[var(--color-sourd)]">{an}</h3>
                <ul className="overflow-hidden rounded-2xl bg-[var(--color-panneau)]">
                  {choix.filter((c) => c.startsWith(an)).map((cle) => {
                    const moy = moyennes[cle] ?? null;
                    const actif = cle === mois;
                    return (
                      <li key={cle} className="border-b border-[var(--color-trait)] last:border-b-0">
                        <button
                          onClick={() => { onChange(cle); setOuvert(false); }}
                          aria-current={actif ? 'true' : undefined}
                          className="flex h-[52px] w-full items-center gap-3 px-4 text-left transition-colors active:bg-[var(--color-panneau-2)]"
                        >
                          <span className={cn('flex-1 text-[16px] capitalize', actif ? 'font-semibold text-[var(--color-encre)]' : 'text-[var(--color-encre)]')}>{NOM(cle)}</span>
                          {moy !== null
                            ? <span className="rounded-full px-2 text-[12px] font-semibold leading-5 text-[#10121f]" style={{ background: chaleur(moy) }} title="Ta moyenne du mois">{moy}</span>
                            : <span className="text-[13px] text-[var(--color-or)]">à noter</span>}
                          <Check className={cn('size-5 text-[var(--color-or)]', !actif && 'invisible')} strokeWidth={2.5} aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
