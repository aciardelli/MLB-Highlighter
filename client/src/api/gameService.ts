import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { ScheduleResponse, GameHighlightsStreamResponse } from '../types/api';

export const gameService = {
    getSchedule: async (teamName: string, startDate?: string, endDate?: string): Promise<ScheduleResponse> => {
        const response = await apiClient.post<ScheduleResponse>(ENDPOINTS.GAME_SCHEDULE, {
            team_name: teamName,
            start_date: startDate,
            end_date: endDate,
        });
        return response.data;
    },

    streamHighlights: async (gamePk: number): Promise<GameHighlightsStreamResponse> => {
        const response = await apiClient.post<GameHighlightsStreamResponse>(ENDPOINTS.GAME_HIGHLIGHTS_STREAM, {
            game_pk: gamePk,
        });
        return response.data;
    },
};
