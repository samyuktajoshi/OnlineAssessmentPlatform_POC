using AssessmentService.Models;

namespace AssessmentService.Repositories.Interfaces
{
    public interface IAssessmentQuestionRepository
    {
        Task AddAsync(AssessmentQuestion aq);

        Task<bool> ExistsAsync(int assessmentId, int questionId);

        Task<AssessmentQuestion?> GetAsync(int assessmentId, int questionId);

        Task DeleteAsync(AssessmentQuestion aq);
        Task<List<AssessmentQuestion>> GetByAssessmentIdAsync(int assessmentId);
    }
}
