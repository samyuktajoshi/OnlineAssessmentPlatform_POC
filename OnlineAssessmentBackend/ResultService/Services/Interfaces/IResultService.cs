using ResultService.DTOs;
using ResultService.Models;
using System.Security.Claims;

namespace ResultService.Services.Interfaces
{
    public interface IResultService
    {
        Task<ResultResponseDto> CalculateAsync(int submissionId, ClaimsPrincipal user);
        Task<List<Result>> GetAllAsync();
        Task<List<Result>> GetByUserIdAsync(ClaimsPrincipal user);
        Task<object> GetAnalyticsAsync(int assessmentId);
        //Task<List<object>> GetLeaderboardAsync(int assessmentId);
        Task<List<LeaderboardDto>> GetLeaderboardAsync(int assessmentId);
        Task<object> GetMyAnalyticsAsync(ClaimsPrincipal user);
        Task<Result> GetResultBySubmissionIdAsync(int submissionId);

        Task<ResultWithDetailsDto> GetDetailedResultAsync(int submissionId);
        Task<UserAnalyticsDto> GetUserAnalyticsAsync(int userId);

    }
}