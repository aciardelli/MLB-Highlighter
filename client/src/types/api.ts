export interface QueryRequest {
  query: string;
}

export interface ProcessQueryResponse {
  message: string;
  original_query: string;
  generated_url: string;
  filters: Record<string, unknown>;
}

export interface MergeUrlResponse {
  message: string;
  output_file: string;
}

export interface MergeQueryResponse {
  message: string;
  original_query: string;
  generated_url: string;
  filters: Record<string, unknown>;
  output_file: string;
}
