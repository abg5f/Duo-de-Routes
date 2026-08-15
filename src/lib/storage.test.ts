import { describe, expect, it } from 'vitest';
import { createQuizStorage } from './storage';
import type { Question } from '../games/quiz/types';

function makeFakeBackend() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

const seed: Question[] = [
  {
    id: 'seed-1',
    theme: 'acronymes',
    difficulty: 'facile',
    question: 'Que signifie SNCF ?',
    answer: 'Société nationale des chemins de fer français.',
    custom: false,
    lastSeenSession: null,
  },
];

describe('createQuizStorage', () => {
  it('initialise depuis le seed au premier chargement', () => {
    const storage = createQuizStorage(makeFakeBackend());
    const state = storage.loadState(seed);
    expect(state.sessionCounter).toBe(0);
    expect(state.questions).toHaveLength(1);
    expect(state.filters).toEqual({ difficulty: 'toutes', themes: [] });
  });

  it('persiste entre deux instances partageant le même backend (simulate un rechargement)', () => {
    const backend = makeFakeBackend();
    const storageA = createQuizStorage(backend);
    const initial = storageA.loadState(seed);
    storageA.startSession(initial);

    const storageB = createQuizStorage(backend);
    const reloaded = storageB.loadState(seed);
    expect(reloaded.sessionCounter).toBe(1);
  });

  it('une question ajoutée via addCustomQuestion survit à un rechargement et reste tirable', () => {
    const backend = makeFakeBackend();
    const storageA = createQuizStorage(backend);
    const state = storageA.loadState(seed);
    storageA.addCustomQuestion(state, {
      theme: 'insolite',
      difficulty: 'moyen',
      question: 'Question perso ?',
      answer: 'Réponse perso.',
    });

    const storageB = createQuizStorage(backend);
    const reloaded = storageB.loadState(seed);
    expect(reloaded.questions).toHaveLength(2);
    const custom = reloaded.questions.find((q) => q.custom);
    expect(custom?.question).toBe('Question perso ?');
    expect(custom?.lastSeenSession).toBeNull();
  });

  it('markSeen fixe lastSeenSession sur le sessionCounter courant et persiste', () => {
    const backend = makeFakeBackend();
    const storage = createQuizStorage(backend);
    let state = storage.loadState(seed);
    state = storage.startSession(state);
    state = storage.markSeen(state, 'seed-1');
    expect(state.questions[0].lastSeenSession).toBe(1);

    const reloaded = createQuizStorage(backend).loadState(seed);
    expect(reloaded.questions[0].lastSeenSession).toBe(1);
  });

  it('fusionne les nouvelles questions du seed sans perdre la progression déjà enregistrée', () => {
    const backend = makeFakeBackend();
    const storageA = createQuizStorage(backend);
    let state = storageA.loadState(seed);
    state = storageA.startSession(state);
    state = storageA.markSeen(state, 'seed-1');

    const grownSeed: Question[] = [
      ...seed,
      {
        id: 'seed-2',
        theme: 'insolite',
        difficulty: 'facile',
        question: 'Combien de pattes a une araignée ?',
        answer: 'Huit pattes.',
        custom: false,
        lastSeenSession: null,
      },
    ];

    const storageB = createQuizStorage(backend);
    const reloaded = storageB.loadState(grownSeed);
    expect(reloaded.questions).toHaveLength(2);
    expect(reloaded.questions.find((q) => q.id === 'seed-1')?.lastSeenSession).toBe(1);
    expect(reloaded.questions.find((q) => q.id === 'seed-2')?.lastSeenSession).toBeNull();
    expect(reloaded.sessionCounter).toBe(1);
  });

  it('setFilters persiste les filtres entre sessions', () => {
    const backend = makeFakeBackend();
    const storage = createQuizStorage(backend);
    const state = storage.loadState(seed);
    storage.setFilters(state, { difficulty: 'facile', themes: ['acronymes'] });

    const reloaded = createQuizStorage(backend).loadState(seed);
    expect(reloaded.filters).toEqual({ difficulty: 'facile', themes: ['acronymes'] });
  });
});
