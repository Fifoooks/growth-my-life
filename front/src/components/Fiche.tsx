import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Flame, Telescope } from 'lucide-react';
import { Radar } from './Radar';
import { CourbeGlobale } from './CourbeGlobale';
import { BadgeStatut, Bloc, Compteur, Crans } from './petits';
import { COULEUR, COURT, deMois, moisPrecedent, nomMois, relevesNotes, sphereDe, statutDe } from '@/lib/outils';
import type { Donnees, SphereId } from '@/types';

export function Fiche({ d }: { d: Donnees }) {
  const [ouverte, setOuverte] = useState<SphereId | null>(null);
  const calme = useReducedMotion();
  const notes = relevesNotes(d);
  const dernier = notes.at(-1) ?? null;
  const avant = notes.at(-2) ?? null;
  const { jeu } = d;
  const progression = jeu.global === null ? 0 : (jeu.global % 10) / 10;
  const sphere = ouverte ? d.spheres.find((s) => s.id === ouverte)! : null;
  const enCours = d.mois.find((m) => m.mois === d.moisEnCours);

  const parSphere = useMemo(() => {
    const faits = [...(enCours?.faits ?? [])].sort((a, b) => b.date.localeCompare(a.date));
    return d.spheres.map((s) => ({ s, faits: faits.filter((f) => s.axes.includes(f.axe)) }));
  }, [d, enCours]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6">
      <div className="flex flex-col gap-4">
        <Bloc className="pb-4">
          <div className="flex items-end gap-4">
            <div className="leading-none">
              <Compteur valeur={jeu.global} className="block text-[64px] font-bold tracking-[-0.03em]" />
              <span className="mt-1.5 block whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-doux)]">Score global</span>
            </div>
            <div className="mb-1 min-w-0">
              <p className="truncate text-[22px] font-semibold">{d.nom}</p>
              <p className="text-[14px] text-[var(--color-doux)]">
                {dernier ? `Relevé ${deMois(dernier.mois)}` : 'Aucun relevé noté'}
              </p>
            </div>
            <div
              className="mb-1 ml-auto flex items-center gap-1.5 rounded-full bg-[var(--color-panneau-2)] px-3 py-1.5 text-[14px] font-semibold"
              title={`Meilleure série : ${jeu.meilleureSerie} mois`}
            >
              <Flame className="size-4" style={{ color: jeu.serie > 0 ? 'var(--color-or)' : 'var(--color-sourd)' }} aria-hidden />
              <span>{jeu.serie}</span>
              <span className="text-[var(--color-doux)]">mois</span>
            </div>
          </div>
          <div className="mt-5">
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-panneau-2)]">
              <motion.div
                className="h-full rounded-full bg-[var(--color-or)]"
                initial={calme ? false : { width: '0%' }}
                animate={{ width: `${Math.max(progression * 100, 2)}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[13px] text-[var(--color-doux)]">
              <span className="font-semibold text-[var(--color-encre)]">Niveau {jeu.niveau}</span>
              <span>
                {jeu.versNiveau === null ? 'Pose ton premier relevé' : `${jeu.versNiveau} pts avant le niveau ${jeu.niveau + 1}`} · {jeu.xp.toLocaleString('fr-FR')} XP
              </span>
            </div>
          </div>
          {jeu.serie === 0 && (
            <p className="mt-4 rounded-xl bg-[var(--color-or-sombre)] px-3.5 py-2.5 text-[14px] text-[#f3d58e]">
              La série est à zéro. Elle repart dès que tu poses le relevé {deMois(moisPrecedent(d.moisEnCours))}.
            </p>
          )}
        </Bloc>

        <Bloc className="relative flex flex-col items-center overflow-hidden px-2 py-6">
          <AnimatePresence mode="wait" initial={false}>
            {sphere ? (
              <motion.div key={sphere.id} className="flex w-full flex-col items-center"
                initial={calme ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <button onClick={() => setOuverte(null)} className="mb-1 flex items-center gap-1 self-start rounded-full px-3 py-1 text-[14px] text-[var(--color-doux)] hover:text-[var(--color-encre)]">
                  <ChevronLeft className="size-4" aria-hidden /> Les 6 sphères
                </button>
                <Radar
                  cle={sphere.id}
                  titre={`Compétences de la sphère ${sphere.nom}`}
                  couleur={COULEUR[sphere.id]}
                  axes={sphere.axes.map((a) => ({ label: a, valeur: dernier?.notes[a] ?? null }))}
                  fantome={avant ? sphere.axes.map((a) => avant.notes[a]) : undefined}
                />
              </motion.div>
            ) : (
              <motion.div key="toutes" className="flex w-full flex-col items-center"
                initial={calme ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <Radar
                  cle="toutes"
                  titre="Les six sphères de vie"
                  couleur="var(--color-or)"
                  axes={d.spheres.map((s) => ({ label: COURT[s.id], valeur: dernier?.moyennes[s.id] ?? null }))}
                  fantome={avant ? d.spheres.map((s) => avant.moyennes[s.id]) : undefined}
                  couleursPoints={d.spheres.map((s) => COULEUR[s.id])}
                  onAxe={(i) => setOuverte(d.spheres[i].id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {avant && (
            <p className="mt-2 flex items-center gap-2 text-[12px] text-[var(--color-sourd)]">
              <span className="inline-block w-5 border-t border-dashed border-[var(--color-doux)]/60" aria-hidden />
              {nomMois(avant.mois)}
            </p>
          )}
        </Bloc>
        <CourbeGlobale d={d} />
      </div>

      <div className="flex flex-col gap-4">
        {sphere ? (
          <Bloc>
            <h2 className="mb-1 text-[20px] font-semibold">{sphere.nom}</h2>
            <p className="mb-4 text-[14px] text-[var(--color-doux)]">Moyenne {dernier?.moyennes[sphere.id] ?? '—'} · {sphere.axes.length} compétences</p>
            <ul className="divide-y divide-[var(--color-trait)]">
              {sphere.axes.map((a) => {
                const note = dernier?.notes[a] ?? null;
                const detail = dernier?.details[a];
                return (
                  <li key={a} className="py-4 first:pt-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[16px] font-semibold">{a}</h3>
                      <span className="text-[24px] font-bold tabular-nums">{note ?? '—'}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[var(--color-sourd)]">{d.descriptions[a]}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <Crans note={note} couleur={COULEUR[sphere.id]} className="flex-1" />
                      <span className="w-12 text-right text-[12px] font-semibold text-[var(--color-doux)]">Niv. {note === null ? 0 : Math.floor(note / 10)}</span>
                    </div>
                    {(detail?.pourquoi || dernier?.statuts[a]) && (
                      <div className="mt-3 space-y-2 text-[14px]">
                        <BadgeStatut statut={dernier?.statuts[a] ?? null} />
                        {detail?.pourquoi && <p className="text-[var(--color-doux)]">{detail.pourquoi}</p>}
                        {detail?.ameliorer && (
                          <p className="text-[var(--color-encre)]"><span className="font-semibold text-[var(--color-or)]">{d.coach} · </span>{detail.ameliorer}</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Bloc>
        ) : (
          <Bloc>
            <h2 className="mb-3 text-[18px] font-semibold">Les sphères</h2>
            <ul className="divide-y divide-[var(--color-trait)]">
              {d.spheres.map((s) => {
                const moyenne = dernier?.moyennes[s.id] ?? null;
                const statut = statutDe(avant?.moyennes[s.id], moyenne);
                return (
                  <li key={s.id}>
                    <button onClick={() => setOuverte(s.id)} className="group grid w-full grid-cols-[96px_1fr_auto] items-center gap-3 py-3 text-left">
                      <span className="flex items-center gap-2 text-[15px] font-medium">
                        <span className="size-2 rounded-full" style={{ background: COULEUR[s.id] }} aria-hidden />
                        {COURT[s.id]}
                      </span>
                      <Crans note={moyenne} couleur={COULEUR[s.id]} />
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-doux)]">
                        <span className={statut === 'progres' ? 'text-[var(--color-progres)]' : statut === 'recul' ? 'text-[var(--color-recul)]' : ''}>
                          Niv. {moyenne === null ? 0 : Math.floor(moyenne / 10)}
                        </span>
                        <ChevronRight className="size-4 text-[var(--color-sourd)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Bloc>
        )}

        <Bloc>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[18px] font-semibold">Ce que l’agent a vu</h2>
            <span className="text-[13px] text-[var(--color-doux)]">{nomMois(d.moisEnCours)} · {enCours?.faits.length ?? 0} faits</span>
          </div>
          {enCours?.faits.length ? (
            <ul className="space-y-4">
              {parSphere.filter((p) => p.faits.length).map(({ s, faits }) => (
                <li key={s.id}>
                  <p className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-doux)]">
                    <span className="size-1.5 rounded-full" style={{ background: COULEUR[s.id] }} aria-hidden />{COURT[s.id]}
                  </p>
                  <ul className="space-y-1.5">
                    {faits.map((f, k) => (
                      <li key={k} className="grid grid-cols-[46px_1fr] gap-2 text-[14px]">
                        <time className="text-[var(--color-sourd)]">{Number(f.date.slice(8))} {nomMois(f.date.slice(0, 7), 'court').split(' ')[0]}</time>
                        <span><span className="font-semibold" style={{ color: COULEUR[sphereDe(d, f.axe).id] }}>{f.axe}</span><span className="text-[var(--color-doux)]"> · </span>{f.texte}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-start gap-3 text-[14px] text-[var(--color-doux)]">
              <Telescope className="mt-0.5 size-5 shrink-0 text-[var(--color-sourd)]" aria-hidden />
              Rien pour l’instant. L’agent passe le lundi, le mercredi et le vendredi à 4 h, et range ici ce que tu as fait.
            </p>
          )}
        </Bloc>
      </div>
    </div>
  );
}

