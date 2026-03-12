import { useState, useCallback, useEffect, useRef } from 'react'
import SearchForm from './SearchForm.tsx'
import VideoDisplay from './VideoDisplay.tsx'
import VideoPlaylist from './VideoPlaylist.tsx'
import RequestStatus from './RequestStatus.tsx'
import FilterDisplay from './FilterDisplay.tsx'
import type { StreamResponse, FilterDisplay as FilterDisplayType, VideoClip } from '../types/api.ts'
import { streamClipUrls } from '../api/sseService.ts'

export type Phase = 'idle' | 'submitting' | 'streaming' | 'stream-complete' | 'complete' | 'error';

interface MLBMergerProps {
    onPhaseChange?: (phase: Phase) => void;
}

const MLBMerger = ({ onPhaseChange }: MLBMergerProps) => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [query, setQuery] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string>('pending');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterDisplayType | null>(null);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

    // Streaming state
    const [clips, setClips] = useState<VideoClip[]>([]);
    const [streamComplete, setStreamComplete] = useState(false);

    const eventSourceRef = useRef<EventSource | null>(null);

    const handleSubmitStart = useCallback((submittedQuery: string) => {
        setPhase('submitting');
        setQuery(submittedQuery);
        setJobId(null);
        setVideoUrl(null);
        setJobStatus('pending');
        setErrorMessage(null);
        setFilters(null);
        setGeneratedUrl(null);
        setClips([]);
        setStreamComplete(false);
    }, []);

    const handleResult = useCallback((result: StreamResponse) => {
        if (result.filter_display) {
            setFilters(result.filter_display);
            setGeneratedUrl(result.generated_url ?? null);
        }
        if ('job_id' in result) {
            setJobId(result.job_id);
            setPhase('streaming');
        }
    }, []);

    const handleError = useCallback((error: string) => {
        setErrorMessage(error);
        setPhase('error');
    }, []);

    // Streaming phase: open SSE and accumulate clips
    useEffect(() => {
        if (phase !== 'streaming' || !jobId) return;

        const es = streamClipUrls(jobId, {
            onClip: (clip) => {
                setClips(prev => {
                    const updated = [...prev, clip];
                    updated.sort((a, b) => a.index - b.index);
                    return updated;
                });
            },
            onComplete: (total) => {
                setStreamComplete(true);
                if (total === 0) {
                    setErrorMessage('No video clips found for this query.');
                    setPhase('error');
                } else {
                    setPhase('stream-complete');
                }
            },
            onError: () => {
                setErrorMessage('Lost connection while loading clips.');
                setPhase('error');
            },
        });
        eventSourceRef.current = es;

        return () => {
            es.close();
        };
    }, [phase, jobId]);

    // Notify parent of phase changes
    useEffect(() => {
        onPhaseChange?.(phase);
    }, [phase, onPhaseChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            eventSourceRef.current?.close();
        };
    }, []);

    const isProcessing = phase === 'submitting';
    const showPlaylist = (phase === 'streaming' || phase === 'stream-complete') && clips.length > 0;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <SearchForm
                    onSubmitStart={handleSubmitStart}
                    onResult={handleResult}
                    onError={handleError}
                    disabled={isProcessing}
                    hideHint={phase !== 'idle'}
                />
            </div>
            {filters && (
                <FilterDisplay filters={filters} />
            )}
            {phase !== 'idle' && (
                <div>
                    {showPlaylist ? (
                        <VideoPlaylist
                            clips={clips}
                            streamComplete={streamComplete}
                            generatedUrl={generatedUrl}
                        />
                    ) : phase === 'complete' && videoUrl ? (
                        <VideoDisplay videoUrl={videoUrl} />
                    ) : phase === 'streaming' && clips.length === 0 ? (
                        <RequestStatus phase={phase} query={query} jobStatus="streaming" errorMessage={errorMessage} />
                    ) : phase !== 'stream-complete' ? (
                        <RequestStatus phase={phase} query={query} jobStatus={jobStatus} errorMessage={errorMessage} />
                    ) : null}
                </div>
            )}
        </div>
    )
};

export default MLBMerger;
