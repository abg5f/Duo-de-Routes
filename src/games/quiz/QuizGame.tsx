import { useMemo, useState } from 'react';
import ActionButton from '../../components/ActionButton';
import Screen from '../../components/Screen';
import { createQuizStorage } from '../../lib/storage';
import { selectNext } from '../../lib/selection';
import seedQuestions from '../../data/questions.seed.json';
import AddQuestionForm from './AddQuestionForm';
import FilterBar from './FilterBar';
import FlipCard from './FlipCard';
import type { Difficulty, Filters, Question, QuizState, Theme } from './types';

type QuizGameProps = {
  onQuitter: () => void;
};

type DrawResult = {
  current: Question | null;
  lowStock: boolean;
  screen: 'playing' | 'no-match' | 'exhausted';
};

const seed = seedQuestions as Question[];

function draw(state: QuizState): DrawResult {
  const outcome = selectNext(state);
  if (outcome.status === 'ok') {
    return { current: outcome.question, lowStock: outcome.lowStock, screen: 'playing' };
  }
  if (outcome.status === 'no-match') {
    return { current: null, lowStock: false, screen: 'no-match' };
  }
  return { current: null, lowStock: false, screen: 'exhausted' };
}

export default function QuizGame({ onQuitter }: QuizGameProps) {
  const storage = useMemo(() => createQuizStorage(), []);

  const [quizState, setQuizState] = useState<QuizState>(() => storage.startSession(storage.loadState(seed)));
  const [result, setResult] = useState<DrawResult>(() => draw(quizState));
  const [flipped, setFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  function drawAndPersist(state: QuizState) {
    const next = draw(state);
    if (next.current) {
      const persisted = storage.markSeen(state, next.current.id);
      setQuizState(persisted);
    } else {
      setQuizState(state);
    }
    setResult(next);
    setFlipped(false);
  }

  function handleNext() {
    drawAndPersist(quizState);
  }

  function handleFiltersChange(filters: Filters) {
    const next = storage.setFilters(quizState, filters);
    drawAndPersist(next);
  }

  function handleAddQuestion(input: { theme: Theme; difficulty: Difficulty; question: string; answer: string }) {
    const next = storage.addCustomQuestion(quizState, input);
    setQuizState(next);
    setShowAddForm(false);
  }

  if (showAddForm) {
    return (
      <Screen>
        <AddQuestionForm onSubmit={handleAddQuestion} onCancel={() => setShowAddForm(false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FilterBar filters={quizState.filters} onChange={handleFiltersChange} />

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {result.screen === 'playing' && result.current && (
          <>
            {result.lowStock && (
              <p className="text-center text-sm text-fg-muted">Stock bientôt épuisé sur ces filtres.</p>
            )}
            <FlipCard question={result.current} flipped={flipped} />
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-pressed={flipped}
              className="mx-auto flex min-h-11 items-center justify-center rounded-full border border-border
                bg-surface px-6 text-sm font-medium text-fg transition-[background-color,transform]
                duration-150 ease-out active:scale-[0.97] active:bg-surface-active"
            >
              {flipped ? 'Masquer la réponse' : 'Réponse'}
            </button>
          </>
        )}

        {result.screen === 'no-match' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-xl font-semibold text-fg">Aucune question avec ces filtres</p>
            <p className="text-base text-fg-muted">Modifie les filtres ci-dessus, ou reviens au hub.</p>
          </div>
        )}

        {result.screen === 'exhausted' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-xl font-semibold text-fg">Tu as fait le tour !</p>
            <p className="text-base text-fg-muted">
              Toutes les questions disponibles pour ces filtres ont été vues.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {result.screen === 'playing' ? (
          <>
            <div className="flex gap-3">
              <ActionButton variant="secondary" onClick={handleNext}>
                Passer
              </ActionButton>
              <ActionButton variant="primary" onClick={handleNext}>
                Question suivante
              </ActionButton>
            </div>
            <ActionButton variant="secondary" onClick={() => setShowAddForm(true)}>
              + Ajouter une question
            </ActionButton>
          </>
        ) : (
          <ActionButton variant="primary" onClick={onQuitter}>
            Retour au hub
          </ActionButton>
        )}
      </div>
    </Screen>
  );
}
