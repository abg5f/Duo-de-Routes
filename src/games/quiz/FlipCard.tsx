import type { CSSProperties } from 'react';
import { THEME_LABELS, DIFFICULTY_LABELS, type Question } from './types';

type FlipCardProps = {
  question: Question;
  flipped: boolean;
};

const faceBase =
  'absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-y-auto ' +
  'rounded-2xl bg-surface p-6 text-center';

// La visibilité bascule d'un coup à mi-rotation (200ms = moitié des 400ms) :
// aucune superposition possible, contrairement à backface-visibility qui n'est
// pas fiable sur tous les moteurs de rendu mobiles.
function faceStyle(hidden: boolean): CSSProperties {
  return {
    opacity: hidden ? 0 : 1,
    visibility: hidden ? 'hidden' : 'visible',
    transition: 'opacity 0ms linear 200ms, visibility 0ms linear 200ms',
  };
}

export default function FlipCard({ question, flipped }: FlipCardProps) {
  return (
    <div className="relative w-full min-h-0 flex-1" style={{ perspective: '1400px' }}>
      <div
        className="absolute inset-0 transition-transform duration-[400ms] ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div className={faceBase} style={faceStyle(flipped)}>
          <span className="text-sm font-medium text-fg-muted">
            {THEME_LABELS[question.theme]} · {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <p className="text-[28px] leading-snug font-semibold text-fg">{question.question}</p>
        </div>
        <div
          className={faceBase}
          style={{ ...faceStyle(!flipped), transform: 'rotateY(180deg)' }}
        >
          <span className="text-sm font-medium text-fg-muted">Réponse</span>
          <p className="text-[24px] leading-snug text-fg">{question.answer}</p>
        </div>
      </div>
    </div>
  );
}
