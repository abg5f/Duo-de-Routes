import { useEffect, useState } from 'react';
import Screen from './components/Screen';
import { registry } from './games/registry';

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    history.replaceState({ gameId: null }, '');
    function onPopState(event: PopStateEvent) {
      setActiveId((event.state as { gameId: string | null } | null)?.gameId ?? null);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function openGame(id: string) {
    history.pushState({ gameId: id }, '');
    setActiveId(id);
  }

  function quitGame() {
    history.back();
  }

  const active = registry.find((g) => g.id === activeId && g.disponible);

  if (active?.composant) {
    const GameComponent = active.composant;
    return <GameComponent onQuitter={quitGame} />;
  }

  return (
    <Screen>
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-semibold text-fg">Duo de Routes</h1>
        <p className="text-base text-fg-muted">Mini-jeux à deux, à jouer sur la route.</p>
      </header>
      <nav className="flex flex-1 flex-col divide-y divide-border px-4">
        {registry.map((game) => (
          <button
            key={game.id}
            type="button"
            disabled={!game.disponible}
            onClick={() => openGame(game.id)}
            className="flex min-h-[72px] items-center gap-4 py-4 text-left disabled:opacity-40"
          >
            <span aria-hidden="true" className="text-3xl">
              {game.emoji}
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-medium text-fg">{game.titre}</span>
              <span className="text-sm text-fg-muted">{game.pitch}</span>
            </span>
          </button>
        ))}
      </nav>
    </Screen>
  );
}
