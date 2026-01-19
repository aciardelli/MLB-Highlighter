export interface QueryRequest {
  query: string;
}

export interface JobStatusResponse {
    status: string;
    video_url: string;
    error_message: string;
}

export interface MergeUrlResponse {
  message: string;
  job_id: string;
}

export interface MergeQueryResponse {
  message: string;
  original_query: string;
  generated_url: string;
  filters: Record<string, unknown>;
  job_id: string;
}

export interface ProcessQueryResponse {
  message: string;
  original_query: string;
  generated_url: string;
  filters: Record<string, unknown>;
}

