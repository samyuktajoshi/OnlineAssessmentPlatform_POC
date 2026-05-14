using AssessmentService.Models;

namespace AssessmentService.Repositories.Interfaces
{
    public interface IQuestionRepository
    {
        Task AddAsync(Question question);
        Task<List<Question>> GetAllAsync();
        Task<Question> GetByIdAsync(int id);
        Task DeleteAsync(Question question);
        Task UpdateAsync(Question question);
        Task<List<Question>> GetByAssessmentAsync(int assessmentId);


    }
}
