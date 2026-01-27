import { type FC, useState } from 'react';

interface ToggleSwitchProps {
    onToggle: (mode: 'url' | 'natural') => void;
    initialMode?: 'url' | 'natural';
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ onToggle, initialMode="url" }) => {
    const [activeMode, setActiveMode] = useState<'url' | 'natural'>(initialMode);

    const handleToggle = (mode: 'url' | 'natural') => {
        setActiveMode(mode);
        onToggle(mode);
    }

    return (
        <div className="inline-flex rounded-lg p-1 bg-neutral-800/50">
            <button
                type="button"
                onClick={() => handleToggle('natural')}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeMode === 'natural'
                        ? 'bg-[#BF0D3E] text-white shadow-lg'
                        : 'text-neutral-400 hover:text-white'
                }`}>
                Natural Language
            </button>
            <button
                type="button"
                onClick={() => handleToggle('url')}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeMode === 'url'
                        ? 'bg-[#BF0D3E] text-white shadow-lg'
                        : 'text-neutral-400 hover:text-white'
                }`}>
                URL
            </button>
        </div>
    )
}

export default ToggleSwitch;
