import { ENDPOINTS } from './endpoints';
import type { VideoClip } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SSEStatusUpdate {
    status: string;
    video_url: string | null;
    error_message: string | null;
}

export interface SSECallbacks {
    onUpdate: (update: SSEStatusUpdate) => void;
    onError: (error: Event) => void;
}

export interface ClipSSECallbacks {
    onClip: (clip: VideoClip) => void;
    onComplete: (total: number) => void;
    onError: (error: Event) => void;
}

export function streamJobStatus(jobId: string, callbacks: SSECallbacks): EventSource {
    const url = `${API_BASE_URL}${ENDPOINTS.STREAM_JOB_STATUS}${jobId}/stream`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        const update: SSEStatusUpdate = JSON.parse(event.data);
        callbacks.onUpdate(update);

        if (update.status === 'complete' || update.status === 'failed') {
            eventSource.close();
        }
    };

    eventSource.onerror = (event) => {
        eventSource.close();
        callbacks.onError(event);
    };

    return eventSource;
}

export function streamClipUrls(jobId: string, callbacks: ClipSSECallbacks): EventSource {
    const url = `${API_BASE_URL}${ENDPOINTS.STREAM_JOB_STATUS}${jobId}/stream`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('video_url', (event) => {
        const data = JSON.parse(event.data);
        const clip: VideoClip = {
            url: data.url,
            index: data.index,
            metadata: data.metadata,
        };
        callbacks.onClip(clip);
    });

    eventSource.addEventListener('complete', (event) => {
        const data = JSON.parse(event.data);
        callbacks.onComplete(data.total);
        eventSource.close();
    });

    // Also handle legacy status messages (e.g. failed)
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'failed') {
            eventSource.close();
            callbacks.onError(new Event('failed'));
        }
    };

    eventSource.onerror = (event) => {
        eventSource.close();
        callbacks.onError(event);
    };

    return eventSource;
}
