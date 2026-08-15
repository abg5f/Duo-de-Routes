---
description: Vérifie le build / lint avant déploiement
---

Vérifie que le projet est en état d'être déployé.

## Étapes

1. **Détecter la stack** — lire `CLAUDE.md`, puis chercher `package.json` / `vite.config.*` / `next.config.*` / `pyproject.toml`.
   Si aucune stack n'est encore en place, le dire et s'arrêter : il n'y a rien à builder.

2. **Lancer les vérifications** selon ce qui existe réellement dans `package.json` (`scripts`) :
   - lint : `npm run lint`
   - types : `npm run typecheck` ou `npx tsc --noEmit`
   - build : `npm run build`
   - tests : `npm test`

   Ne pas inventer un script absent — lister ce qui manque plutôt que de deviner.

3. **Si projet statique (vanilla)** :
   - vérifier qu'aucun fichier HTML ne référence un asset inexistant (liens `src`/`href` cassés)
   - vérifier l'absence de ressource CDN externe (le jeu doit marcher hors-ligne)
   - servir localement et ouvrir le menu + un jeu, contrôler la console pour les erreurs

4. **Rapporter** : chaque commande lancée avec son résultat réel (succès/échec + extrait de sortie en cas d'échec).
   En cas d'échec, proposer le correctif mais ne pas le déployer.

5. **Contrôle git** — `git status` pour signaler les fichiers non commités avant déploiement.
