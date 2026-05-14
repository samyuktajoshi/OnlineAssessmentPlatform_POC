using AssessmentService.Models;

namespace AssessmentService.Repositories.Interfaces
{
    public interface IAssessmentRepository
    {
        Task AddAsync(Assessment assessment);
        Task<List<Assessment>> GetAllAsync();
        Task<Assessment> GetByIdAsync(int id);
        Task DeleteAsync(Assessment assessment);
        Task<List<Assessment>> GetByAdminIdAsync(int adminId);

        Task UpdateAsync(Assessment assessment);
    }
}
