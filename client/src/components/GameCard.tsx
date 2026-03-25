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

export default function GameCard({ game, onClick }: GameCardProps) {
    const { teams, venue, status, date } = game;
    const isFinal = status === 'Final';

    const awayScore = teams.away.score ?? null;
    const homeScore = teams.home.score ?? null;
    const hasScores = awayScore !== null && homeScore !== null;
    const awayWon = hasScores && awayScore > homeScore;
    const homeWon = hasScores && homeScore > awayScore;
    const isTie = hasScores && awayScore === homeScore;

    const teamNameClass = (isWinner: boolean, isLoser: boolean) => {
        if (!isFinal || isTie) return 'text-neutral-200';
        if (isWinner) return 'text-white font-semibold';
        if (isLoser) return 'text-neutral-400';
        return 'text-neutral-200';
    };

    const scoreClass = (isWinner: boolean, isLoser: boolean) => {
        if (!isFinal || isTie) return 'text-white';
        if (isWinner) return 'text-white';
        if (isLoser) return 'text-neutral-400';
        return 'text-white';
    };

    return (
        <button
            onClick={() => onClick(game.game_pk)}
            className="w-full text-left bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 hover:border-red-500/40 hover:bg-neutral-800 transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">{formatDate(date)}</span>
                <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${
                    isFinal
                        ? 'bg-neutral-700/50 text-neutral-300'
                        : 'bg-green-900/30 text-green-400'
                }`}>
                    {status}
                </span>
            </div>

            <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                    <span className={`text-base ${teamNameClass(awayWon, homeWon)}`}>{teams.away.name}</span>
                    <span className={`text-lg font-bold tabular-nums ${scoreClass(awayWon, homeWon)}`}>
                        {awayScore ?? '-'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`text-base ${teamNameClass(homeWon, awayWon)}`}>{teams.home.name}</span>
                    <span className={`text-lg font-bold tabular-nums ${scoreClass(homeWon, awayWon)}`}>
                        {homeScore ?? '-'}
                    </span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-700/50 flex items-center justify-between">
                <span className="text-xs text-neutral-400">{venue}</span>
                <span className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Watch highlights &rarr;
                </span>
            </div>
        </button>
    );
}
