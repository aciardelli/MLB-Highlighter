import { useState, useCallback, useEffect, useRef } from 'react'
import SearchForm from './SearchForm.tsx'
import VideoDisplay from './VideoDisplay.tsx'
import RequestStatus from './RequestStatus.tsx'
import type { ProcessQueryResponse, MergeQueryResponse, MergeUrlResponse } from '../types/api.ts'
import { queryService } from '../api/queryService.ts'

type Phase = 'idle' | 'submitting' | 'polling' | 'complete' | 'error';

const MLBMerger = () => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [query, setQuery] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string>('pending');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSubmitStart = useCallback((submittedQuery: string) => {
        setPhase('submitting');
        setQuery(submittedQuery);
        setJobId(null);
        setVideoUrl(null);
        setJobStatus('pending');
        setErrorMessage(null);
    }, []);

    const handleResult = useCallback((result: ProcessQueryResponse | MergeQueryResponse | MergeUrlResponse) => {
        if (result && 'job_id' in result) {
            setJobId(result.job_id);
            setPhase('polling');
        }
    }, []);

    const handleError = useCallback((error: string) => {
        setErrorMessage(error);
        setPhase('error');
    }, []);

    // Polling logic
    useEffect(() => {
        if (phase !== 'polling' || !jobId) return;

        const startTime = Date.now();
        const MAX_POLLING_TIME = 60000;
        const POLLING_INTERVAL = 2000;

        const pollStatus = async () => {
            if (Date.now() - startTime > MAX_POLLING_TIME) {
                setErrorMessage('Request timed out. Please try again.');
                setPhase('error');
                return;
            }

            try {
                const result = await queryService.getJobStatus(jobId);

                if (result.status === 'complete') {
                    setVideoUrl('/api/video/stream/' + jobId);
                    setPhase('complete');
                } else if (result.status === 'failed') {
                    setErrorMessage(result.error_message || 'Job processing failed.');
                    setPhase('error');
                } else {
                    setJobStatus(result.status);
                    pollingRef.current = setTimeout(pollStatus, POLLING_INTERVAL);
                }
            } catch (err) {
                setErrorMessage(err instanceof Error ? err.message : 'Failed to check job status.');
                setPhase('error');
            }
        };

        pollStatus();

        return () => {
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
            }
        };
    }, [phase, jobId]);

    const isProcessing = phase === 'submitting' || phase === 'polling';

    return (
        <div className="flex justify-center flex-col gap-6">
            <div>
                <SearchForm
                    onSubmitStart={handleSubmitStart}
                    onResult={handleResult}
                    onError={handleError}
                    disabled={isProcessing}
                />
            </div>
            {phase !== 'idle' && (
                <div>
                    {phase === 'complete' && videoUrl ? (
                        <VideoDisplay videoUrl={videoUrl} />
                    ) : (
                        <RequestStatus phase={phase} query={query} jobStatus={jobStatus} errorMessage={errorMessage} />
                    )}
                </div>
            )}
        </div>
    )
};

export default MLBMerger;
