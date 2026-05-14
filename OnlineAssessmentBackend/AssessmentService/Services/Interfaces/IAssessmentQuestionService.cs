using AssessmentService.DTOs;
using AssessmentService.Models;

namespace AssessmentService.Services.Interfaces
{
    public interface IAssessmentQuestionService
    {
        Task<string> AddQuestionAsync(AddQuestionToAssessmentDto dto);
        Task<string> RemoveQuestionAsync(int assessmentId, int questionId);
        Task<List<Question>> GetQuestionsByAssessmentAsync(int assessmentId);
        Task<List<QuestionForCandidateDto>> GetQuestionsForCandidateAsync(int assessmentId);

    }
}
