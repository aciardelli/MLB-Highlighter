import { useState, useEffect, useRef, useCallback } from 'react'
import GameCard from '../components/GameCard'
import GameFilters from '../components/GameFilters'
import VideoPlaylist from '../components/VideoPlaylist'
import RequestStatus from '../components/RequestStatus'
import { gameService } from '../api/gameService'
import { streamClipUrls } from '../api/sseService'
import type { Game, VideoClip, GamePlaysResponse } from '../types/api'

type Phase = 'idle' | 'loading-plays' | 'filtering' | 'submitting' | 'streaming' | 'stream-complete' | 'error';
type View = 'list' | 'filter' | 'player';

const MLB_TEAMS = [
    "Arizona Diamondbacks",
    "Atlanta Braves",
    "Baltimore Orioles",
    "Boston Red Sox",
    "Chicago Cubs",
    "Chicago White Sox",
    "Cincinnati Reds",
    "Cleveland Guardians",
    "Colorado Rockies",
    "Detroit Tigers",
    "Houston Astros",
    "Kansas City Royals",
    "Los Angeles Angels",
    "Los Angeles Dodgers",
    "Miami Marlins",
    "Milwaukee Brewers",
    "Minnesota Twins",
    "New York Mets",
    "New York Yankees",
    "Oakland Athletics",
    "Philadelphia Phillies",
    "Pittsburgh Pirates",
    "San Diego Padres",
    "San Francisco Giants",
    "Seattle Mariners",
    "St. Louis Cardinals",
    "Tampa Bay Rays",
    "Texas Rangers",
    "Toronto Blue Jays",
    "Washington Nationals",
];

function GameSearch() {
    // List view state
    const [selectedTeam, setSelectedTeam] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState(false);
    const [gamesError, setGamesError] = useState<string | null>(null);

    // Filter view state
    const [playsData, setPlaysData] = useState<GamePlaysResponse | null>(null);
    const [loadingPlays, setLoadingPlays] = useState(false);

    // Player view state
    const [view, setView] = useState<View>('list');
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');
    const [clips, setClips] = useState<VideoClip[]>([]);
    const [streamComplete, setStreamComplete] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    const pendingPlayIdsRef = useRef<string[] | undefined>(undefined);

    const hasInteracted = selectedTeam !== '';

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch schedule when team changes
    useEffect(() => {
        if (!selectedTeam) return;

        setLoadingGames(true);
        setGamesError(null);
        setGames([]);

        gameService.getSchedule(selectedTeam)
            .then((res) => setGames(res.games))
            .catch((err) => {
                const msg = err.response?.data?.detail || 'Failed to load schedule.';
                setGamesError(msg);
            })
            .finally(() => setLoadingGames(false));
    }, [selectedTeam]);

    // Stream highlights when entering player view
    useEffect(() => {
        if (phase !== 'streaming' || !selectedGame) return;

        const playIds = pendingPlayIdsRef.current;
        pendingPlayIdsRef.current = undefined;

        const startStream = async () => {
            try {
                const res = await gameService.streamHighlights(selectedGame.game_pk, playIds);
                const es = streamClipUrls(res.job_id, {
                    onClip: (clip) => {
                        setClips(prev => {
                            const updated = [...prev, clip];
                            updated.sort((a, b) => a.index - b.index);
                            return updated;
                        });
                    },
                    onComplete: (total) => {
                        setStreamComplete(true);
                        if (total === 0) {
                            setErrorMessage('No highlights found for this game.');
                            setPhase('error');
                        } else {
                            setPhase('stream-complete');
                        }
                    },
                    onError: () => {
                        setErrorMessage('Lost connection while loading highlights.');
                        setPhase('error');
                    },
                });
                eventSourceRef.current = es;
            } catch (err: unknown) {
                const error = err as { response?: { data?: { detail?: string } | string }; message?: string };
                const data = error.response?.data;
                const msg = (typeof data === 'object' ? data?.detail : data)
                    || error.message
                    || 'Failed to start highlight stream.';
                setErrorMessage(msg);
                setPhase('error');
            }
        };

        startStream();

        return () => {
            eventSourceRef.current?.close();
        };
    }, [phase, selectedGame]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            eventSourceRef.current?.close();
        };
    }, []);

    const handleGameClick = useCallback(async (gamePk: number) => {
        const game = games.find(g => g.game_pk === gamePk);
        if (!game) return;

        setSelectedGame(game);
        setPlaysData(null);
        setLoadingPlays(true);
        setErrorMessage(null);
        setPhase('loading-plays');
        setView('filter');

        try {
            const data = await gameService.getPlays(gamePk);
            setPlaysData(data);
            setLoadingPlays(false);
            setPhase('filtering');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } | string }; message?: string };
            const data = error.response?.data;
            const msg = (typeof data === 'object' ? data?.detail : data)
                || error.message
                || 'Failed to load game plays.';
            setErrorMessage(msg);
            setLoadingPlays(false);
            setPhase('error');
        }
    }, [games]);

    const handleFilterSubmit = useCallback((playIds: string[]) => {
        pendingPlayIdsRef.current = playIds;
        setClips([]);
        setStreamComplete(false);
        setErrorMessage(null);
        setPhase('streaming');
        setView('player');
    }, []);

    const handleBackToList = useCallback(() => {
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        setView('list');
        setPhase('idle');
        setSelectedGame(null);
        setPlaysData(null);
        setClips([]);
        setStreamComplete(false);
        setErrorMessage(null);
    }, []);

    const handleBackToFilters = useCallback(() => {
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        setClips([]);
        setStreamComplete(false);
        setErrorMessage(null);
        setPhase('filtering');
        setView('filter');
    }, []);

    const gameMatchup = selectedGame
        ? `${selectedGame.teams.away.name} @ ${selectedGame.teams.home.name}`
        : '';

    const filterTitle = selectedGame
        ? `Configure highlights for ${gameMatchup}`
        : '';

    const showPlaylist = (phase === 'streaming' || phase === 'stream-complete') && clips.length > 0;

    // Filter view
    if (view === 'filter') {
        return (
            <div className="flex flex-col items-center px-4 pt-6">
                <div className="w-full max-w-6xl">
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to games
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6">{filterTitle}</h2>

                    {loadingPlays ? (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 border-[3px] border-neutral-700 border-t-[#BF0D3E] rounded-full animate-spin" />
                        </div>
                    ) : phase === 'error' ? (
                        <RequestStatus phase="error" query={null} jobStatus="" errorMessage={errorMessage} />
                    ) : playsData ? (
                        <GameFilters
                            playsData={playsData}
                            onSubmit={handleFilterSubmit}
                            onBack={handleBackToList}
                            loading={false}
                        />
                    ) : null}
                </div>
            </div>
        );
    }

    // Player view
    if (view === 'player') {
        return (
            <div className="flex flex-col items-center px-4 pt-6">
                <div className="w-full max-w-6xl">
                    <button
                        onClick={handleBackToFilters}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to filters
                    </button>

                    <h2 className="text-2xl font-bold text-white mb-6">{gameMatchup}</h2>

                    {showPlaylist ? (
                        <VideoPlaylist clips={clips} streamComplete={streamComplete} />
                    ) : phase === 'error' ? (
                        <RequestStatus phase="error" query={null} jobStatus="" errorMessage={errorMessage} />
                    ) : (
                        <RequestStatus phase="streaming" query={null} jobStatus="streaming" errorMessage={null} />
                    )}
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className={`flex flex-col items-center px-4 transition-all duration-500 ease-in-out ${hasInteracted ? 'pt-6' : 'pt-[25vh]'}`}>
            <div className={`w-full transition-all duration-500 ease-in-out ${hasInteracted ? 'max-w-6xl mx-auto' : 'max-w-2xl'}`}>
                <main className={`transition-all duration-500 ease-in-out ${hasInteracted ? 'text-left' : 'text-center'}`}>
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${hasInteracted ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-40 mb-8'}`}>
                        <h2 className="text-4xl font-bold text-white mb-3">Game Highlights</h2>
                        <p className="text-lg text-gray-400">
                            Browse recent games and watch play-by-play highlights
                        </p>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className={`w-full px-5 py-4 bg-neutral-800/50 border text-left transition-all duration-200 text-lg cursor-pointer pr-12 ${
                                dropdownOpen
                                    ? 'rounded-t-lg border-[#BF0D3E]/50 border-b-neutral-700/50 ring-0'
                                    : 'rounded-lg border-neutral-700/50 hover:border-neutral-600'
                            } ${selectedTeam ? 'text-white' : 'text-neutral-500'}`}
                        >
                            {selectedTeam || 'Select a team...'}
                        </button>
                        <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {dropdownOpen && (
                            <ul className="absolute z-50 w-full max-h-72 overflow-y-auto rounded-b-lg border border-t-0 border-[#BF0D3E]/50 bg-neutral-900 shadow-xl shadow-black/40">
                                {MLB_TEAMS.map((team) => (
                                    <li key={team}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-3 text-sm transition-colors cursor-pointer ${
                                                team === selectedTeam
                                                    ? 'bg-[#BF0D3E]/15 text-white font-medium'
                                                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                            }`}
                                        >
                                            {team}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {loadingGames && (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 border-[3px] border-neutral-700 border-t-[#BF0D3E] rounded-full animate-spin" />
                        </div>
                    )}

                    {gamesError && (
                        <div className="flex flex-col items-center text-center py-12">
                            <p className="text-neutral-400 text-sm">{gamesError}</p>
                        </div>
                    )}

                    {!loadingGames && !gamesError && selectedTeam && games.length === 0 && (
                        <div className="flex flex-col items-center text-center py-12">
                            <p className="text-neutral-500">No recent games found for {selectedTeam}.</p>
                        </div>
                    )}

                    {games.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {games.map((game) => (
                                <GameCard key={game.game_pk} game={game} onClick={handleGameClick} highlightTeam={selectedTeam} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default GameSearch
