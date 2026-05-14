using AssessmentService.DTOs;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using AssessmentService.Services.Interfaces;
using AssessmentService.Exceptions;
namespace AssessmentService.Services
{
    public class AssessmentQuestionService : IAssessmentQuestionService
    {
        private readonly IAssessmentQuestionRepository _repo;
        private readonly ILogger<AssessmentQuestionService> _logger;

        public AssessmentQuestionService(
            IAssessmentQuestionRepository repo,
            ILogger<AssessmentQuestionService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task<string> AddQuestionAsync(AddQuestionToAssessmentDto dto)
        {
            if (dto.AssessmentId <= 0 || dto.QuestionId <= 0)

                throw new BadRequestException("Invalid assessment or question ID");

            var exists = await _repo.ExistsAsync(dto.AssessmentId, dto.QuestionId);

            if (exists)

                throw new BadRequestException("Question already added to assessment");

            var aq = new AssessmentQuestion
            {
                AssessmentId = dto.AssessmentId,
                QuestionId = dto.QuestionId
            };

            await _repo.AddAsync(aq);

            _logger.LogInformation("Question {Q} added to Assessment {A}", dto.QuestionId, dto.AssessmentId);

            return "Question added to assessment";
        }

        public async Task<string> RemoveQuestionAsync(int assessmentId, int questionId)
        {
            var mapping = await _repo.GetAsync(assessmentId, questionId);

            if (mapping == null)
                throw new NotFoundException("Question mapping not found");
            await _repo.DeleteAsync(mapping);

            return "Question removed";
        }

        public async Task<List<Question>> GetQuestionsByAssessmentAsync(int assessmentId)
        {
            var mappings = await _repo.GetByAssessmentIdAsync(assessmentId);

            return mappings.Select(x => x.Question).ToList();
        }
        public async Task<List<QuestionForCandidateDto>> GetQuestionsForCandidateAsync(int assessmentId)
        {
            var mappings = await _repo.GetByAssessmentIdAsync(assessmentId);

            return mappings.Select(x => new QuestionForCandidateDto
            {
                Id = x.Question.Id,
                Text = x.Question.Text,
                OptionA = x.Question.OptionA,
                OptionB = x.Question.OptionB,
                OptionC = x.Question.OptionC,
                OptionD = x.Question.OptionD
            }).ToList();
        }
    }
}