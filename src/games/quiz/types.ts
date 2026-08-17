export type Theme =
  | 'acronymes'
  | 'personnalites'
  | 'expressions'
  | 'departements'
  | 'insolite'
  | 'etymologie'
  | 'histoire'
  | 'sciences';
export type Difficulty = 'facile' | 'moyen' | 'difficile';

export type Question = {
  id: string;
  theme: Theme;
  difficulty: Difficulty;
  question: string;
  answer: string;
  custom: boolean;
  lastSeenSession: number | null;
};

export type Filters = {
  difficulty: Difficulty | 'toutes';
  themes: Theme[];
};

export type QuizState = {
  sessionCounter: number;
  questions: Question[];
  filters: Filters;
};

export const THEMES: Theme[] = [
  'acronymes',
  'personnalites',
  'expressions',
  'departements',
  'insolite',
  'etymologie',
  'histoire',
  'sciences',
];
export const DIFFICULTIES: Difficulty[] = ['facile', 'moyen', 'difficile'];

export const THEME_LABELS: Record<Theme, string> = {
  acronymes: 'Acronymes',
  personnalites: 'Personnalités',
  expressions: 'Expressions',
  departements: 'Départements',
  insolite: 'Insolite',
  etymologie: 'Étymologie',
  histoire: 'Histoire de France',
  sciences: 'Sciences',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
};
