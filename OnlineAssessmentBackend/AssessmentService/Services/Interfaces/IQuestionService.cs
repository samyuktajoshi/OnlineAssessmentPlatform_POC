using AssessmentService.DTOs;
using AssessmentService.Models;

namespace AssessmentService.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<int> CreateAsync(CreateQuestionDto dto); // ✅ changed

        Task<List<Question>> GetAllAsync();

        Task<Question> GetByIdAsync(int id);

        Task<string> DeleteAsync(int id);
        Task<string> UpdateAsync(int id, CreateQuestionDto dto);
        Task<List<Question>> GetByAssessmentAsync(int assessmentId);
    }
}
