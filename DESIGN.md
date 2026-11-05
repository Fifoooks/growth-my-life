---
name: Growth my life
description: Une fiche de personnage pour ta vie, sur fond bleu nuit, où l'or ne sert que l'expérience.
colors:
  fond: "#0e1020"
  panneau: "#14172b"
  panneau-2: "#1b1f3a"
  trait: "#262a4e"
  encre: "#eef0fa"
  doux: "#a3a9d0"
  sourd: "#878ebd"
  or: "#e8b64c"
  or-sombre: "#3a2f17"
  pip: "#7c86f0"
  corps: "#ff7a6b"
  relations: "#f28ac0"
  argent: "#4fd1a1"
  savoir: "#5aa9ff"
  caractere: "#a88bfa"
  systeme: "#39c6d4"
  progres: "#4fd1a1"
  recul: "#ff6b5e"
typography:
  score:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  titre-page:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  titre-bloc:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
  titre-competence:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  corps:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  secondaire:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  etiquette:
    fontFamily: "Saira Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
rounded:
  cran: "2px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pleine: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  bloc:
    backgroundColor: "{colors.panneau}"
    rounded: "{rounded.xl}"
    padding: "20px"
  bouton-primaire:
    backgroundColor: "{colors.or}"
    textColor: "#1d1608"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    typography: "{typography.corps}"
  bouton-secondaire:
    backgroundColor: "{colors.panneau-2}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  puce-sphere:
    backgroundColor: "{colors.panneau-2}"
    textColor: "{colors.encre}"
    rounded: "{rounded.pleine}"
    padding: "6px 14px"
  champ:
    backgroundColor: "{colors.panneau}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  badge-statut:
    backgroundColor: "{colors.panneau-2}"
    textColor: "{colors.doux}"
    rounded: "{rounded.pleine}"
    padding: "2px 8px"
  navigation-item-actif:
    backgroundColor: "{colors.panneau-2}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  cran-plein:
    backgroundColor: "{colors.pip}"
    rounded: "{rounded.cran}"
    height: "8px"
  cran-vide:
    backgroundColor: "{colors.panneau-2}"
    rounded: "{rounded.cran}"
    height: "8px"
---

# Design System: Growth my life

## Overview

**Creative North Star: "La Fiche de personnage"**

Ta vie est un personnage que tu fais monter de niveau, une fois par mois. Le système part d'un fond bleu nuit profond, de panneaux à peine plus clairs, d'une encre blanc cassé et d'une seule police condensée à chiffres tabulaires. Rien n'est emprunté à un jeu précis : c'est l'esprit des fiches de sport et de RPG (niveau, XP, crans, série), tenu en retenue. L'application s'ouvre le soir sur iPhone, dans le noir ; tout est calibré pour ça.

L'or est la seule couleur de récompense : XP, niveau, série, focus, action principale. Les six teintes de sphère n'existent que pour la donnée (points du radar, crans, courbes, puces). Le reste est neutre. La densité est celle d'un tableau de bord personnel : peu de blocs, gros chiffres, listes à filets fins plutôt que cartes dans des cartes.

Le système refuse le tableau de bord SaaS générique (cartes de KPI et sparklines), les badges pour tout, et toute photo ou illustration : le travail est graphique (hexagone, crans, courbes), la couleur est celle de la sphère, le mouvement est rare et sert à lire.

**Key Characteristics:**
- Fond sombre à deux couches de panneau, séparées par un filet bleu-violet, jamais par une ombre.
- Une seule police, Saira Semi Condensed, chiffres tabulaires partout.
- Or réservé à la récompense et à l'action ; teintes de sphère réservées à la donnée.
- Mobile d'abord : barre d'onglets en bas, rail latéral à partir de 1024px.
- Mouvement unique et utile : l'hexagone grandit depuis le centre, l'XP se remplit une fois, les nombres montent.

## Colors

Un noir-bleu froid, des encres lavande, un seul or chaud, six teintes vives de sphère.

### Primary
- **Or XP** (#e8b64c, `--color-or`) : la barre d'XP, la flamme de série, le focus clavier, la sélection, le bouton Enregistrer, l'onglet actif (icône), l'interrupteur Démo activé, la courbe globale, la signature du coach (« Coach · »). Sur un bouton ou un trophée plein, le texte est un brun très sombre (#1d1608).
- **Or sombre** (#3a2f17, `--color-or-sombre`) : fond des messages de série à zéro et des trophées obtenus, texte or clair (#f3d58e) pour le message.

### Secondary
- **Cran lavande** (#7c86f0, `--color-pip`) : couleur par défaut des crans de niveau quand aucune sphère n'est donnée.

### Tertiary
Les six sphères, pour la donnée seulement : **Corail Corps** (#ff7a6b), **Rose Relations** (#f28ac0), **Menthe Argent** (#4fd1a1), **Bleu Savoir** (#5aa9ff), **Violet Caractère** (#a88bfa), **Turquoise Système** (#39c6d4). Elles colorent les sommets de l'hexagone, les crans, les puces, les courbes, le curseur de note et le nom d'une compétence dans les faits.
- **Vert Progrès** (#4fd1a1) et **Rouge Recul** (#ff6b5e) : statut En progrès / Recule, écart de la courbe globale. Le vert est identique à Menthe Argent.

### Neutral
- **Nuit** (#0e1020, `--color-fond`) : fond de page et de curseur.
- **Panneau** (#14172b) : blocs, champs, en-têtes de tableau collants.
- **Panneau relevé** (#1b1f3a, `--color-panneau-2`) : crans vides, onglet actif, bouton secondaire, barre d'enregistrement, toasts, rails de barre et de curseur.
- **Filet** (#262a4e, `--color-trait`) : bordures, séparateurs, anneaux du radar, grille des courbes.
- **Encre** (#eef0fa) : texte principal et chiffres.
- **Lavande douce** (#a3a9d0, `--color-doux`) : texte secondaire, étiquettes.
- **Lavande sourde** (#878ebd, `--color-sourd`) : descriptions, dates, légendes, onglets inactifs, placeholders.
- **Rampe de chaleur** (#a8352a, #b98744, #97994a, #6f9f4e, #3f9a5f, par seuils 30 / 50 / 65 / 80) : tableau des notes uniquement ; texte #10121f dessus.

### Named Rules
**The Gold Means Reward Rule.** L'or dit « expérience ou action » : XP, série, niveau, focus, bouton principal. Il n'habille ni un titre, ni une sphère, ni un fond de bloc.

**The Sphere Hue Is Data Rule.** Une teinte de sphère ne colore que ce qui mesure cette sphère. Jamais un bouton, un fond ou une décoration.

**The Two Layers Rule.** Un fond, un panneau, un panneau relevé. Pas de troisième couche : la hiérarchie vient du filet et de l'encre.

## Typography

**Display Font:** Saira Semi Condensed (avec ui-sans-serif, system-ui, sans-serif)
**Body Font:** Saira Semi Condensed (même famille, poids 400 à 700 chargés)
**Label/Mono Font:** aucune ; les chiffres tabulaires viennent de `font-feature-settings: "tnum"` posé sur toute la page.

**Character:** une condensée sportive, dense et lisible en petit, qui donne aux scores un air de tableau de stats sans effet. Les chiffres s'alignent d'eux-mêmes.

### Hierarchy
- **Score** (700, 64px, interligne 1, -0.03em) : score global et série. Le XP cumulé monte à 44px (700) sur la page Succès.
- **Titre de page** (600, 26px, -0.01em) : Relevé, Succès, Progrès.
- **Valeur de compétence** (700, 24 à 28px, tabulaire) : la note d'une compétence ; 600 à 22px pour le nom de la personne.
- **Titre de bloc** (600, 18px ; 20px pour une sphère ouverte) : Les sphères, Ce que l’agent a vu, Ta courbe.
- **Titre de compétence** (600, 16px) : nom d'une compétence.
- **Corps** (400 à 500, 15px) : champs, descriptions de page, navigation du rail.
- **Secondaire** (14px, couleur douce) : sous-titres, pourquoi, faits.
- **Annotation** (12 à 13px, couleur sourde) : descriptions de compétence, dates, légendes, badge de statut (12px, 600).
- **Étiquette** (11 à 12px, 600, MAJUSCULES, 0.08 à 0.12em) : « Score global », noms de sphère au-dessus des faits, libellés d'axes du radar. Voir Do's and Don'ts : à ne pas étendre.

### Named Rules
**The One Voice Rule.** Une seule famille de caractères. La hiérarchie vient de la taille et du poids (600 et 700), jamais d'une seconde police.

**The Tabular Numbers Rule.** Tout chiffre est tabulaire. Une note, un score, une date ne doivent jamais bouger d'un pixel d'un mois à l'autre.

## Layout

Mobile d'abord : une colonne, marges de 16px, 112px de réserve en bas pour la barre d'onglets fixe (64px + zone sûre). À partir de 1024px : rail fixe de 232px à gauche, contenu centré à 1180px max avec 32px de marges, la Fiche passe en deux colonnes (1.05fr / 1fr) avec 24px d'écart. Les blocs sont empilés à 16px d'écart (24px en deux colonnes). Le Relevé reste en une colonne de 768px max. Le tableau de progrès défile horizontalement, première colonne collante.

Rythme d'espacement : 4, 8, 12, 16, 20 (rembourrage de bloc), 24, 32. Les listes se séparent par un filet de 1px, pas par des cartes. Les contrôles tactiles mesurent 44px et plus (onglets 64px de haut, lignes de sphère 3 + 3 de rembourrage).

## Elevation & Depth

Le système est plat : la profondeur vient de la superposition tonale (fond, panneau, panneau relevé) et du filet `--color-trait`. Les ombres n'existent que pour ce qui flotte au-dessus du contenu.

### Shadow Vocabulary
- **Barre flottante** (`box-shadow: 0 12px 32px rgba(0,0,0,0.45)`) : la barre d'enregistrement du Relevé, collée au-dessus des onglets.
- **Pouce de curseur** (`box-shadow: 0 2px 8px rgba(0,0,0,0.45)`) : le pouce du curseur de note.
- **Pouce d'interrupteur** (`shadow` Tailwind par défaut) : le pouce de l'interrupteur Démo.
- **Flou de barre** (`backdrop-filter: blur`) : en-tête mobile collant (fond à 90 %), barre d'onglets (95 %), barre d'enregistrement (95 %). Fond de rail et de barre : #0b0d1a, plus sombre que la page.

### Named Rules
**The Flat Until It Floats Rule.** Au repos, un bloc n'a ni ombre ni bordure ; il se détache du fond par sa teinte. Une ombre n'apparaît que sur un élément fixé qui recouvre le contenu.

## Shapes

Coins généreux sur les blocs, pleins sur les puces, quasi droits sur les crans. Rayons observés : 2px (cran de niveau), 6px (focus, case de série en 12 mois, 8px pour la case du tableau), 12px (boutons, champs, lignes de rail, trophées, messages), 16px (blocs), pilule pour puces de sphère, badges, interrupteur et barre d'XP. Le hexagone du radar est un tracé fin à 4 anneaux (25, 50, 75, 100 %) en filet, 6 rayons, sommets ronds de la couleur de sphère. Le mois précédent se dessine en fantôme : tracé tireté (4 4), couleur douce à 45 %. Les bordures de champ sont de 1px en filet ; les cases vides sont en tirets.

## Components

### Bloc
Section sur panneau (#14172b), coin 16px, rembourrage 20px, sans bordure ni ombre. Variantes de rembourrage selon le contenu (tableau : 0 ; radar : 8 / 24).

### Buttons
- **Shape:** coins de 12px.
- **Primaire (Enregistrer):** fond or, texte brun #1d1608, 600, rembourrage 8 × 16, icône de 16px ; survol à 90 % d'opacité ; désactivé à 40 %.
- **Secondaire (Réessayer):** fond panneau relevé, texte encre, 600.
- **Retour (« Les 6 sphères »):** texte doux, sans fond, pilule ; survol vers l'encre.
- **Focus:** contour or de 2px, décalé de 2px, sur tout élément.

### Chips
- **Puce de sphère (Progrès):** pilule, bordure filet et texte doux au repos ; sélectionnée, fond panneau relevé sans bordure et texte encre. Point de 8px à la couleur de sphère. Défile horizontalement.
- **Badge de statut:** pilule 12px 600 avec flèche de 14px. Progrès : fond vert à 16 %, texte vert ; Recule : fond rouge à 16 %, texte rouge ; Stagnation : fond panneau relevé, texte doux.

### Crans de niveau
Dix segments de 8px de haut, 3px d'écart, coin 2px ; un cran plein par dizaine de points, vide en panneau relevé, couleur de la sphère. Étiquette « Niv. n » à côté. C'est la signature de lecture de la progression.

### Inputs / Fields
- **Style:** fond panneau, bordure filet 1px, coin 12px, rembourrage 10 × 14, texte 15px, placeholder lavande sourde.
- **Focus:** bordure or (+ contour global or).
- **Curseur de note:** piste de 6px sur panneau relevé, remplissage et bordure du pouce à la couleur de sphère, pouce de 20px à fond de page, pas de 5 points ; grossit à l'appui.
- **Disabled:** bouton à 40 % ; mode démo : message d'information à fond panneau relevé.

### Navigation
Quatre onglets (Fiche, Relevé, Progrès, Succès). Mobile : barre fixe en bas sur #0b0d1a, 64px de haut, icône de 22px et texte de 12px ; actif = texte encre et icône or plus épaisse, inactif = lavande sourde. Bureau : rail de 232px, éléments à coin 12px, actif sur panneau relevé avec icône or, survol sur panneau. En-tête mobile collant avec titre et interrupteur Démo.

### Barre d'XP et score
Barre de 10px de haut, pilule, piste en panneau relevé, remplissage or de 2 % minimum ; se remplit une fois (1,1 s, sortie douce `cubic-bezier(0.16, 1, 0.3, 1)`). Les nombres montent de 0 à leur valeur en 0,9 s.

### Hexagone / radar (signature)
Le même tracé sert pour les six sphères et pour les compétences d'une sphère : il grandit depuis le centre (ressort), puis se déforme entre jeux de données. Libellés en majuscules au-dessus, valeur en encre dessous.

### Courbes et tableau
Courbe globale en or (2,25px), dernier point plein, mois sans relevé marqués par un rectangle ; courbes de sphère à la couleur de sphère, tiretées par compétence. Tableau des notes : cellules 44 × 28px en rampe de chaleur, tirets pour les mois vides.

### Trophées
Ligne à coin 12px : obtenu = fond or sombre, médaillon or rond ; verrouillé = fond panneau relevé, médaillon fond de page avec cadenas.

## Do's and Don'ts

### Do:
- **Do** réserver l'or (#e8b64c) à l'XP, à la série, au niveau, au focus et à l'action principale.
- **Do** colorer une donnée avec la teinte de sa sphère, jamais avec l'or.
- **Do** séparer les listes par des filets de 1px en `--color-trait` et poser les blocs sur `--color-panneau`.
- **Do** passer par les tokens `--color-*` ; garder la police unique et les chiffres tabulaires.
- **Do** garder le mouvement rare et utile (hexagone, XP, compteurs) et respecter `prefers-reduced-motion`.
- **Do** donner un texte alternatif aux graphiques (`role="img"` + `aria-label`) et un nom aux contrôles.

### Don't:
- **Don't** faire de tableau de bord de cartes de KPI avec sparklines.
- **Don't** ajouter des badges ou trophées pour tout ; les trophées restent ceux du jeu.
- **Don't** utiliser de photo ni d'illustration ; le travail est graphique.
- **Don't** mettre d'ombre sur un bloc posé sur la page, ni empiler une troisième couche de fond.
- **Don't** ajouter une seconde police ou un poids en dessous de 400.
- **Don't** étendre le style des petites étiquettes en majuscules espacées à de nouvelles surfaces ; il est constaté, non érigé en règle.
