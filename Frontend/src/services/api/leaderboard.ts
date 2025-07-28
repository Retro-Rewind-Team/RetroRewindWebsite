import { apiRequest } from "./client";
import {
    LeaderboardRequest,
    LeaderboardResponse,
    LeaderboardStats,
    Player,
} from "../../types";

export interface VRHistoryEntry {
  date: string;
  vrChange: number;
  totalVR: number;
}

export interface VRHistoryResponse {
  playerId: string;
  fromDate: string;
  toDate: string;
  history: VRHistoryEntry[];
  totalVRChange: number;
  startingVR: number;
  endingVR: number;
}

export interface MiiResponse {
  friendCode: string;
  miiImageBase64: string;
}

export interface BatchMiiRequest {
  friendCodes: string[];
}

export interface BatchMiiResponse {
  miis: Record<string, string>;
}

export const leaderboardApi = {
    async getLeaderboard(
        params: LeaderboardRequest = {}
    ): Promise<LeaderboardResponse> {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        return apiRequest<LeaderboardResponse>(`/leaderboard?${searchParams}`);
    },

    async getTopPlayers(count = 10, activeOnly = false): Promise<Player[]> {
        return apiRequest<Player[]>(
            `/leaderboard/top/${count}?activeOnly=${activeOnly}`
        );
    },

    async getPlayer(friendCode: string): Promise<Player> {
        return apiRequest<Player>(`/leaderboard/player/${friendCode}`);
    },

    async getStats(): Promise<LeaderboardStats> {
        return apiRequest<LeaderboardStats>("/leaderboard/stats");
    },

    async getPlayerHistory(
        friendCode: string,
        days = 30
    ): Promise<VRHistoryResponse> {
        return apiRequest<VRHistoryResponse>(
            `/leaderboard/player/${friendCode}/history?days=${days}`
        );
    },

    async getPlayerRecentHistory(
        friendCode: string,
        count = 50
    ): Promise<VRHistoryEntry[]> {
        return apiRequest<VRHistoryEntry[]>(
            `/leaderboard/player/${friendCode}/history/recent?count=${count}`
        );
    },

    async getPlayerMii(friendCode: string): Promise<MiiResponse | null> {
        try {
            return await apiRequest<MiiResponse>(
                `/leaderboard/player/${friendCode}/mii`
            );
        } catch (error) {
            if (error instanceof Error && error.message.includes("404")) {
                return null;
            }
            throw error;
        }
    },

    async getPlayerMiisBatch(friendCodes: string[]): Promise<BatchMiiResponse> {
        if (friendCodes.length === 0) {
            return { miis: {} };
        }

        const chunks = [];
        for (let i = 0; i < friendCodes.length; i += 25) {
            chunks.push(friendCodes.slice(i, i + 25));
        }

        const allMiis: Record<string, string> = {};

        for (const chunk of chunks) {
            try {
                const response = await apiRequest<BatchMiiResponse>(
                    "/leaderboard/miis/batch",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ friendCodes: chunk }),
                    }
                );

                Object.assign(allMiis, response.miis);
            } catch (error) {
                console.warn(
                    `Failed to load Mii batch for ${chunk.length} players:`,
                    error
                );
            }
        }

        return { miis: allMiis };
    },
};
