import { useState, useCallback } from 'react'
import SearchForm from './SearchForm.tsx'
import VideoDisplay from './VideoDisplay.tsx'
import type { ProcessQueryResponse, MergeQueryResponse, MergeUrlResponse } from '../types/api.ts'

const MLBMerger = () => {
    const [jobId, setJobId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleResult = (result: ProcessQueryResponse | MergeQueryResponse | MergeUrlResponse) => {
        if (result && 'job_id' in result) {
            setJobId(result.job_id);
            setIsProcessing(true);
        };
    };

    const handleVideoComplete = useCallback(() => {
        setIsProcessing(false);
    }, []);

    return (
      <div className="flex justify-center flex-col">
        <SearchForm onResult={handleResult} disabled={isProcessing}/>
        {jobId && <VideoDisplay key={jobId} jobId={jobId} onComplete={handleVideoComplete}/>}
      </div>
    )
};

export default MLBMerger;
