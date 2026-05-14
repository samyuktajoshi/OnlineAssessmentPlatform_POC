using ResultService.Models;
using System.Security.Claims;

namespace ResultService.Repositories.Interfaces
{
    public interface IResultRepository
    {
        Task AddAsync(Result result);
        Task<List<Result>> GetAllAsync();
        Task<List<Result>> GetByUserIdAsync(int userId);
        Task<List<Result>> GetByAssessmentIdAsync(int assessmentId);
        Task<Result?> GetBySubmissionIdAsync(int submissionId);

    }
}