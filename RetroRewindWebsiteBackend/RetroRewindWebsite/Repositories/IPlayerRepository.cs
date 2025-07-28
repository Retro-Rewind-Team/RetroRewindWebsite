﻿using RetroRewindWebsite.Models.Common;
using RetroRewindWebsite.Models.Entities;

namespace RetroRewindWebsite.Repositories
{
    public interface IPlayerRepository
    {
        Task<PlayerEntity?> GetByPidAsync(string pid);
        Task<PlayerEntity?> GetByFcAsync(string fc);
        Task<PlayerEntity?> GetByIdAsync(int id);
        Task<List<PlayerEntity>> GetAllAsync();
        Task AddAsync(PlayerEntity player);
        Task UpdateAsync(PlayerEntity player);
        Task DeleteAsync(int id);

        Task<PagedResult<PlayerEntity>> GetLeaderboardPageAsync(
            int page, int pageSize, bool activeOnly, string? search, string sortBy, bool ascending);

        Task<List<PlayerEntity>> GetTopPlayersAsync(int count, bool activeOnly = false);
        Task<List<PlayerEntity>> GetPlayersAroundRankAsync(int rank, int window, bool activeOnly = false);

        Task<int> GetTotalPlayersCountAsync();
        Task<int> GetActivePlayersCountAsync();
        Task<int> GetSuspiciousPlayersCountAsync();

        Task UpdatePlayerRanksAsync();
        Task UpdateActivePlayerRanksAsync();
        Task<List<PlayerEntity>> GetPlayersBatchAsync(int skip, int take);
        Task UpdatePlayersAsync(List<PlayerEntity> players);
        Task UpdatePlayerActivityStatusAsync(DateTime cutoffDate);

        Task<List<PlayerEntity>> GetPlayersByFriendCodesAsync(List<string> friendCodes);
    }
}