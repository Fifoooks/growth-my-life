import { useEffect, useMemo, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { toast } from 'sonner';
import { Check, Eye, Loader2, Lock } from 'lucide-react';
import { BadgeStatut } from './petits';
import { ChoixMois } from './ChoixMois';
import { COULEUR, cn, deMois, enregistrerReleve, moisPrecedent, nomMois, notesAvant, objectifAvant, statutDe } from '@/lib/outils';
import type { Donnees, Saisie } from '@/types';

type Ligne = Saisie['lignes'][string];

function etatInitial(d: Donnees, mois: string): Saisie {
  const m = d.mois.find((x) => x.mois === mois);
  const lignes: Saisie['lignes'] = {};
  for (const s of d.spheres) {
    for (const a of s.axes) {
      lignes[a] = {
        note: m?.notes[a] ?? null,
        objectif: objectifAvant(d, mois, a),
        pourquoi: m?.details[a]?.pourquoi ?? '',
        ameliorer: m?.details[a]?.ameliorer ?? '',
      };
    }
  }
  return { lignes, engagements: [0, 1, 2].map((i) => m?.engagements[i] ?? '') };
}

export function Releve({ d, onEnregistre }: { d: Donnees; onEnregistre: () => Promise<void> }) {
  const choix = useMemo(() => {
    const tous = new Set(d.mois.map((m) => m.mois));
    tous.add(d.moisEnCours);
    tous.add(moisPrecedent(d.moisEnCours));
    return [...tous].sort().reverse();
  }, [d]);
  const [mois, setMois] = useState(moisPrecedent(d.moisEnCours));
  const [saisie, setSaisie] = useState<Saisie>(() => etatInitial(d, mois));
  const [modifie, setModifie] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const precedentes = useMemo(() => notesAvant(d, mois), [d, mois]);
  const faits = useMemo(() => [...(d.mois.find((m) => m.mois === mois)?.faits ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [d, mois]);

  useEffect(() => { setSaisie(etatInitial(d, mois)); setModifie(false); }, [d, mois]);

  const changer = (axe: string, partiel: Partial<Ligne>) => {
    setSaisie((s) => ({ ...s, lignes: { ...s.lignes, [axe]: { ...s.lignes[axe], ...partiel } } }));
    setModifie(true);
  };
  const notees = Object.values(saisie.lignes).filter((l) => l.note !== null).length;

  async function enregistrer() {
    setEnvoi(true);
    try {
      await enregistrerReleve(mois, { ...saisie, engagements: saisie.engagements.filter((e) => e.trim()) });
      await onEnregistre();
      setModifie(false);
      toast.success(`Relevé de ${nomMois(mois)} enregistré dans le vault.`);
    } catch (e) {
      toast.error(`Pas enregistré : ${(e as Error).message}`);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.01em]">Le relevé</h1>
          <p className="mt-1 max-w-prose text-[15px] text-[var(--color-doux)]">
            Pour chaque compétence, une note et ton pourquoi, en vrac. {d.coach} écrit « comment m’améliorer » après la rétrospective.
          </p>
        </div>
        <ChoixMois d={d} choix={choix} mois={mois} onChange={setMois} />
      </div>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-[var(--color-panneau)] px-4 py-3 text-[14px] text-[var(--color-doux)]">
        <Eye className="mt-0.5 size-4 shrink-0 text-[var(--color-or)]" aria-hidden />
        {faits.length
          ? <span>L’agent a vu <span className="font-semibold text-[var(--color-encre)]">{faits.length} faits</span> pour le relevé {deMois(mois)}. Ils sont rangés sous chaque compétence : note-toi face à eux.</span>
          : <span>Aucun fait relevé par l’agent pour {nomMois(mois)}. Note-toi sur ce que tu as vécu.</span>}
      </p>

      {d.demo && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-panneau-2)] px-4 py-3 text-[14px] text-[var(--color-doux)]">
          <Lock className="size-4" aria-hidden /> Mode démo : tu peux jouer avec, rien n’est enregistré.
        </p>
      )}

      {d.spheres.map((s) => (
        <section key={s.id} className="mt-8">
          <h2 className="mb-1 flex items-center gap-2.5 text-[18px] font-semibold">
            <span className="size-2.5 rounded-full" style={{ background: COULEUR[s.id] }} aria-hidden />
            {s.nom}
          </h2>
          <ul className="divide-y divide-[var(--color-trait)]">
            {s.axes.map((a) => {
              const ligne = saisie.lignes[a];
              const statut = statutDe(precedentes[a], ligne.note);
              const id = `pourquoi-${a.replace(/\W+/g, '-')}`;
              return (
                <li key={a} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-semibold">{a}</h3>
                      <p className="text-[13px] text-[var(--color-sourd)]">{d.descriptions[a]}</p>
                      {faits.some((f) => f.axe === a) && (
                        <ul className="mt-2 space-y-1">
                          {faits.filter((f) => f.axe === a).map((f, k) => (
                            <li key={k} className="grid grid-cols-[42px_1fr] gap-1.5 text-[13px] leading-snug">
                              <time className="text-[var(--color-sourd)]">{Number(f.date.slice(8))}/{f.date.slice(5, 7)}</time>
                              <span className="text-[var(--color-doux)]">{f.texte}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <BadgeStatut statut={statut} />
                      <span className={cn('w-11 text-right text-[28px] font-bold tabular-nums leading-none', ligne.note === null && 'text-[var(--color-sourd)]')}>
                        {ligne.note ?? '—'}
                      </span>
                    </div>
                  </div>
                  <Slider.Root
                    className="relative mt-3 flex h-6 w-full touch-none select-none items-center"
                    min={0}
                    max={100}
                    step={5}
                    value={[ligne.note ?? 50]}
                    onValueChange={([v]) => changer(a, { note: v })}
                    aria-label={`Note de ${a}`}
                  >
                    <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-[var(--color-panneau-2)]">
                      <Slider.Range className="absolute h-full rounded-full" style={{ background: ligne.note === null ? 'transparent' : COULEUR[s.id] }} />
                    </Slider.Track>
                    <Slider.Thumb
                      className={cn(
                        'block size-5 rounded-full border-2 bg-[var(--color-fond)] shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform active:scale-110',
                        ligne.note === null && 'opacity-50',
                      )}
                      style={{ borderColor: COULEUR[s.id] }}
                    />
                  </Slider.Root>
                  {precedentes[a] !== undefined && (
                    <p className="mt-1 text-[12px] text-[var(--color-sourd)]">Dernière note : {precedentes[a]}</p>
                  )}
                  <label htmlFor={id} className="sr-only">Pourquoi cette note, {a}</label>
                  <textarea
                    id={id}
                    rows={2}
                    value={ligne.pourquoi}
                    onChange={(e) => changer(a, { pourquoi: e.target.value })}
                    placeholder="Pourquoi cette note ? Vide ton sac."
                    className="mt-3 w-full resize-y rounded-xl border border-[var(--color-trait)] bg-[var(--color-panneau)] px-3.5 py-2.5 text-[15px] leading-relaxed placeholder:text-[var(--color-sourd)] focus:border-[var(--color-or)]"
                  />
                  {ligne.ameliorer && (
                    <p className="mt-2 text-[14px]"><span className="font-semibold text-[var(--color-or)]">{d.coach} · </span>{ligne.ameliorer}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="mb-1 text-[18px] font-semibold">Trois engagements pour le mois suivant</h2>
        <p className="mb-3 text-[14px] text-[var(--color-doux)]">Pas plus. Ils partent dans tes tâches.</p>
        <div className="space-y-2">
          {saisie.engagements.map((e, i) => (
            <input
              key={i}
              value={e}
              onChange={(ev) => { const suite = [...saisie.engagements]; suite[i] = ev.target.value; setSaisie({ ...saisie, engagements: suite }); setModifie(true); }}
              placeholder={`Engagement ${i + 1}`}
              aria-label={`Engagement ${i + 1}`}
              className="w-full rounded-xl border border-[var(--color-trait)] bg-[var(--color-panneau)] px-3.5 py-2.5 text-[15px] placeholder:text-[var(--color-sourd)] focus:border-[var(--color-or)]"
            />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 px-4 lg:bottom-6 lg:left-[232px]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-[var(--color-trait)] bg-[var(--color-panneau-2)]/95 px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur">
          <span className="text-[14px] text-[var(--color-doux)]">
            {notees}/24 notées{modifie ? ' · modifications non enregistrées' : ''}
          </span>
          <button
            onClick={enregistrer}
            disabled={d.demo || envoi || !modifie}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-or)] px-4 py-2 text-[15px] font-semibold text-[#1d1608] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {envoi ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
