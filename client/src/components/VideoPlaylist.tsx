import { type FC, useRef, useState, useEffect, useCallback } from 'react';
import type { VideoClip } from '../types/api';

interface VideoPlaylistProps {
    clips: VideoClip[];
    streamComplete: boolean;
    onDownload?: () => void;
    isDownloading?: boolean;
}

const VideoPlaylist: FC<VideoPlaylistProps> = ({ clips, streamComplete, onDownload, isDownloading }) => {
    const videoARef = useRef<HTMLVideoElement>(null);
    const videoBRef = useRef<HTMLVideoElement>(null);
    const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    const getActiveVideo = useCallback(() => {
        return activePlayer === 'A' ? videoARef.current : videoBRef.current;
    }, [activePlayer]);

    const getInactiveVideo = useCallback(() => {
        return activePlayer === 'A' ? videoBRef.current : videoARef.current;
    }, [activePlayer]);

    // Preload the next clip into the inactive player
    const preloadNext = useCallback((nextIdx: number) => {
        const inactiveVideo = getInactiveVideo();
        if (inactiveVideo && nextIdx < clips.length) {
            inactiveVideo.src = clips[nextIdx].url;
            inactiveVideo.load();
        }
    }, [clips, getInactiveVideo]);

    // Start playback when first clip arrives
    useEffect(() => {
        if (clips.length > 0 && !hasStarted) {
            const videoA = videoARef.current;
            if (videoA) {
                videoA.src = clips[0].url;
                videoA.load();
                videoA.play().catch(() => {});
                setHasStarted(true);
            }
        }
    }, [clips, hasStarted]);

    // Preload next clip when current index or clips change
    useEffect(() => {
        if (hasStarted && currentIndex + 1 < clips.length) {
            preloadNext(currentIndex + 1);
        }
    }, [currentIndex, clips.length, hasStarted, preloadNext]);

    // Handle clip ending — swap to next
    const handleEnded = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
        const activeVideo = getActiveVideo();
        if (e.currentTarget !== activeVideo) return; // ignore background player

        const nextIndex = currentIndex + 1;
        if (nextIndex >= clips.length) {
            return;
        }

        const inactiveVideo = getInactiveVideo();
        if (inactiveVideo) {
            inactiveVideo.play().catch(() => {});
        }

        setActivePlayer(prev => prev === 'A' ? 'B' : 'A');
        setCurrentIndex(nextIndex);
    }, [currentIndex, clips.length, getInactiveVideo, getActiveVideo]);

    // Skip to a specific clip index
    const skipTo = useCallback((targetIndex: number) => {
        if (targetIndex < 0 || targetIndex >= clips.length) return;

        const activeVideo = getActiveVideo();
        if (activeVideo) {
            activeVideo.src = clips[targetIndex].url;
            activeVideo.load();
            activeVideo.play().catch(() => {});
        }
        setCurrentIndex(targetIndex);
    }, [clips, getActiveVideo]);

    const handlePrev = () => skipTo(currentIndex - 1);
    const handleNext = () => skipTo(currentIndex + 1);

    if (clips.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Video container */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video
                    ref={videoARef}
                    onEnded={handleEnded}
                    controls={activePlayer === 'A'}
                    className={`absolute inset-0 w-full h-full ${activePlayer === 'A' ? 'z-10' : 'z-0'}`}
                    playsInline
                />
                <video
                    ref={videoBRef}
                    onEnded={handleEnded}
                    controls={activePlayer === 'B'}
                    className={`absolute inset-0 w-full h-full ${activePlayer === 'B' ? 'z-10' : 'z-0'}`}
                    playsInline
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Previous */}
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700/50 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Clip counter */}
                    <span className="text-neutral-400 text-sm font-medium min-w-[80px] text-center">
                        Clip {currentIndex + 1} of {clips.length}
                        {!streamComplete && '...'}
                    </span>

                    {/* Next */}
                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= clips.length - 1}
                        className="p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700/50 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Download button */}
                {streamComplete && onDownload && (
                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#BF0D3E] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a30c35] transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {isDownloading ? 'Merging...' : 'Download Merged Video'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoPlaylist;
