import { useState, useMemo, useCallback } from 'react';
import type { GamePlaysResponse, Play, PlayPlayer } from '../types/api';

interface GameFiltersProps {
    playsData: GamePlaysResponse;
    onSubmit: (playIds: string[]) => void;
    onBack: () => void;
    loading: boolean;
}

interface TeamPlayers {
    batters: PlayPlayer[];
    pitchers: PlayPlayer[];
}

function getTeamPlayers(plays: Play[], teamId: number): TeamPlayers {
    const batterMap = new Map<number, PlayPlayer>();
    const pitcherMap = new Map<number, PlayPlayer>();
    for (const play of plays) {
        if (play.batting_team_id === teamId) {
            batterMap.set(play.batter.id, play.batter);
        } else {
            pitcherMap.set(play.pitcher.id, play.pitcher);
        }
    }
    return {
        batters: Array.from(batterMap.values()),
        pitchers: Array.from(pitcherMap.values()),
    };
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex items-center gap-2 py-1 px-1 rounded hover:bg-neutral-700/30 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-[#BF0D3E] focus:ring-[#BF0D3E] focus:ring-offset-0 accent-[#BF0D3E] cursor-pointer"
            />
            <span className="text-sm text-neutral-200 truncate">{label}</span>
        </label>
    );
}

function SelectAllButton({ allSelected, onToggle }: { allSelected: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className="text-xs text-[#BF0D3E] hover:text-[#e0325a] transition-colors cursor-pointer"
        >
            {allSelected ? 'Deselect all' : 'Select all'}
        </button>
    );
}

export default function GameFilters({ playsData, onSubmit, onBack, loading }: GameFiltersProps) {
    const { plays, away_team, home_team } = playsData;

    // All IDs for toggle-all logic
    const allBatterIds = useMemo(() => new Set(plays.map(p => p.batter.id)), [plays]);
    const allPitcherIds = useMemo(() => new Set(plays.map(p => p.pitcher.id)), [plays]);
    const allEvents = useMemo(() => new Set(plays.map(p => p.event)), [plays]);

    const [selectedBatterIds, setSelectedBatterIds] = useState<Set<number>>(() => new Set(allBatterIds));
    const [selectedPitcherIds, setSelectedPitcherIds] = useState<Set<number>>(() => new Set(allPitcherIds));
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(() => new Set(allEvents));

    // Players grouped by team
    const awayPlayers = useMemo(() => getTeamPlayers(plays, away_team.id), [plays, away_team.id]);
    const homePlayers = useMemo(() => getTeamPlayers(plays, home_team.id), [plays, home_team.id]);

    // Per-team "all selected" checks
    const awayPlayerIds = useMemo(() => {
        const ids = { batters: new Set(awayPlayers.batters.map(p => p.id)), pitchers: new Set(awayPlayers.pitchers.map(p => p.id)) };
        return ids;
    }, [awayPlayers]);
    const homePlayerIds = useMemo(() => {
        const ids = { batters: new Set(homePlayers.batters.map(p => p.id)), pitchers: new Set(homePlayers.pitchers.map(p => p.id)) };
        return ids;
    }, [homePlayers]);

    const groupedEvents = useMemo(() => {
        const EVENT_CATEGORIES: [string, string[]][] = [
            ['Hits', ['Single', 'Double', 'Triple', 'Home Run']],
            ['Outs', ['Strikeout', 'Groundout', 'Flyout', 'Lineout', 'Pop Out', 'Forceout', 'Force Out',
                      'Fielders Choice', 'Fielders Choice Out', 'Field Out', 'Double Play',
                      'Grounded Into DP', 'Triple Play', 'Sac Fly', 'Sac Bunt', 'Sac Fly Double Play',
                      'Sacrifice Bunt DP', 'Bunt Groundout', 'Bunt Pop Out', 'Bunt Lineout']],
            ['Walks & HBP', ['Walk', 'Intent Walk', 'Hit By Pitch']],
            ['Baserunning', ['Stolen Base', 'Caught Stealing', 'Pickoff',
                             'Caught Stealing 2B', 'Caught Stealing 3B', 'Caught Stealing Home',
                             'Pickoff 1B', 'Pickoff 2B', 'Pickoff 3B',
                             'Pickoff Caught Stealing 2B', 'Pickoff Caught Stealing 3B', 'Pickoff Caught Stealing Home',
                             'Runner Out', 'Balk', 'Wild Pitch', 'Passed Ball']],
            ['Errors & Other', ['Field Error', 'Error', 'Catcher Interference',
                                'Fan Interference', 'Runner Interference']],
        ];

        const categorized = new Set<string>();
        const groups: { label: string; events: string[] }[] = [];

        for (const [label, members] of EVENT_CATEGORIES) {
            const matched = members.filter(e => allEvents.has(e));
            if (matched.length > 0) {
                groups.push({ label, events: matched });
                matched.forEach(e => categorized.add(e));
            }
        }

        const uncategorized = Array.from(allEvents).filter(e => !categorized.has(e)).sort();
        if (uncategorized.length > 0) {
            const otherGroup = groups.find(g => g.label === 'Errors & Other');
            if (otherGroup) {
                otherGroup.events.push(...uncategorized);
            } else {
                groups.push({ label: 'Other', events: uncategorized });
            }
        }

        return groups;
    }, [allEvents]);

    // Filtered plays
    const filteredPlays = useMemo(() =>
        plays.filter(p =>
            (selectedBatterIds.has(p.batter.id) || selectedPitcherIds.has(p.pitcher.id))
            && selectedEvents.has(p.event)
        ),
        [plays, selectedBatterIds, selectedPitcherIds, selectedEvents]
    );

    const toggleSet = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
        setter(prev => {
            const next = new Set(prev);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return next;
        });
    }, []);

    const toggleAllInSet = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, ids: Set<T>) => {
        setter(prev => {
            const allSelected = Array.from(ids).every(id => prev.has(id));
            const next = new Set(prev);
            if (allSelected) {
                for (const id of ids) next.delete(id);
            } else {
                for (const id of ids) next.add(id);
            }
            return next;
        });
    }, []);

    const isTeamAllSelected = (teamPlayerIds: { batters: Set<number>; pitchers: Set<number> }) => {
        return Array.from(teamPlayerIds.batters).every(id => selectedBatterIds.has(id))
            && Array.from(teamPlayerIds.pitchers).every(id => selectedPitcherIds.has(id));
    };

    const toggleTeamAll = (teamPlayerIds: { batters: Set<number>; pitchers: Set<number> }) => {
        const allSelected = isTeamAllSelected(teamPlayerIds);
        setSelectedBatterIds(prev => {
            const next = new Set(prev);
            for (const id of teamPlayerIds.batters) allSelected ? next.delete(id) : next.add(id);
            return next;
        });
        setSelectedPitcherIds(prev => {
            const next = new Set(prev);
            for (const id of teamPlayerIds.pitchers) allSelected ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAllEvents = useCallback(() => {
        setSelectedEvents(prev => prev.size === allEvents.size ? new Set() : new Set(allEvents));
    }, [allEvents]);

    const selectScoringPlays = useCallback(() => {
        const scoring = plays.filter(p => p.is_scoring_play);
        setSelectedBatterIds(new Set(scoring.map(p => p.batter.id)));
        setSelectedPitcherIds(new Set(scoring.map(p => p.pitcher.id)));
        setSelectedEvents(new Set(scoring.map(p => p.event)));
    }, [plays]);

    const handleSubmit = () => {
        onSubmit(filteredPlays.map(p => p.play_id));
    };

    const scoringCount = useMemo(() => plays.filter(p => p.is_scoring_play).length, [plays]);

    const renderTeamCard = (
        teamName: string,
        players: TeamPlayers,
        teamPlayerIds: { batters: Set<number>; pitchers: Set<number> },
    ) => (
        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{teamName}</h3>
                <SelectAllButton
                    allSelected={isTeamAllSelected(teamPlayerIds)}
                    onToggle={() => toggleTeamAll(teamPlayerIds)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Batters</h4>
                    <div className="space-y-0.5">
                        {players.batters.map(player => (
                            <CheckboxItem
                                key={player.id}
                                label={player.name}
                                checked={selectedBatterIds.has(player.id)}
                                onChange={() => toggleSet(setSelectedBatterIds, player.id)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Pitchers</h4>
                    <div className="space-y-0.5">
                        {players.pitchers.map(player => (
                            <CheckboxItem
                                key={player.id}
                                label={player.name}
                                checked={selectedPitcherIds.has(player.id)}
                                onChange={() => toggleSet(setSelectedPitcherIds, player.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Scoring plays quick-filter */}
            <button
                onClick={selectScoringPlays}
                className="w-full mb-4 py-3 px-4 bg-[#BF0D3E]/10 border border-[#BF0D3E]/30 rounded-xl text-sm font-medium text-[#BF0D3E] hover:bg-[#BF0D3E]/20 hover:border-[#BF0D3E]/50 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Scoring Plays Only ({scoringCount})
            </button>

            {/* Team columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTeamCard(away_team.name, awayPlayers, awayPlayerIds)}
                {renderTeamCard(home_team.name, homePlayers, homePlayerIds)}
            </div>

            {/* Events — grouped horizontally below teams */}
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Events</h3>
                    <SelectAllButton allSelected={selectedEvents.size === allEvents.size} onToggle={toggleAllEvents} />
                </div>
                <div className="space-y-3">
                    {groupedEvents.map(group => (
                        <div key={group.label}>
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{group.label}</h4>
                            <div className="flex flex-wrap gap-2">
                                {group.events.map(event => (
                                    <label
                                        key={event}
                                        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer select-none transition-colors ${
                                            selectedEvents.has(event)
                                                ? 'bg-[#BF0D3E]/15 border border-[#BF0D3E]/40'
                                                : 'bg-neutral-700/30 border border-neutral-700/50 hover:bg-neutral-700/50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEvents.has(event)}
                                            onChange={() => toggleSet(setSelectedEvents, event)}
                                            className="w-3.5 h-3.5 rounded border-neutral-600 bg-neutral-700 text-[#BF0D3E] focus:ring-[#BF0D3E] focus:ring-offset-0 accent-[#BF0D3E] cursor-pointer"
                                        />
                                        <span className="text-sm text-neutral-200">{event}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 mt-4 py-4 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-700/50 -mx-4 px-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                    {filteredPlays.length} of {plays.length} plays selected
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Back to games
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={filteredPlays.length === 0 || loading}
                        className="px-5 py-2 bg-[#BF0D3E] hover:bg-[#a00b35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                        {loading ? 'Loading...' : `Watch Highlights (${filteredPlays.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
}
