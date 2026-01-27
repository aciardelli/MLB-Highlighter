import { type FC } from 'react';

interface VideoDisplayProps {
    videoUrl: string;
}

const VideoDisplay: FC<VideoDisplayProps> = ({ videoUrl }) => {
    return (
        <div className="rounded-xl overflow-hidden">
            <video controls width="100%" className="rounded-lg">
                <source src={videoUrl} type="video/mp4" />
            </video>
        </div>
    );
};

export default VideoDisplay;
