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
    generatedUrl?: string | null;
}

const FilterDisplay: FC<FilterDisplayProps> = ({ filters, generatedUrl }) => {
    const entries = Object.entries(filters).filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    });

    if (entries.length === 0 && !generatedUrl) return null;

    const renderValue = (value: string | string[]) => {
        const values = Array.isArray(value) ? value : [value];
        return values.map((v, i) => (
            <span
                key={i}
                className="inline-block px-3 py-0.5 text-sm bg-[#BF0D3E]/15 text-[#BF0D3E] border border-[#BF0D3E]/20 rounded-full"
            >
                {v}
            </span>
        ));
    };

    return (
        <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-4">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">{FILTER_LABELS[key] ?? key}</span>
                        <div className="flex flex-wrap gap-1">
                            {renderValue(value)}
                        </div>
                    </div>
                ))}
            </div>
            {generatedUrl && (
                <div className="mt-3 pt-3 border-t border-neutral-700/50">
                    <a
                        href={generatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#BF0D3E] hover:text-[#a30c35] transition-colors duration-200"
                    >
                        View on Baseball Savant &rarr;
                    </a>
                </div>
            )}
        </div>
    );
};

export default FilterDisplay;
