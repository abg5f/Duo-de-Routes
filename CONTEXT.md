# Context — Duo de Routes

> Dernière mise à jour : 2026-08-15

## État actuel
Mini-jeu quiz jouable de bout en bout, dans une PWA installable et 100% hors ligne. Le seed contient désormais **656 questions sur 6 thèmes** (acronymes, personnalités, expressions, départements, insolite, étymologie — ce dernier ajouté à la demande de l'utilisateur pour les questions type « pourquoi dit-on boucané… »).
Build (`tsc -b` + `vite build`) et tests (`vitest`, 12/12) passent. Testé en navigateur à 390x844 : hub → quiz → retournement de carte → filtres (6 thèmes, zéro scroll horizontal) → ajout de question persistant → retour au hub — aucune erreur console. Fusion du seed vérifiée en direct : un état localStorage simulant un utilisateur n'ayant que les 150 premières questions récupère bien les 506 nouvelles au chargement suivant, sans perdre sa progression (`sessionCounter`, `lastSeenSession`).

## Décisions prises
- **Stack** : Vite + React 19 + TypeScript + Tailwind v4 + vite-plugin-pwa. Persistance `localStorage` encapsulée dans un repository typé (`src/lib/storage.ts`), remplaçable par IndexedDB/SQLite sans toucher aux composants.
- **Architecture** : un mini-jeu = un dossier sous `src/games/<id>/` + une entrée dans `src/games/registry.ts`. `App.tsx` ne route que hub ↔ jeu actif, aucune logique de jeu dedans.
- **Design** : registre product (familiarité > originalité), fond sombre chaud jamais `#000` pur, un seul accent ambre (stratégie couleur « restrained »), typo système, `prefers-reduced-motion` respecté. Choix documenté suite à `/ui-ux-pro-max` + `/impeccable` : le style « 3D & Hyperrealism » et la palette claire suggérées par ui-ux-pro-max ont été explicitement écartés (incompatibles avec le hors-ligne et le fond sombre imposés).
- **Moteur anti-répétition** : cooldown de 5 sessions, filtres jamais relâchés même en repli. Couvert par tests unitaires déterministes (rng injecté).
- **Sixième thème `etymologie`** : ajouté pour distinguer les questions sur l'origine des mots (« pourquoi dit-on X ») des `expressions` qui portent sur le sens des locutions. `THEMES`/`THEME_LABELS` centralisés dans `types.ts` : `FilterBar` et `registry` l'ont pris en compte automatiquement, aucune autre modification de composant nécessaire.
- **Fusion du seed au chargement** : `storage.loadState` fusionne désormais les questions du seed absentes de l'état déjà stocké (par `id`), sans toucher à la progression existante. Nécessaire car sans ça les 506 nouvelles questions n'auraient jamais atteint un utilisateur ayant déjà ouvert le quiz une fois (le seed n'était lu qu'au tout premier lancement). Couvert par un nouveau test dans `storage.test.ts`.
- **Rigueur factuelle du contenu** : les 506 questions ajoutées suivent la même règle que les 150 initiales (faits vérifiés uniquement). Les quelques étymologies génuinement débattues (« bistrot », « assassin », « limousine », « tabac », légende du mot « kangourou ») sont explicitement signalées comme telles dans la réponse plutôt que présentées comme certaines.
- **Sécurité** : une chaîne de connexion PostgreSQL Neon (avec identifiants en clair) a été collée par erreur dans le chat pendant la session — ignorée, non stockée, non utilisée. Elle contredit le choix explicite « sans backend / localStorage uniquement ». À régénérer côté Neon si elle a fuité par erreur.
- **Nom du projet** : « La Nappe » renommé en « Duo de Routes » à la demande de l'utilisateur. Renommage appliqué partout : `package.json` (`name`), manifest PWA (`name`/`short_name`/`description`), `<title>`, en-tête du hub (`App.tsx`), clé `localStorage` (`duo-de-routes:quiz-state:v1` — l'ancienne clé `la-nappe:quiz-state:v1` est abandonnée, sans conséquence puisqu'aucun utilisateur réel n'a encore ouvert l'app), `CLAUDE.md`, `CONTEXT.md`, noms des serveurs dans `.claude/launch.json`. Le design (fond sombre, accent ambre, icônes) n'a pas été retouché : les choix restent justifiés indépendamment du nom (cf. section Design ci-dessus).
- **Dépôt** : créé par l'utilisateur sur GitHub à [abg5f/Duo-de-Routes](https://github.com/abg5f/Duo-de-Routes). Ce dossier n'était pas suivi par le monorepo parent (`0_Claude Code`) — un dépôt Git indépendant a été initialisé directement dans `30_minijeuxvoiture/`, avec son propre `.gitignore` (node_modules, dist, etc.), commité et poussé sur `main`.

## En cours / TODOs
- [ ] Tester l'installation réelle sur écran d'accueil iOS/Android (testé ici uniquement en navigateur desktop redimensionné)
- [ ] Décider si un futur mini-jeu justifie d'enrichir `shared/` au-delà de `components/` et `lib/`
- [ ] Lancer `/graphify` une fois le code jugé stable
- [ ] Vérifier le hors-ligne réel (coupure réseau matérielle) — vérifié ici par inspection du cache Service Worker et non par une coupure réseau effective, faute d'outil de throttling dans cette session
- [ ] Faire relire le contenu du seed (656 questions) par une source tierce si le projet est diffusé au-delà d'un usage personnel

## Problèmes connus
Aucun bug bloquant. Un point d'attention repéré pendant les tests, sans impact production :
- En mode dev avec `React.StrictMode` (`src/main.tsx`), `sessionCounter` s'incrémente deux fois au montage au lieu d'une (double-invocation volontaire de React pour détecter les effets de bord dans les initialiseurs `useState`, puisque `storage.startSession` a un effet de bord). Confirmé inoffensif : en build de production (`npm run preview`), l'incrément est correct (+1). À garder en tête si `QuizGame.tsx` est retouché.

Décisions mineures prises sans repasser par l'utilisateur (jugées dans le périmètre du brief) :
- « Passer » et « Question suivante » ont un comportement strictement identique côté données (les deux marquent la question comme vue) — seul le libellé diffère, comme confirmé.
- Formulaire d'ajout de question implémenté en écran plein remplaçant l'écran de jeu (pas de modale), sans intégration au bouton retour matériel — un « Annuler » suffit, hors du périmètre de navigation validé pour hub ↔ jeu.
- Champ `emoji` du registre gardé malgré la règle « pas d'emoji comme icône » des skills UI (décoratif, `aria-hidden`, le sens est porté par le titre/pitch).

## Fichiers clés
- [src/lib/selection.ts](src/lib/selection.ts) — moteur anti-répétition, cœur logique du quiz
- [src/lib/storage.ts](src/lib/storage.ts) — seul point d'accès à `localStorage`, fusion du seed au chargement
- [src/games/quiz/QuizGame.tsx](src/games/quiz/QuizGame.tsx) — orchestration du mini-jeu
- [src/games/quiz/types.ts](src/games/quiz/types.ts) — `Theme` (6 valeurs dont `etymologie`), source unique pour les filtres
- [src/data/questions.seed.json](src/data/questions.seed.json) — 656 questions, contenu à faire relire par l'utilisateur (faits vérifiés mais non relus par une source tierce)
- [src/App.tsx](src/App.tsx) — navigation hub ↔ jeu, gestion du bouton retour

---
_Mis à jour via `/save`. Lire ce fichier en début de session pour reprendre le contexte._
