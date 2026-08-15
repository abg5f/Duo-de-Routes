import { useState, type FormEvent } from 'react';
import ActionButton from '../../components/ActionButton';
import { DIFFICULTIES, DIFFICULTY_LABELS, THEMES, THEME_LABELS, type Difficulty, type Theme } from './types';

type AddQuestionFormProps = {
  onSubmit: (input: { theme: Theme; difficulty: Difficulty; question: string; answer: string }) => void;
  onCancel: () => void;
};

const fieldClass =
  'min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base text-fg outline-none focus:border-accent';

export default function AddQuestionForm({ onSubmit, onCancel }: AddQuestionFormProps) {
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const canSubmit = question.trim().length > 0 && answer.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ theme, difficulty, question: question.trim(), answer: answer.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      <h1 className="text-xl font-semibold text-fg">Ajouter une question</h1>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg-muted">Thème</span>
        <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} className={fieldClass}>
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {THEME_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg-muted">Difficulté</span>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className={fieldClass}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {DIFFICULTY_LABELS[d]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg-muted">Question</span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          className={`${fieldClass} resize-none`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg-muted">Réponse</span>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          required
          className={`${fieldClass} resize-none`}
        />
      </label>

      <div className="mt-auto flex gap-3 pt-4">
        <ActionButton type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </ActionButton>
        <ActionButton type="submit" variant="primary" disabled={!canSubmit}>
          Enregistrer
        </ActionButton>
      </div>
    </form>
  );
}
