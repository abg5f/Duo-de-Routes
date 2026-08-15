import { THEME_LABELS, DIFFICULTY_LABELS, type Question } from './types';

type FlipCardProps = {
  question: Question;
  flipped: boolean;
  onToggle: () => void;
};

const faceBase =
  'absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-surface p-6 text-center';

export default function FlipCard({ question, flipped, onToggle }: FlipCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={flipped}
      aria-label={flipped ? 'Voir la question' : 'Voir la réponse'}
      className="relative w-full flex-1"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative h-full w-full transition-transform duration-[400ms] ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div className={faceBase} style={{ backfaceVisibility: 'hidden' }}>
          <span className="text-sm font-medium text-fg-muted">
            {THEME_LABELS[question.theme]} · {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <p className="text-[28px] leading-snug font-semibold text-fg">{question.question}</p>
        </div>
        <div
          className={faceBase}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-sm font-medium text-fg-muted">Réponse</span>
          <p className="text-[24px] leading-snug text-fg">{question.answer}</p>
        </div>
      </div>
    </button>
  );
}
