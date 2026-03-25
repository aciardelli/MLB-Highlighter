import { type FC } from 'react';
import type { FilterDisplay as FilterDisplayType } from '../types/api.ts';

const FILTER_LABELS: Record<string, string> = {
    players_lookup: 'Players',
    hfSea: 'Season',
    hfAB: 'Event',
    hfPT: 'Pitch Type',
    hfPR: 'Pitch Result',
    hfBBL: 'Batted Ball Location',
    hfC: 'Count',
    player_type: 'Player Type',
    pitcher_throws: 'Pitcher Throws',
    batter_stands: 'Batter Stands',
    game_date_gt: 'From Date',
    game_date_lt: 'To Date',
    hfTeam: 'Team',
    position: 'Position',
    hfInn: 'Inning',
    hfFlag: 'Flag',
    hfZ: 'Zone',
    hfNewZones: 'New Zones',
    hfOuts: 'Outs',
    home_road: 'Home/Road',
    hfInfield: 'Infield Alignment',
    hfBBT: 'Batted Ball Type',
    hfGT: 'Game Type',
    hfStadium: 'Stadium',
    hfPull: 'Pull Direction',
    hfSit: 'Situation',
    hfOpponent: 'Opponent',
    hfSA: 'Swing/Take',
    hfMo: 'Month',
    hfRO: 'Runners On',
    hfOutfield: 'Outfield Alignment',
};

interface FilterDisplayProps {
    filters: FilterDisplayType;
}

const FilterDisplay: FC<FilterDisplayProps> = ({ filters }) => {
    const entries = Object.entries(filters).filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    });

    if (entries.length === 0) return null;

    return (
        <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
            <div className="flex flex-wrap gap-2">
                {entries.map(([key, value]) => {
                    const label = FILTER_LABELS[key] ?? key;
                    const values = Array.isArray(value) ? value : [value];
                    return (
                        <div
                            key={key}
                            className="flex flex-col gap-0.5 px-3 py-1.5 bg-neutral-700/30 border border-neutral-700/50 rounded-md"
                        >
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider leading-tight">
                                {label}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {values.map((v, i) => (
                                    <span
                                        key={i}
                                        className="text-sm text-neutral-200"
                                    >
                                        {v}{i < values.length - 1 ? ',' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterDisplay;
