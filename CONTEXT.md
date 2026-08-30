# Context — Duo de Routes

> Dernière mise à jour : 2026-08-30

## État actuel
Mini-jeu quiz jouable de bout en bout, dans une PWA installable et 100% hors ligne. Le seed contient désormais **896 questions sur 8 thèmes** : acronymes, personnalités, expressions, départements, insolite, étymologie, histoire de France, sciences.
Build (`tsc -b` + `vite build`) et tests (`vitest`, 12/12) passent. Testé en navigateur à 390x844 sur le build de production : hub → quiz → retournement de carte → filtres → ajout de question persistant → retour au hub — aucune erreur console. Avec 8 thèmes, la barre de filtres occupe 3 lignes (148px) et la carte conserve 460px de haut : ni scroll horizontal ni scroll vertical, chips tous à 44px, boutons d'action à 56px.
Bug de superposition des faces de carte corrigé (PR #1 sur GitHub, mergée puis pullée en local le 2026-08-30) : voir décision « Fix carte flip » ci-dessous.

## Décisions prises
- **Stack** : Vite + React 19 + TypeScript + Tailwind v4 + vite-plugin-pwa. Persistance `localStorage` encapsulée dans un repository typé (`src/lib/storage.ts`), remplaçable par IndexedDB/SQLite sans toucher aux composants.
- **Architecture** : un mini-jeu = un dossier sous `src/games/<id>/` + une entrée dans `src/games/registry.ts`. `App.tsx` ne route que hub ↔ jeu actif, aucune logique de jeu dedans.
- **Design** : registre product (familiarité > originalité), fond sombre chaud jamais `#000` pur, un seul accent ambre (stratégie couleur « restrained »), typo système, `prefers-reduced-motion` respecté. Choix documenté suite à `/ui-ux-pro-max` + `/impeccable` : le style « 3D & Hyperrealism » et la palette claire suggérées par ui-ux-pro-max ont été explicitement écartés (incompatibles avec le hors-ligne et le fond sombre imposés).
- **Moteur anti-répétition** : cooldown de 5 sessions, filtres jamais relâchés même en repli. Couvert par tests unitaires déterministes (rng injecté).
- **Sixième thème `etymologie`** : ajouté pour distinguer les questions sur l'origine des mots (« pourquoi dit-on X ») des `expressions` qui portent sur le sens des locutions. `THEMES`/`THEME_LABELS` centralisés dans `types.ts` : `FilterBar` et `registry` l'ont pris en compte automatiquement, aucune autre modification de composant nécessaire.
- **Fusion du seed au chargement** : `storage.loadState` fusionne désormais les questions du seed absentes de l'état déjà stocké (par `id`), sans toucher à la progression existante. Nécessaire car sans ça les 506 nouvelles questions n'auraient jamais atteint un utilisateur ayant déjà ouvert le quiz une fois (le seed n'était lu qu'au tout premier lancement). Couvert par un nouveau test dans `storage.test.ts`.
- **Rigueur factuelle du contenu** : les 506 questions ajoutées suivent la même règle que les 150 initiales (faits vérifiés uniquement). Les quelques étymologies génuinement débattues (« bistrot », « assassin », « limousine », « tabac », légende du mot « kangourou ») sont explicitement signalées comme telles dans la réponse plutôt que présentées comme certaines.
- **Thèmes `histoire` et `sciences`** (240 questions, ajoutés à la demande de l'utilisateur pour un ton « pour les nuls ») : angle volontairement accessible et amusant, avec une bonne part de démontage d'idées reçues (Napoléon n'était pas petit, les astronautes ne flottent pas par absence de gravité, les courbatures ne viennent pas de l'acide lactique, le mythe des 10% du cerveau, la Grande Muraille invisible depuis l'espace, Marie-Antoinette et la brioche). Les points réellement incertains sont formulés comme tels : cause du hoquet et du bâillement, effet Mpemba, réalité juridique du règne de Louis XIX, décompte des croisades, identité du « premier roi de France ». `histoire` porte sur des événements et anecdotes, pour ne pas doublonner avec `personnalites` qui pose « qui était X ».
- **Sécurité** : une chaîne de connexion PostgreSQL Neon (avec identifiants en clair) a été collée par erreur dans le chat pendant la session — ignorée, non stockée, non utilisée. Elle contredit le choix explicite « sans backend / localStorage uniquement ». À régénérer côté Neon si elle a fuité par erreur.
- **Nom du projet** : « La Nappe » renommé en « Duo de Routes » à la demande de l'utilisateur. Renommage appliqué partout : `package.json` (`name`), manifest PWA (`name`/`short_name`/`description`), `<title>`, en-tête du hub (`App.tsx`), clé `localStorage` (`duo-de-routes:quiz-state:v1` — l'ancienne clé `la-nappe:quiz-state:v1` est abandonnée, sans conséquence puisqu'aucun utilisateur réel n'a encore ouvert l'app), `CLAUDE.md`, `CONTEXT.md`, noms des serveurs dans `.claude/launch.json`. Le design (fond sombre, accent ambre, icônes) n'a pas été retouché : les choix restent justifiés indépendamment du nom (cf. section Design ci-dessus).
- **Dépôt** : créé par l'utilisateur sur GitHub à [abg5f/Duo-de-Routes](https://github.com/abg5f/Duo-de-Routes). Ce dossier n'était pas suivi par le monorepo parent (`0_Claude Code`) — un dépôt Git indépendant a été initialisé directement dans `30_minijeuxvoiture/`, avec son propre `.gitignore` (node_modules, dist, etc.), commité et poussé sur `main`.
- **Fix carte flip (PR #1, 2026-08-30)** : la carte de `FlipCard.tsx` s'effondrait à une hauteur nulle (le `h-full` interne ne résolvait pas contre un parent `flex-1`), et `backface-visibility: hidden` n'était pas respecté sur certains moteurs de rendu mobiles — le texte de la question restait visible en miroir sous la réponse. Corrigé en basculant opacité/visibilité à mi-rotation (200ms) plutôt que de dépendre de `backface-visibility`, en passant le conteneur en `absolute inset-0`, et en sortant la révélation de la carte (qui n'est plus interactive) vers un bouton dédié « Réponse » / « Masquer la réponse » (44px) sous la carte, plus découvrable que le tap. `prefers-reduced-motion` neutralise aussi `transition-delay` pour garder la bascule instantanée.

## En cours / TODOs
- [ ] Tester l'installation réelle sur écran d'accueil iOS/Android (testé ici uniquement en navigateur desktop redimensionné)
- [ ] Décider si un futur mini-jeu justifie d'enrichir `shared/` au-delà de `components/` et `lib/`
- [ ] Vérifier le hors-ligne réel (coupure réseau matérielle) — vérifié ici par inspection du cache Service Worker et non par une coupure réseau effective, faute d'outil de throttling dans cette session
- [ ] Faire relire le contenu du seed (896 questions) par une source tierce si le projet est diffusé au-delà d'un usage personnel
- [ ] Surveiller la barre de filtres si un 9e thème est ajouté : à 8 thèmes elle occupe déjà 3 lignes sur un écran de 390px. Au-delà, prévoir un repliement ou un sélecteur dédié

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
- [src/games/quiz/types.ts](src/games/quiz/types.ts) — `Theme` (8 valeurs), source unique pour les filtres : ajouter un thème ici suffit, `FilterBar` suit
- [src/data/questions.seed.json](src/data/questions.seed.json) — 896 questions, contenu à faire relire par l'utilisateur (faits vérifiés mais non relus par une source tierce)
- [src/App.tsx](src/App.tsx) — navigation hub ↔ jeu, gestion du bouton retour
- [src/games/quiz/FlipCard.tsx](src/games/quiz/FlipCard.tsx) — carte de retournement, retouchée le 2026-08-30 pour corriger la superposition des faces (cf. décisions)

## Graphe de connaissances
> Mis à jour le 2026-08-30

God nodes (concepts centraux) : `QuizGame.tsx` (orchestrateur), `types.ts` (source de vérité des types), `storage.ts` (persistance), `selection.ts` (moteur anti-répétition), `App.tsx` (routeur hub ↔ jeu).
Communautés détectées : 4 (cœur du quiz, couche données, coquille applicative, design & thèmes).
Pour explorer : `graphify query "<question>"` / `graphify explain "<concept>"`

---
_Mis à jour via `/save`. Lire ce fichier en début de session pour reprendre le contexte._
