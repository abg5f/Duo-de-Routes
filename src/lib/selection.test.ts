import { describe, expect, it } from 'vitest';
import { selectNext } from './selection';
import type { Filters, Question, QuizState } from '../games/quiz/types';

function makeQuestion(overrides: Partial<Question> & Pick<Question, 'id'>): Question {
  return {
    theme: 'acronymes',
    difficulty: 'facile',
    question: `Question ${overrides.id}`,
    answer: `Réponse ${overrides.id}`,
    custom: false,
    lastSeenSession: null,
    ...overrides,
  };
}

function makeState(questions: Question[], sessionCounter: number, filters?: Partial<Filters>): QuizState {
  return {
    sessionCounter,
    questions,
    filters: { difficulty: 'toutes', themes: [], ...filters },
  };
}

describe('selectNext — jamais deux fois dans la même session', () => {
  it('ne répète aucune question tant que le pool filtré n\'est pas épuisé', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion({ id: `q${i}` }));
    let state = makeState(questions, 1);
    const seen = new Set<string>();

    for (let i = 0; i < 10; i++) {
      const outcome = selectNext(state);
      expect(outcome.status).toBe('ok');
      if (outcome.status !== 'ok') throw new Error('unreachable');
      expect(seen.has(outcome.question.id)).toBe(false);
      seen.add(outcome.question.id);
      state = {
        ...state,
        questions: state.questions.map((q) =>
          q.id === outcome.question.id ? { ...q, lastSeenSession: state.sessionCounter } : q,
        ),
      };
    }

    expect(seen.size).toBe(10);
    expect(selectNext(state).status).toBe('exhausted');
  });
});

describe('selectNext — cooldown de 5 sessions', () => {
  it('exclut une question vue il y a moins de 5 sessions tant qu\'une alternative existe', () => {
    const fresh = makeQuestion({ id: 'toujours-fraiche', lastSeenSession: null });

    for (let diff = 0; diff <= 4; diff++) {
      const currentSession = 10;
      const cooling = makeQuestion({ id: 'en-attente', lastSeenSession: currentSession - diff });
      const state = makeState([fresh, cooling], currentSession);

      const outcome = selectNext(state, () => 0.99); // rng au max : choisirait 'cooling' si éligible
      expect(outcome.status).toBe('ok');
      if (outcome.status !== 'ok') throw new Error('unreachable');
      expect(outcome.question.id).toBe('toujours-fraiche');
    }
  });

  it('redevient éligible exactement à la session N+5', () => {
    const currentSession = 10;
    const fresh = makeQuestion({ id: 'toujours-fraiche', lastSeenSession: null });
    const nowEligible = makeQuestion({ id: 'redevenue-eligible', lastSeenSession: currentSession - 5 });
    const state = makeState([fresh, nowEligible], currentSession);

    const outcome = selectNext(state, () => 0.99); // 2 candidats, rng haut -> dernier de la liste
    expect(outcome.status).toBe('ok');
    if (outcome.status !== 'ok') throw new Error('unreachable');
    expect(outcome.question.id).toBe('redevenue-eligible');
    expect(outcome.lowStock).toBe(false);
  });
});

describe('selectNext — filtres', () => {
  const questions = [
    makeQuestion({ id: 'a1', theme: 'acronymes', difficulty: 'facile' }),
    makeQuestion({ id: 'a2', theme: 'acronymes', difficulty: 'difficile' }),
    makeQuestion({ id: 'p1', theme: 'personnalites', difficulty: 'facile' }),
    makeQuestion({ id: 'p2', theme: 'personnalites', difficulty: 'moyen' }),
    makeQuestion({ id: 'i1', theme: 'insolite', difficulty: 'facile' }),
  ];

  it('respecte la combinaison thème + difficulté à 100% sur de nombreux tirages', () => {
    const state = makeState(questions, 1, { difficulty: 'facile', themes: ['acronymes'] });

    for (let i = 0; i < 20; i++) {
      const outcome = selectNext(state, () => Math.random());
      expect(outcome.status).toBe('ok');
      if (outcome.status !== 'ok') throw new Error('unreachable');
      expect(outcome.question.theme).toBe('acronymes');
      expect(outcome.question.difficulty).toBe('facile');
    }
  });

  it('respecte un multi-sélection de thèmes avec difficulté "toutes"', () => {
    const state = makeState(questions, 1, { difficulty: 'toutes', themes: ['acronymes', 'insolite'] });

    for (let i = 0; i < 20; i++) {
      const outcome = selectNext(state, () => Math.random());
      expect(outcome.status).toBe('ok');
      if (outcome.status !== 'ok') throw new Error('unreachable');
      expect(['acronymes', 'insolite']).toContain(outcome.question.theme);
    }
  });

  it('retourne no-match quand aucune question ne correspond aux filtres', () => {
    const state = makeState(questions, 1, { difficulty: 'difficile', themes: ['insolite'] });
    expect(selectNext(state).status).toBe('no-match');
  });
});
