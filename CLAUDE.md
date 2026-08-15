# Duo de Routes

PWA mobile-first en français : mini-jeux à deux, à jouer sur un seul téléphone en voiture.
Fonctionne 100% hors ligne, sans backend, sans compte utilisateur. Un seul mini-jeu à ce stade : un quiz de cartes à retourner.

## Stack technique

- **Vite 6** + **React 19** + **TypeScript** (strict) + **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first via `@theme` dans `src/index.css`)
- **PWA** : `vite-plugin-pwa` (stratégie `generateSW`), manifest + service worker, orientation portrait
- **Persistance** : `localStorage` uniquement, encapsulée dans `src/lib/storage.ts` (repository typé, backend injectable pour les tests, remplaçable par IndexedDB/SQLite sans toucher aux composants)
- **Tests** : Vitest (environnement `node`, pas de jsdom — le repository accepte un backend de stockage factice)
- Aucune dépendance UI/icônes/routeur. Pas d'ajout de dépendance sans validation explicite.

## Commandes essentielles

| But | Commande |
|---|---|
| Dev | `npm run dev` (port 5173) |
| Build | `npm run build` (`tsc -b` puis `vite build`) |
| Preview du build | `npm run preview -- --port 4173` |
| Test | `npm test` (`vitest run`) |

## Variables d'environnement

Aucune. Le projet est volontairement sans backend et sans clé API — ne pas en introduire sans une décision explicite qui invaliderait ce choix d'architecture.

## Architecture

```
30_minijeuxvoiture/
├── index.html
├── package.json
├── vite.config.ts            # plugins React + Tailwind + PWA (manifest, workbox)
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vitest.config.ts
├── public/                   # icônes PWA (192/512/maskable/apple-touch)
└── src/
    ├── main.tsx               # montage React + enregistrement du service worker
    ├── App.tsx                # hub <-> jeu actif ; navigation via history.pushState/popstate
    │                          #   (le bouton retour matériel Android revient au hub) ; zéro logique de jeu
    ├── index.css               # tokens OKLCH (@theme), safe-area, prefers-reduced-motion
    ├── components/
    │   ├── Screen.tsx          # ossature safe-area-inset + min-h-dvh
    │   └── ActionButton.tsx    # bouton d'action 56px (primary/secondary)
    ├── games/
    │   ├── registry.ts         # catalogue des mini-jeux : { id, titre, pitch, emoji, disponible, composant }
    │   └── quiz/                # le seul mini-jeu actif
    │       ├── QuizGame.tsx     # orchestration : session, tirage, écrans (jeu / no-match / exhausted / formulaire)
    │       ├── FlipCard.tsx     # carte à retournement 3D CSS (~400ms)
    │       ├── FilterBar.tsx    # filtres difficulté + thèmes (multi-sélection), persistés
    │       ├── AddQuestionForm.tsx
    │       └── types.ts         # Theme, Difficulty, Question, Filters, QuizState
    ├── lib/
    │   ├── storage.ts + storage.test.ts     # repository localStorage typé
    │   └── selection.ts + selection.test.ts # moteur anti-répétition, fonctions pures (sans React)
    └── data/questions.seed.json  # 656 questions sur 6 thèmes (voir détail ci-dessous)
```

Contenu du seed (`questions.seed.json`), par thème :

| Thème | id | Total |
|---|---|---|
| Acronymes | `acronymes` | 110 |
| Personnalités | `personnalites` | 110 |
| Expressions | `expressions` | 130 |
| Départements | `departements` | 101 (couverture quasi complète : 96 métropolitains + 2A/2B + 5 DOM) |
| Insolite | `insolite` | 110 |
| Étymologie | `etymologie` | 95 (« pourquoi dit-on… », origine des mots — distinct des « expressions » qui portent sur le sens des locutions) |

## Patterns clés

**Ajouter un mini-jeu** : créer `src/games/<id>/` (composant racine avec la prop `onQuitter: () => void`) + une entrée dans `registry.ts`. Aucune logique de jeu dans `App.tsx` — il ne fait que router entre le hub et le composant actif.

**Moteur anti-répétition** (`src/lib/selection.ts`, `selectNext`) :
1. Filtre les questions par `filters` (difficulté + thèmes).
2. Pool « frais » = non vues cette session ET (`lastSeenSession === null` OU `sessionCounter - lastSeenSession >= 5`).
3. Si le pool frais est vide : repli sur les questions les moins récemment vues, en excluant toujours celles déjà vues dans la session courante (jamais les filtres). Retourne `lowStock: true`.
4. Si même le repli est vide : `status: 'exhausted'` → écran « Tu as fait le tour ! ».
5. Si aucune question ne correspond aux filtres dès le départ : `status: 'no-match'`.

Fonctions pures, `rng` injectable pour des tests déterministes. Couvert par `selection.test.ts` (jamais de répétition intra-session, cooldown de 5 sessions exact, filtres respectés à 100%).

**Storage** (`src/lib/storage.ts`) : `createQuizStorage(backend?)` — factory avec backend `Storage`-like injectable (par défaut `localStorage`, un objet Map factice dans les tests). Expose `loadState`, `saveState`, `addCustomQuestion`, `setFilters`, `startSession`, `markSeen`. Toute la persistance passe par ce module ; les composants n'appellent jamais `localStorage` directement.
`loadState` fusionne automatiquement les questions du seed absentes de l'état déjà stocké (par `id`), sans toucher à la progression (`lastSeenSession`) des questions existantes — nécessaire pour que le seed puisse grandir (nouvelles questions ajoutées au fichier) sans casser les utilisateurs qui ont déjà ouvert le quiz une fois. Couvert par `storage.test.ts`.

**Design** : registre product (pas brand) — familiarité et sobriété priment sur l'originalité. Fond sombre chaud (jamais `#000` pur), accent ambre unique, tokens OKLCH définis dans `src/index.css` via `@theme`. Une seule famille de police système (`-apple-system, Segoe UI, system-ui`). Cartes justifiées ici : la carte *est* l'objet du quiz. `prefers-reduced-motion` désactive le retournement (bascule instantanée).

**Conventions** :
- Textes de l'UI en français
- Zéro ressource chargée depuis un CDN (contrainte hors-ligne stricte)
- Boutons d'action bas de 56px minimum, cibles tactiles ≥44px
- Contenu du seed : uniquement des faits vérifiés, aucune étymologie inventée ; si une origine est débattue, la réponse le dit explicitement

## Déploiement

Dépôt GitHub : [abg5f/Duo-de-Routes](https://github.com/abg5f/Duo-de-Routes), branche `main`.
Hébergement non configuré. `npm run build` produit `dist/` (app statique + service worker) — déployable sur n'importe quel hébergeur statique (Cloudflare Pages, Vercel, Netlify…). Aucune variable d'environnement à configurer.

## Cartographie graphify

Le graphe de connaissances (skill `/graphify`) vit dans `graphify-out/`. Pour explorer :
- `/graphify` puis interroger — chercher par concept
- god nodes / communautés listés dans `graphify-out/index.md`

> Note : `graphify` est un skill (Claude écrit `graphify-out/`), pas un CLI shell.
> **Statut : non généré.** À lancer à la prochaine session avec du code substantiel en place.
