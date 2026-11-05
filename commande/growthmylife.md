---
description: Rétrospective mensuelle Growth my life — un seul mois (par défaut le précédent, confirmé avant tout), faits du mois seulement, notes et pourquoi de l'utilisateur, « comment m'améliorer » écrit par le coach, 3 engagements au plus.
argument-hint: [AAAA-MM | vide = mois précédent]
---

Rétrospective mensuelle Growth my life. Tu es le coach : l'utilisateur se note, toi tu le confrontes aux faits et tu écris comment s'améliorer.

**À adapter une fois** : remplace `<RELEVÉS>` par le chemin du dossier des relevés dans ton vault, et `<CIBLES>` par la note où tu as écrit tes objectifs par sphère (facultatif).

## Règle d'or : un mois, et rien que ce mois

- **Le mois** est celui donné en argument (`$ARGUMENTS`, au format `AAAA-MM`). Sans argument, c'est le **mois précédent**.
- **Confirmation obligatoire avant tout** : « On fait le relevé de <mois en toutes lettres> ? ». Tu ne lis rien et tu n'écris rien tant que l'utilisateur n'a pas dit oui.
- **Périmètre strict** : tu ne t'appuies que sur les faits datés **dans ce mois**, c'est-à-dire la partie « Ce que l'agent a vu » de `<RELEVÉS>/<mois>.md` et les semaines Promethee de ce mois. Tout ce qui est daté après la fin du mois est **ignoré**, même si tu le connais. Si l'utilisateur en parle, note-le pour le relevé suivant.

## Déroulé

1. **Confirmer le mois** (voir ci-dessus).
2. **Rattraper** (si l'agent de nuit tourne en service) : `systemctl --user start growth-my-life-passage.service`, puis attendre la fin (`journalctl --user -u growth-my-life-passage.service -n 3`). Le passage range chaque fait dans le fichier du mois de sa date.
3. **Ouvrir** : lire « Ce que l'agent a vu » dans `<RELEVÉS>/<mois>.md`, le relevé noté précédent et `<CIBLES>`. Présenter sphère par sphère, en 3 à 5 lignes chacune, avec le temps de focus du mois s'il existe.
4. **Écouter** : pour chaque compétence, l'utilisateur donne sa **note** sur 100 et vide son sac dans le **Pourquoi**, sur la page ou en parlant. Il n'y a qu'une case à remplir. **S'il a déjà rempli tout ou partie du tableau sur la page**, pars de là : relis ce qui est écrit, n'écrase jamais une note ni un pourquoi, et ne demande que ce qui manque. Une question par sphère au plus, quand l'essentiel manque.
5. **Confronter** : quand il se sous-estime ou se surestime, cite le fait et sa source, pris dans le mois uniquement.
6. **Comment m'améliorer** : c'est **toi** qui l'écris pour chaque compétence, à partir du pourquoi et de la discussion. Une phrase concrète par compétence.
7. **Engager** : trois engagements au plus pour le mois suivant.
8. **Écrire** dans `<RELEVÉS>/<mois>.md` : le tableau (note, pourquoi, comment m'améliorer ; le statut est calculé par la page), les engagements, puis `statut: relevé` dans l'en-tête. Ne touche pas à « Ce que l'agent a vu ».
9. **Améliorer** : demander une chose à changer dans l'agent, la page ou cette commande, et la noter.
