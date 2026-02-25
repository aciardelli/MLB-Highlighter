import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { SearchRequest, JobStatusResponse, StreamResponse, DownloadResponse } from '../types/api';

export const queryService = {
    search: async (input: string): Promise<StreamResponse> => {
        const requestData: SearchRequest = { input };
        const response = await apiClient.post<StreamResponse>(ENDPOINTS.STREAM, requestData);
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
