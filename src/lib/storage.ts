import type { Filters, Question, QuizState } from '../games/quiz/types';

const STORAGE_KEY = 'duo-de-routes:quiz-state:v1';

type StorageBackend = Pick<Storage, 'getItem' | 'setItem'>;

const defaultFilters: Filters = { difficulty: 'toutes', themes: [] };

function readRaw(backend: StorageBackend): QuizState | null {
  const raw = backend.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuizState;
    if (!Array.isArray(parsed.questions) || typeof parsed.sessionCounter !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRaw(backend: StorageBackend, state: QuizState): void {
  backend.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createQuizStorage(backend: StorageBackend = globalThis.localStorage) {
  function loadState(seedQuestions: Question[]): QuizState {
    const existing = readRaw(backend);
    if (!existing) {
      const initial: QuizState = { sessionCounter: 0, questions: seedQuestions, filters: defaultFilters };
      writeRaw(backend, initial);
      return initial;
    }

    // Le seed a pu grandir depuis le dernier chargement (nouvelles questions ajoutées
    // au fichier). On les fusionne sans toucher à la progression déjà enregistrée.
    const existingIds = new Set(existing.questions.map((q) => q.id));
    const newFromSeed = seedQuestions.filter((q) => !existingIds.has(q.id));
    if (newFromSeed.length === 0) return existing;

    const merged: QuizState = { ...existing, questions: [...existing.questions, ...newFromSeed] };
    writeRaw(backend, merged);
    return merged;
  }

  function saveState(state: QuizState): void {
    writeRaw(backend, state);
  }

  function addCustomQuestion(
    state: QuizState,
    input: Omit<Question, 'id' | 'custom' | 'lastSeenSession'>,
  ): QuizState {
    const question: Question = {
      ...input,
      id: `custom-${crypto.randomUUID()}`,
      custom: true,
      lastSeenSession: null,
    };
    const next: QuizState = { ...state, questions: [...state.questions, question] };
    saveState(next);
    return next;
  }

  function setFilters(state: QuizState, filters: Filters): QuizState {
    const next: QuizState = { ...state, filters };
    saveState(next);
    return next;
  }

  function startSession(state: QuizState): QuizState {
    const next: QuizState = { ...state, sessionCounter: state.sessionCounter + 1 };
    saveState(next);
    return next;
  }

  function markSeen(state: QuizState, id: string): QuizState {
    const next: QuizState = {
      ...state,
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, lastSeenSession: state.sessionCounter } : q,
      ),
    };
    saveState(next);
    return next;
  }

  return { loadState, saveState, addCustomQuestion, setFilters, startSession, markSeen };
}

export type QuizStorage = ReturnType<typeof createQuizStorage>;
