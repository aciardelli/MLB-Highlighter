import { type FC, useState, useEffect } from 'react';
import { queryService } from '../api/queryService.ts';
import StatusUpdate from './StatusUpdate.tsx';

interface VideoDisplayProps {
    jobId: string;
    onComplete?: () => void;
}

const VideoDisplay: FC<VideoDisplayProps> = ({ jobId, onComplete }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [serverStatus, setServerStatus] = useState<string>('pending');

    const STATUS_MAPPING: Record<string, string> = {
        pending: "Processing request...",
        parsing: "Parsing Baseball Savant...",
        downloading: "Downloading videos...",
        merging: "Merging videos...",
        processing: "Processing request...",
        complete: "Request complete!",
        failed: "Something went wrong"
    }

    useEffect(() => {
        const startTime = Date.now();
        const MAX_POLLING_TIME = 60000; // 60s 
        const POLLING_INTERVAL = 2000; // 2s 
        const pollStatus = async () => {
            if (Date.now() - startTime > MAX_POLLING_TIME) {
                setStatus('error');
                onComplete?.();
                return;
            }
            try {
                // poll /status/{job_id}
                const result = await queryService.getJobStatus(jobId);

                if (result.status === 'complete') {
                    setVideoUrl('/video/stream/' + jobId);
                    setStatus('ready');
                    onComplete?.();
                } else if (result.status === 'failed') {
                    setStatus('error');
                    onComplete?.();
                } else {
                    setServerStatus(STATUS_MAPPING[result.status]);
                    setTimeout(pollStatus, POLLING_INTERVAL);
                }
            } catch {
                setStatus('error');
                onComplete?.();
            }
        };
        pollStatus();
    }, [jobId, onComplete]);

    if (status == 'loading') {
        return (
            <StatusUpdate status={serverStatus} />
        )
    }

    if (status == 'error') {
        return <div>Something went wrong</div>
    }

    return (
        <div>
            <video controls width="100%">
                <source src={videoUrl!} type="video/mp4" />
            </video>
        </div>
    )
}

export default VideoDisplay;
