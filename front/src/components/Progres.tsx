import { useEffect, useMemo, useRef, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bloc } from './petits';
import { COULEUR, COURT, chaleur, cn, moisAbrege, nomMois, relevesNotes } from '@/lib/outils';
import type { Donnees, SphereId } from '@/types';

/** Une teinte par compétence, tirée de la couleur de la sphère : plus claire, plus sombre, en alternance. */
const teinte = (c: string, k: number) =>
  [c, `color-mix(in oklab, ${c} 55%, white)`, `color-mix(in oklab, ${c} 62%, #0e1020)`, `color-mix(in oklab, ${c} 30%, white)`, `color-mix(in oklab, ${c} 40%, #0e1020)`][k % 5];
const HAUTEUR = 250;
const HAUT = 8;
const BAS = 30;
type Periode = '1an' | '3ans' | 'tout';
const PERIODES: { id: Periode; label: string }[] = [{ id: '1an', label: '1 an' }, { id: '3ans', label: '3 ans' }, { id: 'tout', label: 'Tout' }];
/** Les étiquettes de l'axe : un mois sur deux sur un an, l'année sur janvier sur trois ans, chaque année sur tout l'historique. */
const etiquette = (periode: Periode) => (cle: string) => {
  if (periode === 'tout') return cle;
  if (periode === '1an') return Number(cle.slice(5, 7)) % 2 ? moisAbrege(cle) : '';
  return cle.endsWith('-01') ? cle.slice(0, 4) : '';
};
const moyenne = (v: number[]) => (v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null);

export function Progres({ d }: { d: Donnees }) {
  const [sphereId, setSphereId] = useState<SphereId>('corps');
  const [focus, setFocus] = useState<string | null>(null);
  const [periode, setPeriode] = useState<Periode>('3ans');
  const sphere = d.spheres.find((s) => s.id === sphereId)!;
  const couleur = COULEUR[sphere.id];
  // La courbe suit le vrai calendrier : un mois sans relevé n'a pas de chiffre. Sur 1 an et 3 ans, un point par mois ;
  // sur tout l'historique, un point par année (la moyenne de ses relevés), pour que dix ans restent lisibles.
  const releves = useMemo(() => relevesNotes(d), [d]);
  const parMois = useMemo(() => Object.fromEntries(d.mois.map((m) => [m.mois, m])), [d]);
  const valeurs: { cle: string; notes: Record<string, number | null> }[] = periode === 'tout'
    ? [...new Set(d.frise.map((c) => c.slice(0, 4)))].map((an) => ({
        cle: an,
        notes: Object.fromEntries(sphere.axes.map((a) => [a, moyenne(releves.filter((m) => m.mois.startsWith(an)).map((m) => m.notes[a]).filter((n): n is number => n !== null))])),
      }))
    : d.frise.slice(periode === '1an' ? -12 : -36).map((cle) => ({ cle, notes: Object.fromEntries(sphere.axes.map((a) => [a, parMois[cle]?.notes[a] ?? null])) }));
  const points = valeurs.map(({ cle, notes }) => ({
    cle,
    ...Object.fromEntries(sphere.axes.flatMap((a) => [[a, notes[a]], [`${a}·pont`, notes[a]]])),
  }));
  // Les passages sans relevé : du dernier point noté au suivant, une bande grisée sous un pointillé.
  const notes = new Set(valeurs.filter((v) => Object.values(v.notes).some((n) => n !== null)).map((v) => v.cle));
  const cles = valeurs.map((v) => v.cle);
  const vides: [string, string][] = [];
  cles.forEach((cle, i) => {
    if (notes.has(cle) || i === 0 || !notes.has(cles[i - 1])) return;
    const apres = cles.slice(i).find((c) => notes.has(c));
    if (apres) vides.push([cles[i - 1], apres]);
  });
  const defilement = useRef<HTMLDivElement>(null);
  const courbe = useRef<HTMLDivElement>(null);
  useEffect(() => {
    defilement.current?.scrollTo({ left: defilement.current.scrollWidth });
    courbe.current?.scrollTo({ left: courbe.current.scrollWidth });
  }, [d]);

  const suiviPoints = focus ? valeurs.filter((v) => v.notes[focus] !== null) : [];
  const suivi = suiviPoints.map((v) => v.notes[focus!] as number);
  const ecart = suivi.length >= 2 ? suivi.at(-1)! - suivi[0] : null;
  const nomPoint = (cle: string) => (periode === 'tout' ? `l'année ${cle}` : nomMois(cle));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.01em]">Ta progression</h1>
        <p className="mt-1 text-[15px] text-[var(--color-doux)]">
          {releves.length
            ? `${releves.length} relevés, de ${nomMois(releves[0].mois)} à ${nomMois(releves.at(-1)!.mois)}.`
            : 'Les courbes apparaissent après le premier relevé noté.'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-wrap" role="tablist" aria-label="Sphère">
        {d.spheres.map((s) => {
          const actif = s.id === sphereId;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={actif}
              onClick={() => { setSphereId(s.id); setFocus(null); }}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[14px] font-medium transition-colors lg:rounded-full lg:py-1.5',
                actif ? 'text-[var(--color-encre)]' : 'border-[var(--color-trait)] text-[var(--color-doux)] hover:text-[var(--color-encre)]',
              )}
              style={actif ? { background: `color-mix(in oklab, ${COULEUR[s.id]} 16%, transparent)`, borderColor: `color-mix(in oklab, ${COULEUR[s.id]} 45%, transparent)` } : undefined}
            >
              <span className="size-2 rounded-full" style={{ background: COULEUR[s.id] }} aria-hidden />
              {COURT[s.id]}
            </button>
          );
        })}
      </div>

      <Bloc className="px-2 pb-4 pt-4 sm:px-4">
        {d.frise.length >= 2 ? (
          <>
            <div className="mx-2 mb-3 grid grid-cols-3 rounded-xl bg-[var(--color-fond)] p-1" role="radiogroup" aria-label="Période">
              {PERIODES.map((p) => (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={periode === p.id}
                  onClick={() => setPeriode(p.id)}
                  className={cn(
                    'rounded-lg py-1.5 text-[13px] font-semibold transition-colors',
                    periode === p.id ? 'bg-[var(--color-panneau-2)] text-[var(--color-encre)] shadow-sm' : 'text-[var(--color-sourd)] hover:text-[var(--color-doux)]',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 px-2 pb-3" role="group" aria-label="Compétence suivie">
              {[null, ...sphere.axes].map((a) => {
                const k = a ? sphere.axes.indexOf(a) : -1;
                const actif = focus === a;
                return (
                  <button
                    key={a ?? 'tout'}
                    onClick={() => setFocus(a)}
                    aria-pressed={actif}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
                      actif ? 'bg-[var(--color-panneau-2)] text-[var(--color-encre)]' : 'text-[var(--color-sourd)] hover:text-[var(--color-doux)]',
                    )}
                  >
                    {a && <span className="h-[3px] w-3.5 rounded-full" style={{ background: teinte(couleur, k) }} aria-hidden />}
                    {a ?? 'Toutes'}
                  </button>
                );
              })}
            </div>

            {/* L'échelle reste fixe à gauche ; la courbe tient sur l'écran et ne défile que sur un très long historique. */}
            <div className="relative flex">
              <div className="relative w-8 shrink-0 text-right text-[11px] text-[var(--color-sourd)]" style={{ height: HAUTEUR }} aria-hidden>
                {[0, 25, 50, 75, 100].map((v) => (
                  <span key={v} className="absolute right-1.5 -translate-y-1/2" style={{ top: HAUT + ((100 - v) / 100) * (HAUTEUR - HAUT - BAS) }}>{v}</span>
                ))}
              </div>
              <div ref={courbe} className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
              <div style={{ height: HAUTEUR, minWidth: points.length * 9 }}>
              <ResponsiveContainer>
                <LineChart data={points} margin={{ top: HAUT, right: 14, bottom: 0, left: 6 }}>
                  <CartesianGrid stroke="var(--color-trait)" vertical={false} />
                  <XAxis dataKey="cle" height={BAS} padding={{ left: 14, right: 6 }} tick={{ fill: 'var(--color-sourd)', fontSize: 11 }} tickLine={false} axisLine={false} interval={0} tickMargin={6} tickFormatter={etiquette(periode)} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    cursor={{ stroke: 'var(--color-trait)' }}
                    contentStyle={{ background: 'var(--color-panneau-2)', border: '1px solid var(--color-trait)', borderRadius: 12, color: 'var(--color-encre)', fontFamily: 'inherit', fontSize: 13 }}
                    labelStyle={{ color: 'var(--color-doux)' }}
                    labelFormatter={(c) => (periode === 'tout' ? `${c} · moyenne de l'année` : nomMois(String(c)))}
                    itemSorter={(i) => -(Number(i.value) || 0)}
                  />
                  {vides.map(([x1, x2]) => (
                    <ReferenceArea key={x1} x1={x1} x2={x2} fill="var(--color-panneau-2)" fillOpacity={0.55} strokeOpacity={0} ifOverflow="hidden" />
                  ))}
                  {sphere.axes.map((a, k) => {
                    const eteint = focus !== null && focus !== a;
                    return (
                      <Line
                        key={`${a}·pont`}
                        type="linear"
                        dataKey={`${a}·pont`}
                        stroke={teinte(couleur, k)}
                        strokeOpacity={eteint ? 0.06 : 0.5}
                        strokeDasharray="3 5"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={false}
                        tooltipType="none"
                        connectNulls
                        isAnimationActive={false}
                      />
                    );
                  })}
                  {sphere.axes.map((a, k) => {
                    const eteint = focus !== null && focus !== a;
                    return (
                      <Line
                        key={a}
                        type="linear"
                        dataKey={a}
                        stroke={teinte(couleur, k)}
                        strokeOpacity={eteint ? 0.12 : 1}
                        strokeWidth={focus === a ? 3 : 2}
                        dot={eteint ? false : { r: focus === a ? 3 : 2, strokeWidth: 0, fill: teinte(couleur, k) }}
                        activeDot={eteint ? false : { r: 4.5, strokeWidth: 0 }}
                        connectNulls={false}
                        isAnimationActive
                        animationDuration={500}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
              </div>
              </div>
            </div>

            <p className="mt-3 px-3 text-[13px] text-[var(--color-doux)]">
              {focus && ecart !== null ? (
                <>
                  <span className="font-semibold text-[var(--color-encre)]">{focus}</span> : {suivi[0]} → {suivi.at(-1)}{' '}
                  <span className={cn('font-semibold', ecart > 0 && 'text-[var(--color-progres)]', ecart < 0 && 'text-[var(--color-recul)]')}>
                    ({ecart > 0 ? '+' : ''}{ecart})
                  </span>{' '}depuis {nomPoint(suiviPoints[0].cle)}.
                </>
              ) : periode === 'tout'
                ? 'Un point par année : la moyenne de tes relevés. Touche une compétence pour la suivre seule.'
                : 'Touche une compétence pour la suivre seule. En pointillé sur fond gris : les mois sans relevé.'}
            </p>
          </>
        ) : (
          <p className="px-3 pb-2 text-[15px] text-[var(--color-doux)]">Il faut deux mois notés pour tracer une courbe. Pose ton prochain relevé, la première ligne apparaîtra.</p>
        )}
      </Bloc>

      <Bloc className="p-0">
        <h2 className="px-5 pt-5 text-[18px] font-semibold">Le tableau</h2>
        <p className="px-5 pb-3 text-[14px] text-[var(--color-doux)]">Du rouge au vert, mois par mois. Fais glisser vers la droite pour remonter le temps.</p>
        <div ref={defilement} className="overflow-x-auto pb-4">
          <table className="border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[var(--color-panneau)] py-2 pl-4 pr-2 text-left font-semibold text-[var(--color-doux)] sm:pl-5">Compétence</th>
                {d.frise.map((cle) => (
                  <th key={cle} className="whitespace-nowrap px-[2px] py-2 text-center font-medium leading-tight text-[var(--color-sourd)]">
                    {moisAbrege(cle)}<br /><span className="text-[11px] opacity-80">{cle.slice(0, 4)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.spheres.map((s) => s.axes.map((a, i) => (
                <tr key={a}>
                  <th
                    scope="row"
                    className={cn('sticky left-0 z-10 max-w-[124px] truncate bg-[var(--color-panneau)] py-1 pl-4 pr-2 text-left font-medium sm:max-w-[180px] sm:pl-5', i === 0 && 'pt-3')}
                    title={a}
                  >
                    <span className="mr-2 inline-block size-1.5 rounded-full align-middle" style={{ background: COULEUR[s.id] }} aria-hidden />
                    {a}
                  </th>
                  {d.frise.map((cle) => {
                    const note = parMois[cle]?.notes[a] ?? null;
                    return (
                      <td key={cle} className={cn('px-[2px] py-[2px]', i === 0 && 'pt-3')}>
                        <span
                          className={cn('flex h-7 w-10 items-center justify-center rounded-md font-semibold tabular-nums', note === null && 'border border-dashed border-[var(--color-trait)]')}
                          style={{ background: chaleur(note), color: note === null ? 'transparent' : '#10121f' }}
                        >
                          {note ?? ''}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Bloc>
    </div>
  );
}
