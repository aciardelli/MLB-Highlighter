export interface QueryRequest {
  query: string;
}

export interface JobStatusResponse {
    status: string;
    video_url: string;
    error_message: string;
}

export type FilterDisplay = Record<string, string | string[]>;

export interface VideoClipMetadata {
  batter: string | null;
  pitcher: string | null;
  pitch_type: string | null;
  pitch_velo: string | null;
  exit_velo: string | null;
  distance: string | null;
  date: string | null;
  matchup: string | null;
  count: string | null;
}

export interface VideoClip {
  url: string;
  index: number;
  metadata: VideoClipMetadata;
}

export interface StreamQueryResponse {
  job_id: string;
  generated_url: string;
  filter_display: FilterDisplay;
}

export interface StreamUrlResponse {
  job_id: string;
}

export interface DownloadResponse {
  download_job_id: string;
}

