import type { Filters, Question, QuizState } from '../games/quiz/types';

const REPEAT_COOLDOWN_SESSIONS = 5;

export type SelectionOutcome =
  | { status: 'ok'; question: Question; lowStock: boolean }
  | { status: 'no-match' }
  | { status: 'exhausted' };

export function matchesFilters(question: Question, filters: Filters): boolean {
  const difficultyOk = filters.difficulty === 'toutes' || question.difficulty === filters.difficulty;
  const themeOk = filters.themes.length === 0 || filters.themes.includes(question.theme);
  return difficultyOk && themeOk;
}

export function pickRandom<T>(items: T[], rng: () => number = Math.random): T {
  const index = Math.floor(rng() * items.length);
  return items[index];
}

/**
 * Pure selection engine. Never mutates state; the caller persists the
 * returned question's id via storage.markSeen.
 */
export function selectNext(state: QuizState, rng: () => number = Math.random): SelectionOutcome {
  const candidates = state.questions.filter((q) => matchesFilters(q, state.filters));
  if (candidates.length === 0) return { status: 'no-match' };

  const currentSession = state.sessionCounter;
  const fresh = candidates.filter(
    (q) => q.lastSeenSession === null || currentSession - q.lastSeenSession >= REPEAT_COOLDOWN_SESSIONS,
  );
  if (fresh.length > 0) {
    return { status: 'ok', question: pickRandom(fresh, rng), lowStock: false };
  }

  // Repli : on relâche le délai, jamais les filtres, jamais les questions déjà vues cette session.
  const fallbackPool = candidates.filter((q) => q.lastSeenSession !== currentSession);
  if (fallbackPool.length === 0) return { status: 'exhausted' };

  const oldestSeen = Math.min(...fallbackPool.map((q) => q.lastSeenSession ?? -Infinity));
  const oldestTied = fallbackPool.filter((q) => (q.lastSeenSession ?? -Infinity) === oldestSeen);
  return { status: 'ok', question: pickRandom(oldestTied, rng), lowStock: true };
}
