import { type FC, useState, useEffect } from 'react';
import { queryService } from '../api/queryService.ts';

interface VideoDisplayProps {
    jobId: string;
}

const VideoDisplay: FC<VideoDisplayProps> = ({ jobId }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        const startTime = Date.now();
        const MAX_POLLING_TIME = 60000; // 60s 
        const POLLING_INTERVAL = 2000; // 2s 
        const pollStatus = async () => {
            if (Date.now() - startTime > MAX_POLLING_TIME) {
                setStatus('error');
                return;
            }
            try {
                // poll /status/{job_id}
                const result = await queryService.getJobStatus(jobId);

                if (result.status === 'complete') {
                    setVideoUrl('/video/stream/' + jobId);
                    setStatus('ready');
                } else if (result.status === 'failed') {
                    setStatus('error');
                } else {
                    setTimeout(pollStatus, POLLING_INTERVAL);
                }
            } catch {
                setStatus('error');
            }
        };
        pollStatus();
    }, [jobId]);

    if (status == 'loading') {
        return <div>Processing video...</div>
    }

    if (status == 'error') {
        return <div>Something went wrong</div>
    }

    return (
        <video controls width="100%">
            <source src={videoUrl!} type="video/mp4" />
        </video>
    )
}

export default VideoDisplay;
