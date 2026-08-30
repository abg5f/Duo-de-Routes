# Graphe de connaissances — Duo de Routes

> Généré le 2026-08-30. 20 nœuds, 30 arêtes, 4 communautés.

## God nodes (concepts centraux)

1. **QuizGame.tsx** (degré 11) — orchestrateur central du mini-jeu
2. **types.ts** (degré 10) — source de vérité des types partagés
3. **storage.ts** (degré 4) — seul point d'accès à `localStorage`
4. **selection.ts** (degré 4) — moteur anti-répétition
5. **App.tsx** (degré 3) — routeur hub ↔ jeu

## Communautés

1. **Cœur du quiz** — QuizGame, FlipCard, FilterBar, AddQuestionForm, types, fix carte (session 2026-08-30)
2. **Couche données** — storage, selection, seed, QuizState, moteur anti-répétition
3. **Coquille applicative** — main, App, registry, Screen, ActionButton
4. **Design & thèmes** — Theme, index.css

## Explorer

- `graphify query "<mot-clé>"` — trouver des nœuds
- `graphify path "<A>" "<B>"` — chemin le plus court entre deux nœuds
- `graphify explain "<concept>"` — résumé d'un nœud et ses connexions
- `graphify community <id>` — membres d'une communauté
- `graphify god-nodes` — lister les hubs

## Notes

Graphe construit par lecture statique des imports (`src/**`) et des décisions de session. À régénérer via `/graphify` (ou `/save`) après des changements structurels significatifs.
