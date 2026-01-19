import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { QueryRequest, ProcessQueryResponse, MergeUrlResponse, MergeQueryResponse, JobStatusResponse } from '../types/api';

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
        console.log("MERGING FROM QUERY")
        return response.data;
    },

    getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
        const response = await apiClient.get<JobStatusResponse>(ENDPOINTS.GET_JOB_STATUS + `${jobId}`);
        console.log("GETTING JOB STATUS")
        return response.data;
    }
};
