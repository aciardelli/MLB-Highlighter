import { type FC, useState } from 'react';
import InputBox from './InputBox.tsx';
import ToggleSwitch from './ToggleSwitch.tsx';
import type { ProcessQueryResponse, MergeQueryResponse, MergeUrlResponse } from '../types/api.ts';
import { queryService } from '../api/queryService.ts';

interface SearchFormProps {
    onSubmitStart?: (query: string) => void;
    onResult?: (result: ProcessQueryResponse | MergeQueryResponse | MergeUrlResponse) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
}

const SearchForm: FC<SearchFormProps> = ({ onSubmitStart, onResult, onError, disabled }) => {
    const [inputMode, setInputMode] = useState<'url' | 'natural'>('natural');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleModeChange = (mode: 'url' | 'natural') => {
        setInputMode(mode);
        setInputValue('');
    };

    const getPlaceholder = () => {
        return inputMode === 'url'
        ? 'Enter a URL (e.g., https://baseballsavant.mlb.com/...)'
        : 'Describe what you\'re looking for (e.g., "Aaron Judge home runs")';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        onSubmitStart?.(inputValue);
        setIsLoading(true);
        try {
            const result = inputMode === 'url' 
                ? await queryService.mergeFromUrl(inputValue)
                : await queryService.mergeFromQuery(inputValue);
            
            onResult?.(result);
            console.log('API Result:', result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('API Error:', error);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-6">
            <ToggleSwitch
                onToggle={handleModeChange}
                initialMode={inputMode}
            />
            <div className="w-full flex">
                <InputBox
                    placeholder={getPlaceholder()}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 rounded-r-none border-r-0"
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim() || disabled}
                    className="px-8 py-3 bg-[#BF0D3E] text-white font-medium rounded-l-none rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#a30c35] transition-all duration-200 text-lg"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </form>
    )
}

export default SearchForm;
