import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { QueryRequest, ProcessQueryResponse, MergeUrlResponse, MergeQueryResponse } from '../types/api';

export const queryService = {
  processQuery: async (query: string): Promise<ProcessQueryResponse> => {
    const requestData: QueryRequest = { query };
    const response = await apiClient.post<ProcessQueryResponse>(ENDPOINTS.PROCESS_QUERY, requestData);
    return response.data;
  },

  mergeFromUrl: async (url: string): Promise<MergeUrlResponse> => {
    const response = await apiClient.post<MergeUrlResponse>(ENDPOINTS.MERGE_URL, null, {
      params: { url }
    });
    return response.data;
  },

  mergeFromQuery: async (query: string): Promise<MergeQueryResponse> => {
    const requestData: QueryRequest = { query };
    const response = await apiClient.post<MergeQueryResponse>(ENDPOINTS.MERGE_QUERY, requestData);
    return response.data;
  }
};
