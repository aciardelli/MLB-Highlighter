export interface SearchRequest {
  input: string;
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

export interface StreamResponse {
  job_id: string;
  generated_url?: string;
  filter_display?: FilterDisplay;
}

export interface DownloadResponse {
  download_job_id: string;
}

// Game types

export interface GameTeam {
  id: number;
  name: string;
  score: number | null;
}

export interface Game {
  game_pk: number;
  date: string;
  teams: {
    away: GameTeam;
    home: GameTeam;
  };
  venue: string;
  status: string;
}

export interface ScheduleResponse {
  games: Game[];
  start_date: string;
  end_date: string;
  team_name: string;
}

export interface GameHighlightsStreamResponse {
  job_id: string;
  total_plays: number;
  game_pk: number;
}

