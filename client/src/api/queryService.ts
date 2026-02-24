import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { QueryRequest, JobStatusResponse, StreamQueryResponse, StreamUrlResponse, DownloadResponse } from '../types/api';

export const queryService = {
    streamFromQuery: async (query: string): Promise<StreamQueryResponse> => {
        const requestData: QueryRequest = { query };
        const response = await apiClient.post<StreamQueryResponse>(ENDPOINTS.STREAM_QUERY, requestData);
        return response.data;
    },

    streamFromUrl: async (url: string): Promise<StreamUrlResponse> => {
        const response = await apiClient.post<StreamUrlResponse>(ENDPOINTS.STREAM_URL, null, {
            params: { url }
        });
        return response.data;
    },

    downloadJob: async (jobId: string): Promise<DownloadResponse> => {
        const response = await apiClient.post<DownloadResponse>(ENDPOINTS.DOWNLOAD_START + jobId);
        return response.data;
    },

    getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
        const response = await apiClient.get<JobStatusResponse>(ENDPOINTS.GET_JOB_STATUS + `${jobId}`);
        return response.data;
    }
};
