---
description: Diagnostiquer et corriger un bug
---

Corrige le problème décrit : `$ARGUMENTS`

## Étapes

1. **Reproduire** — obtenir le comportement fautif avant de toucher au code.
   - Quel jeu / quel écran ? Quelles actions ? Quel navigateur (mobile ou desktop) ?
   - Servir le projet localement et reproduire ; relever les erreurs de la console et du réseau.
   - Si ce n'est pas reproductible, le dire et demander les infos manquantes plutôt que de corriger à l'aveugle.

2. **Localiser** — grep sur les symptômes (message d'erreur, nom de fonction, id/classe du DOM).
   **Lire le fichier en entier** avant de le modifier, et grep tous les appelants d'une fonction avant de la changer.

3. **Comprendre la cause** — énoncer la cause racine en une phrase avant d'éditer.
   Corriger la cause, pas le symptôme ; ne pas masquer l'erreur par un `try/catch` vide ou un garde défensif.

4. **Corriger** — modification minimale, dans le style du code environnant.
   Si le même bug existe ailleurs (autre jeu, code dupliqué), le signaler ; corriger les autres occurrences seulement si c'est le même correctif.

5. **Vérifier** — rejouer le scénario de repro, puis une partie complète du jeu concerné.
   Vérifier qu'aucune erreur console n'apparaît. Lancer `/check-build` si une stack de build existe.

6. **Rapporter** : cause racine, correctif appliqué, comment ça a été vérifié, effets de bord éventuels.
   Noter le bug et sa cause dans `CONTEXT.md` (section « Problèmes connus ») s'il risque de revenir.
