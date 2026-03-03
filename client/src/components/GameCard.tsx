import type { Game } from '../types/api';

interface GameCardProps {
    game: Game;
    onClick: (gamePk: number) => void;
    highlightTeam?: string;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function GameCard({ game, onClick, highlightTeam }: GameCardProps) {
    const { teams, venue, status, date } = game;
    const isFinal = status === 'Final';

    return (
        <button
            onClick={() => onClick(game.game_pk)}
            className="w-full text-left bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 hover:border-red-500/40 hover:bg-neutral-800 transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500">{formatDate(date)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isFinal
                        ? 'bg-neutral-700/50 text-neutral-400'
                        : 'bg-green-900/30 text-green-400'
                }`}>
                    {status}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${teams.away.name === highlightTeam ? 'text-white font-semibold' : 'text-neutral-300'}`}>{teams.away.name}</span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                        {teams.away.score ?? '-'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${teams.home.name === highlightTeam ? 'text-white font-semibold' : 'text-neutral-300'}`}>{teams.home.name}</span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                        {teams.home.score ?? '-'}
                    </span>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-600">{venue}</span>
                <span className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Watch highlights &rarr;
                </span>
            </div>
        </button>
    );
}
