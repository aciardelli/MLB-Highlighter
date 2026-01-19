import { useState } from 'react'
import SearchForm from './SearchForm.tsx'
import VideoDisplay from './VideoDisplay.tsx'

const MLBMerger = () => {
    const [jobId, setJobId] = useState<string | null>(null); 

    // add more here
    const handleResult = (result: ProcessQueryResponse | MergeQueryResponse | MergeUrlResponse) => {
        if (result && 'job_id' in result) {
            setJobId(result.job_id);
        };
    };

    return (
      <div className="flex justify-center flex-col">
        <SearchForm onResult={handleResult}/>
        {jobId && <VideoDisplay key={jobId} jobId={jobId}/>}
      </div>
    )
};

export default MLBMerger;
