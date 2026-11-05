import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { Toaster } from 'sonner';
import { LineChart, PenLine, RefreshCw, Trophy, UserRound } from 'lucide-react';
import { Fiche } from '@/components/Fiche';
import { Releve } from '@/components/Releve';
import { Succes } from '@/components/Succes';
import { chargerDonnees, cn } from '@/lib/outils';
import type { Donnees } from '@/types';

const Progres = lazy(() => import('@/components/Progres').then((m) => ({ default: m.Progres })));

const ONGLETS = [
  { id: 'fiche', label: 'Fiche', Icone: UserRound },
  { id: 'releve', label: 'Relevé', Icone: PenLine },
  { id: 'progres', label: 'Progrès', Icone: LineChart },
  { id: 'succes', label: 'Succès', Icone: Trophy },
] as const;
type Onglet = (typeof ONGLETS)[number]['id'];

function lire<T>(cle: string, defaut: T): T {
  try { const v = localStorage.getItem(cle); return v === null ? defaut : (JSON.parse(v) as T); } catch { return defaut; }
}
function ecrire(cle: string, valeur: unknown) {
  try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* stockage indisponible : on garde en mémoire */ }
}

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>(() => lire<Onglet>('gml-onglet', 'fiche'));
  const [demo, setDemo] = useState<boolean>(() => lire('gml-demo', false));
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try { setDonnees(await chargerDonnees(demo)); } catch (e) { setErreur((e as Error).message); }
  }, [demo]);

  useEffect(() => { setDonnees(null); void charger(); }, [charger]);
  useEffect(() => { ecrire('gml-onglet', onglet); window.scrollTo({ top: 0 }); }, [onglet]);
  useEffect(() => { ecrire('gml-demo', demo); }, [demo]);

  return (
    <div className="min-h-dvh lg:pl-[232px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[var(--color-trait)] bg-[#0b0d1a] px-4 py-6 lg:flex">
        <p className="px-3 text-[18px] font-bold tracking-[-0.01em]">Growth my life</p>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Sections">
          {ONGLETS.map(({ id, label, Icone }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              aria-current={onglet === id ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                onglet === id ? 'bg-[var(--color-panneau-2)] text-[var(--color-encre)]' : 'text-[var(--color-doux)] hover:bg-[var(--color-panneau)] hover:text-[var(--color-encre)]',
              )}
            >
              <Icone className={cn('size-[18px]', onglet === id && 'text-[var(--color-or)]')} aria-hidden />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3"><InterrupteurDemo demo={demo} setDemo={setDemo} /></div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-trait)]/60 bg-[var(--color-fond)]/90 px-4 pb-3 pt-[calc(12px+env(safe-area-inset-top))] backdrop-blur lg:hidden">
        <p className="text-[17px] font-bold tracking-[-0.01em]">Growth my life</p>
        <InterrupteurDemo demo={demo} setDemo={setDemo} />
      </header>

      <main className="mx-auto max-w-[1180px] px-4 pb-28 pt-5 lg:px-8 lg:pb-12 lg:pt-10">
        {erreur ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <p className="text-[18px] font-semibold">Impossible de charger tes données</p>
            <p className="mt-1 text-[15px] text-[var(--color-doux)]">{erreur}. Vérifie que le serveur tourne et qu’il est joignable, puis réessaie.</p>
            <button onClick={charger} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-panneau-2)] px-4 py-2 text-[15px] font-semibold">
              <RefreshCw className="size-4" aria-hidden /> Réessayer
            </button>
          </div>
        ) : !donnees ? (
          <Squelette />
        ) : onglet === 'fiche' ? (
          <Fiche d={donnees} />
        ) : onglet === 'releve' ? (
          <Releve d={donnees} onEnregistre={charger} />
        ) : onglet === 'progres' ? (
          <Suspense fallback={<Squelette />}><Progres d={donnees} /></Suspense>
        ) : (
          <Succes d={donnees} />
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--color-trait)] bg-[#0b0d1a]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Sections"
      >
        {ONGLETS.map(({ id, label, Icone }) => (
          <button
            key={id}
            onClick={() => setOnglet(id)}
            aria-current={onglet === id ? 'page' : undefined}
            className={cn('flex h-16 flex-col items-center justify-center gap-1 text-[12px] font-medium', onglet === id ? 'text-[var(--color-encre)]' : 'text-[var(--color-sourd)]')}
          >
            <Icone className={cn('size-[22px]', onglet === id && 'text-[var(--color-or)]')} strokeWidth={onglet === id ? 2.25 : 1.75} aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{ style: { background: 'var(--color-panneau-2)', border: '1px solid var(--color-trait)', color: 'var(--color-encre)', fontFamily: 'inherit' } }}
      />
    </div>
  );
}

function InterrupteurDemo({ demo, setDemo }: { demo: boolean; setDemo: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-[14px] font-medium text-[var(--color-doux)]">
      Démo
      <Switch.Root
        checked={demo}
        onCheckedChange={setDemo}
        className="relative h-6 w-10 rounded-full bg-[var(--color-panneau-2)] transition-colors data-[state=checked]:bg-[var(--color-or)]"
      >
        <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-[var(--color-encre)] shadow transition-transform data-[state=checked]:translate-x-[18px]" />
      </Switch.Root>
    </label>
  );
}

function Squelette() {
  return (
    <div className="grid animate-pulse gap-4 lg:grid-cols-2" aria-label="Chargement">
      <div className="h-44 rounded-2xl bg-[var(--color-panneau)]" />
      <div className="h-44 rounded-2xl bg-[var(--color-panneau)]" />
      <div className="h-80 rounded-2xl bg-[var(--color-panneau)]" />
      <div className="h-80 rounded-2xl bg-[var(--color-panneau)]" />
    </div>
  );
}
