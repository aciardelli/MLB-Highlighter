import { type FC, useState } from 'react';
import InputBox from './InputBox.tsx';
import ToggleSwitch from './ToggleSwitch.tsx';
import type { ProcessQueryResponse, MergeQueryResponse, MergeUrlResponse } from '../types/api.ts';
import { queryService } from '../api/queryService.ts';

interface SearchFormProps {
    onResult?: (result: ProcessQueryResponse | MergeQueryResponse | MergeUrlResponse) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
}

const SearchForm: FC<SearchFormProps> = ({ onResult, onError, disabled }) => {
    const [inputMode, setInputMode] = useState<'url' | 'natural'>('url');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const [result, setResult] = useState<ProcessQueryResponse | null>(null)

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

        setIsLoading(true);
        try {
            const result = inputMode === 'url' 
                ? await queryService.mergeFromUrl(inputValue)
                : await queryService.mergeFromQuery(inputValue);
            
            onResult?.(result);
            setResult(result);
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
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
            <ToggleSwitch
                onToggle={handleModeChange}
                initialMode={inputMode}
            />
            <InputBox
                placeholder={getPlaceholder()}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            {/* 
            {result && 'filters' in result && (
                <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(result.filters, null, 2)}
                </pre>
            )}
            */}
            <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || disabled}
                className="px-6 py-3 bg-[#BF0D3E] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#A00B36] transition-colors duration-200"
            >
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    )
}

export default SearchForm;
