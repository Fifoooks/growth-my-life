import { Award, Flame, Lock, Trophy } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Bloc } from './petits';
import { cn, moisAbrege, moisPrecedent, nomMois, notesDuMois } from '@/lib/outils';
import type { Donnees } from '@/types';

export function Succes({ d }: { d: Donnees }) {
  const calme = useReducedMotion();
  const { jeu } = d;
  const notes = new Set(d.mois.filter(notesDuMois).map((m) => m.mois));
  const douze: string[] = [];
  let curseur = moisPrecedent(d.moisEnCours);
  for (let i = 0; i < 12; i += 1) { douze.unshift(curseur); curseur = moisPrecedent(curseur); }
  const obtenus = jeu.succes.filter((s) => s.obtenu).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.01em]">Succès</h1>
        <p className="mt-1 text-[15px] text-[var(--color-doux)]">Ce qui compte ici, c’est la régularité : un relevé chaque mois, sans trou.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <Bloc>
          <div className="flex items-end gap-3">
            <Flame className="mb-2 size-7" style={{ color: jeu.serie ? 'var(--color-or)' : 'var(--color-sourd)' }} aria-hidden />
            <span className="text-[64px] font-bold leading-none tracking-[-0.03em]">{jeu.serie}</span>
            <span className="mb-2 text-[16px] text-[var(--color-doux)]">mois d’affilée</span>
          </div>
          <p className="mt-2 text-[14px] text-[var(--color-doux)]">Meilleure série : {jeu.meilleureSerie} mois.</p>
          <ol className="mt-5 grid grid-cols-12 gap-1.5" aria-label="Les douze derniers mois">
            {douze.map((cle, i) => {
              const fait = notes.has(cle);
              return (
                <li key={cle} className="flex flex-col items-center gap-1.5">
                  <motion.span
                    className={cn('h-9 w-full rounded-md', fait ? 'bg-[var(--color-or)]' : 'border border-dashed border-[var(--color-trait)]')}
                    initial={calme ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    title={`${nomMois(cle)} : ${fait ? 'relevé fait' : 'pas de relevé'}`}
                  />
                  <span className="text-[10px] text-[var(--color-sourd)]">{moisAbrege(cle)}</span>
                </li>
              );
            })}
          </ol>
        </Bloc>
        <Bloc className="flex flex-col justify-between">
          <div>
            <p className="text-[14px] text-[var(--color-doux)]">Expérience cumulée</p>
            <p className="text-[44px] font-bold tracking-[-0.02em]">{jeu.xp.toLocaleString('fr-FR')} <span className="text-[18px] font-semibold text-[var(--color-or)]">XP</span></p>
          </div>
          <p className="text-[14px] text-[var(--color-doux)]">Chaque relevé ajoute la somme de tes 24 notes. Un mois sauté, c’est de l’XP perdue.</p>
        </Bloc>
      </div>

      <Bloc>
        <h2 className="mb-4 flex items-baseline justify-between text-[18px] font-semibold">
          Trophées <span className="text-[14px] font-normal text-[var(--color-doux)]">{obtenus}/{jeu.succes.length}</span>
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {jeu.succes.map((s) => (
            <li key={s.id} className={cn('flex items-start gap-3 rounded-xl p-3.5', s.obtenu ? 'bg-[var(--color-or-sombre)]' : 'bg-[var(--color-panneau-2)]')}>
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', s.obtenu ? 'bg-[var(--color-or)] text-[#1d1608]' : 'bg-[var(--color-fond)] text-[var(--color-sourd)]')}>
                {s.obtenu ? (s.id === 'finDuJeu' ? <Trophy className="size-5" aria-hidden /> : <Award className="size-5" aria-hidden />) : <Lock className="size-4" aria-hidden />}
              </span>
              <div>
                <p className={cn('text-[15px] font-semibold', !s.obtenu && 'text-[var(--color-doux)]')}>{s.titre}</p>
                <p className="text-[13px] text-[var(--color-sourd)]">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Bloc>
    </div>
  );
}
