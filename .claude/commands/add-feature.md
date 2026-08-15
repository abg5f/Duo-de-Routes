---
description: Scaffold un nouveau mini-jeu (dossier autonome + entrée au menu)
---

Ajoute un mini-jeu au projet. Argument : `$ARGUMENTS` (nom du jeu, ex. « devine la plaque »).

## Étapes

1. **Lire le contexte d'abord**
   - Lire `CLAUDE.md` et `CONTEXT.md`.
   - Si la stack n'est toujours pas choisie, demander à l'utilisateur avant de scaffolder (vanilla / Vite+TS / Next.js), puis mettre à jour `CLAUDE.md` et `.claude/settings.json` en conséquence.
   - Lister `games/` pour voir les jeux existants et t'aligner sur leur structure.

2. **Choisir le slug** — `kebab-case`, sans accents, dérivé de `$ARGUMENTS`.

3. **Créer le jeu** sous `games/<slug>/` :
   - `index.html` — écran du jeu
   - `game.js` — logique (état, boucle, score)
   - `style.css` si le style ne tient pas dans le commun
   - Réutiliser `shared/` (score, minuteur, sons) au lieu de dupliquer. Si un besoin commun apparaît deux fois, le remonter dans `shared/`.

4. **Déclarer le jeu au menu** — ajouter l'entrée dans `index.html` (titre, courte règle, durée moyenne, nb de joueurs).

5. **Vérifier les contraintes produit** avant de rendre :
   - gros boutons tactiles, peu de texte à lire
   - pas d'animation plein écran rapide (mal des transports)
   - fonctionne hors-ligne (aucune ressource CDN)
   - lisible en plein soleil comme de nuit

6. **Tester** — lancer un serveur local et ouvrir la page du jeu ; vérifier au moins une partie complète (démarrage → fin → retour menu).

7. **Résumer** les fichiers créés/modifiés et ce qui reste à faire.
