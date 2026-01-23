import { type FC } from 'react';

interface StatusUpdateProps {
    status: string;
}

const StatusUpdate: FC<StatusUpdateProps> = ({ status }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-300">{status}</p>
        </div>
    )
};

export default StatusUpdate
