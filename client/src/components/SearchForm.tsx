import { type FC, useState } from 'react';
import InputBox from './InputBox.tsx';
import type { StreamResponse } from '../types/api.ts';
import { queryService } from '../api/queryService.ts';

interface SearchFormProps {
    onSubmitStart?: (query: string) => void;
    onResult?: (result: StreamResponse) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    hideHint?: boolean;
}

const SearchForm: FC<SearchFormProps> = ({ onSubmitStart, onResult, onError, disabled, hideHint }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        onSubmitStart?.(inputValue);
        setIsLoading(true);
        try {
            const result = await queryService.search(inputValue);
            onResult?.(result);
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
            <div className="w-full flex">
                <InputBox
                    placeholder='Aaron Judge home runs'
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
            {!hideHint && <p className="text-sm text-neutral-400">Supports natural language queries and Baseball Savant URLs</p>}
        </form>
    )
}

export default SearchForm;
