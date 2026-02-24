import { useState, useCallback, useEffect, useRef } from 'react'
import SearchForm from './SearchForm.tsx'
import VideoDisplay from './VideoDisplay.tsx'
import VideoPlaylist from './VideoPlaylist.tsx'
import RequestStatus from './RequestStatus.tsx'
import FilterDisplay from './FilterDisplay.tsx'
import type { StreamQueryResponse, StreamUrlResponse, FilterDisplay as FilterDisplayType, VideoClip } from '../types/api.ts'
import { queryService } from '../api/queryService.ts'
import { streamJobStatus, streamClipUrls } from '../api/sseService.ts'

type Phase = 'idle' | 'submitting' | 'streaming' | 'stream-complete' | 'complete' | 'error';

const MLBMerger = () => {
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
    const [isDownloading, setIsDownloading] = useState(false);

    const eventSourceRef = useRef<EventSource | null>(null);
    const downloadEventSourceRef = useRef<EventSource | null>(null);

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
        setIsDownloading(false);
    }, []);

    const handleResult = useCallback((result: StreamQueryResponse | StreamUrlResponse) => {
        if ('filter_display' in result) {
            setFilters(result.filter_display);
            setGeneratedUrl(result.generated_url);
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

    // Download handler: merge on server, then download file
    const handleDownload = useCallback(async () => {
        if (!jobId || isDownloading) return;

        setIsDownloading(true);
        try {
            const result = await queryService.downloadJob(jobId);

            const es = streamJobStatus(result.download_job_id, {
                onUpdate: (update) => {
                    if (update.status === 'complete') {
                        const downloadUrl = `/api/video/download/merged/${result.download_job_id}`;
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = 'merged_video.mp4';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setIsDownloading(false);
                    } else if (update.status === 'failed') {
                        setIsDownloading(false);
                    }
                },
                onError: () => {
                    setIsDownloading(false);
                },
            });

            downloadEventSourceRef.current = es;
        } catch {
            setIsDownloading(false);
        }
    }, [jobId, isDownloading]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            eventSourceRef.current?.close();
            downloadEventSourceRef.current?.close();
        };
    }, []);

    const isProcessing = phase === 'submitting';
    const showPlaylist = (phase === 'streaming' || phase === 'stream-complete') && clips.length > 0;

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
                    {showPlaylist ? (
                        <VideoPlaylist
                            clips={clips}
                            streamComplete={streamComplete}
                            onDownload={handleDownload}
                            isDownloading={isDownloading}
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
