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
<div className="w-1/2 mx-auto bg-stone-100 rounded-lg p-1">
      <button
        onClick={() => handleToggle('url')}
        className={`px-4 py-2 rounded-md transition ${
          activeMode === 'url'
            ? 'bg-[#BF0D3E] text-white'
            : 'text-gray-600 hover:text-gray-800'
        }`}>
        URL
      </button>
      <button
        onClick={() => handleToggle('natural')}
        className={`px-4 py-2 rounded-md transition ${
          activeMode === 'natural'
            ? 'bg-[#BF0D3E] text-white'
            : 'text-gray-600 hover:text-gray-800'
        }`}>
        Natural Language
      </button>
    </div>
    )
}

export default ToggleSwitch;
