import { useState, useCallback, useEffect, useRef } from 'react'
import SearchForm from './SearchForm.tsx'
import VideoDisplay from './VideoDisplay.tsx'
import RequestStatus from './RequestStatus.tsx'
import FilterDisplay from './FilterDisplay.tsx'
import type { ProcessQueryResponse, MergeQueryResponse, MergeUrlResponse, FilterDisplay as FilterDisplayType } from '../types/api.ts'
import { queryService } from '../api/queryService.ts'
import { streamJobStatus } from '../api/sseService.ts'

type Phase = 'idle' | 'submitting' | 'polling' | 'complete' | 'error';

const MLBMerger = () => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [query, setQuery] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string>('pending');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterDisplayType | null>(null);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const usingPollingRef = useRef(false);

    const handleSubmitStart = useCallback((submittedQuery: string) => {
        setPhase('submitting');
        setQuery(submittedQuery);
        setJobId(null);
        setVideoUrl(null);
        setJobStatus('pending');
        setErrorMessage(null);
        setFilters(null);
        setGeneratedUrl(null);
        usingPollingRef.current = false;
    }, []);

    const handleResult = useCallback((result: ProcessQueryResponse | MergeQueryResponse | MergeUrlResponse) => {
        if ('filter_display' in result) {
            setFilters(result.filter_display);
            setGeneratedUrl(result.generated_url);
        }
        if ('job_id' in result) {
            setJobId(result.job_id);
            setPhase('polling');
        }
    }, []);

    const handleError = useCallback((error: string) => {
        setErrorMessage(error);
        setPhase('error');
    }, []);

    // utilize sse but want to fallback to polling if needed
    useEffect(() => {
        if (phase !== 'polling' || !jobId) return;

        // sse
        if (!usingPollingRef.current) {
            const es = streamJobStatus(jobId, {
                onUpdate: (update) => {
                    if (update.status === 'complete') {
                        setVideoUrl('/api/video/stream/' + jobId);
                        setPhase('complete');
                    } else if (update.status === 'failed') {
                        setErrorMessage(update.error_message || 'Job processing failed.');
                        setPhase('error');
                    } else {
                        setJobStatus(update.status);
                    }
                },
                onError: () => {
                    usingPollingRef.current = true;
                    startPolling(jobId);
                },
            });
            eventSourceRef.current = es;

            return () => {
                es.close();
            };
        }

        // polling fallback
        startPolling(jobId);

        return () => {
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
            }
        };
    }, [phase, jobId]);

    function startPolling(id: string) {
        const startTime = Date.now();
        const MAX_POLLING_TIME = 120000;
        const POLLING_INTERVAL = 2000;

        const pollStatus = async () => {
            if (Date.now() - startTime > MAX_POLLING_TIME) {
                setErrorMessage('Request timed out. Please try again.');
                setPhase('error');
                return;
            }

            try {
                const result = await queryService.getJobStatus(id);

                if (result.status === 'complete') {
                    setVideoUrl('/api/video/stream/' + id);
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
    }

    useEffect(() => {
        return () => {
            eventSourceRef.current?.close();
            if (pollingRef.current) clearTimeout(pollingRef.current);
        };
    }, []);

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
            {filters && (
                <FilterDisplay filters={filters} generatedUrl={generatedUrl} />
            )}
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
