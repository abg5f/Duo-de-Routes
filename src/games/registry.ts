import type { ComponentType } from 'react';
import QuizGame from './quiz/QuizGame';

export type GameEntry = {
  id: string;
  titre: string;
  pitch: string;
  emoji: string;
  disponible: boolean;
  composant?: ComponentType<{ onQuitter: () => void }>;
};

export const registry: GameEntry[] = [
  {
    id: 'quiz',
    titre: 'Quiz à retourner',
    pitch: 'Devine, retourne la carte, vérifie la réponse.',
    emoji: '🃏',
    disponible: true,
    composant: QuizGame,
  },
  {
    id: 'bientot-1',
    titre: 'Bientôt',
    pitch: 'Un nouveau mini-jeu arrive.',
    emoji: '✨',
    disponible: false,
  },
  {
    id: 'bientot-2',
    titre: 'Bientôt',
    pitch: 'Un nouveau mini-jeu arrive.',
    emoji: '✨',
    disponible: false,
  },
];
