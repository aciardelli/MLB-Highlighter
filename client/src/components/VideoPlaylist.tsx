import { type FC, useState } from 'react';
import type { VideoClip } from '../types/api';

interface VideoPlaylistProps {
    clips: VideoClip[];
    streamComplete: boolean;
    generatedUrl?: string | null;
}

const VideoPlaylist: FC<VideoPlaylistProps> = ({ clips, streamComplete, generatedUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentClip = clips[currentIndex];

    const handleEnded = () => {
        if (currentIndex + 1 < clips.length) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (currentIndex + 1 < clips.length) setCurrentIndex(currentIndex + 1);
    };

    if (!currentClip) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Video container */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video
                    key={currentClip.url}
                    src={currentClip.url}
                    onEnded={handleEnded}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full"
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

                {/* View on Savant link */}
                {generatedUrl && (
                    <a
                        href={generatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#BF0D3E] text-white text-sm font-medium hover:bg-[#a30c35] transition-all duration-200"
                    >
                        View on Savant &rarr;
                    </a>
                )}
            </div>
        </div>
    );
};

export default VideoPlaylist;
