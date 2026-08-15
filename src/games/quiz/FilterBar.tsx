import { DIFFICULTIES, DIFFICULTY_LABELS, THEMES, THEME_LABELS, type Difficulty, type Filters } from './types';

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const chipBase =
  'min-h-11 rounded-full px-3 text-sm font-medium transition-colors duration-150 active:scale-[0.97]';

function chipClass(active: boolean) {
  return `${chipBase} ${active ? 'bg-accent text-accent-fg' : 'bg-surface text-fg-muted'}`;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const difficultyOptions: Array<Difficulty | 'toutes'> = ['toutes', ...DIFFICULTIES];

  function toggleTheme(theme: (typeof THEMES)[number]) {
    const active = filters.themes.includes(theme);
    onChange({
      ...filters,
      themes: active ? filters.themes.filter((t) => t !== theme) : [...filters.themes, theme],
    });
  }

  return (
    <div className="flex flex-col gap-2 px-4 pt-3">
      <div role="group" aria-label="Filtrer par difficulté" className="flex flex-wrap gap-2">
        {difficultyOptions.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={filters.difficulty === d}
            onClick={() => onChange({ ...filters, difficulty: d })}
            className={chipClass(filters.difficulty === d)}
          >
            {d === 'toutes' ? 'Toutes' : DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Filtrer par thème" className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            aria-pressed={filters.themes.includes(theme)}
            onClick={() => toggleTheme(theme)}
            className={chipClass(filters.themes.includes(theme))}
          >
            {THEME_LABELS[theme]}
          </button>
        ))}
      </div>
    </div>
  );
}
