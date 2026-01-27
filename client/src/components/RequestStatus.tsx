import { type FC } from 'react';

type Phase = 'idle' | 'submitting' | 'polling' | 'complete' | 'error';

interface RequestStatusProps {
    phase: Phase;
    query: string | null;
    jobStatus: string;
    errorMessage: string | null;
}

const STATUS_MAPPING: Record<string, string> = {
    pending: "Processing request...",
    parsing: "Parsing Baseball Savant...",
    downloading: "Downloading videos...",
    merging: "Merging videos...",
    processing: "Processing request...",
    complete: "Request complete!",
    failed: "Something went wrong"
};

const RequestStatus: FC<RequestStatusProps> = ({ phase, query, jobStatus, errorMessage }) => {
    if (phase === 'error') {
        return (
            <div className="flex flex-col items-center text-center py-12">
                <div className="w-12 h-12 rounded-full bg-[#BF0D3E]/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#BF0D3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
                <p className="text-neutral-400 text-sm max-w-md">{errorMessage || 'Unable to process your request. Please try again.'}</p>
            </div>
        );
    }

    const getStatusMessage = () => {
        if (phase === 'submitting') {
            return "Submitting your request...";
        }
        return STATUS_MAPPING[jobStatus] || "Processing request...";
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-[3px] border-neutral-700 border-t-[#BF0D3E] rounded-full animate-spin"></div>
            {query && (
                <p className="mt-5 text-neutral-500 text-sm italic max-w-md truncate">"{query}"</p>
            )}
            <p className="mt-2 text-neutral-300">{getStatusMessage()}</p>
        </div>
    );
};

export default RequestStatus;
