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

export type FilterDisplay = Record<string, string | string[]>;

export interface MergeQueryResponse {
  message: string;
  original_query: string;
  generated_url: string;
  filter_display: FilterDisplay;
  job_id: string;
}

export interface ProcessQueryResponse {
  message: string;
  original_query: string;
  generated_url: string;
  filter_display: FilterDisplay;
}

