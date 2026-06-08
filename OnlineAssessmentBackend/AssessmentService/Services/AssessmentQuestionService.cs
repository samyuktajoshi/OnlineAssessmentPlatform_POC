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

        // ✅ ADD QUESTION TO ASSESSMENT
        public async Task<string> AddQuestionAsync(AddQuestionToAssessmentDto dto)
        {
            _logger.LogInformation(
                "AddQuestion request → AssessmentId: {A}, QuestionId: {Q}",
                dto.AssessmentId, dto.QuestionId);

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

            return "Question added to assessment";
        }

        // ✅ REMOVE QUESTION FROM ASSESSMENT
        public async Task<string> RemoveQuestionAsync(int assessmentId, int questionId)
        {
            var mapping = await _repo.GetAsync(assessmentId, questionId);

            if (mapping == null)
                throw new NotFoundException("Question mapping not found");

            await _repo.DeleteAsync(mapping);

            return "Question removed";
        }

        // ✅ GET QUESTIONS (ADMIN VIEW)
        public async Task<List<Question>> GetQuestionsByAssessmentAsync(int assessmentId)
        {
            var mappings = await _repo.GetByAssessmentIdAsync(assessmentId);

            return mappings.Select(x => x.Question).ToList();
        }

        // ✅ GET QUESTIONS FOR CANDIDATE (UPDATED ✅)
        public async Task<List<QuestionForCandidateDto>> GetQuestionsForCandidateAsync(int assessmentId)
        {
            _logger.LogInformation(
                "Fetching candidate questions for Assessment {A}",
                assessmentId);

            var mappings = await _repo.GetByAssessmentIdAsync(assessmentId);

            var result = mappings
                .Where(x => x.Question != null) // ✅ prevent null crash
                .Select(x => new QuestionForCandidateDto
                {
                    Id = x.Question.Id,
                    Text = x.Question.Text,
                    Type = (int)x.Question.Type,

                    // ✅ MCQ fields
                    OptionA = x.Question.OptionA,
                    OptionB = x.Question.OptionB,
                    OptionC = x.Question.OptionC,
                    OptionD = x.Question.OptionD,

                    // ✅ Coding fields
                    StarterCode = x.Question.StarterCode,

                    // ✅ MULTIPLE TEST CASES (SAFE ✅)
                    TestCases = x.Question.TestCases?
                        .Where(tc => !tc.IsHidden)
                        .Select(tc => new TestCaseDto
                        {
                            Input = tc.Input,
                            ExpectedOutput = tc.ExpectedOutput,
                            IsHidden = tc.IsHidden
                        })
                        .ToList() ?? new List<TestCaseDto>()
                })
                .ToList();

            _logger.LogInformation(
                "Returned {Count} questions for Assessment {A}",
                result.Count, assessmentId);

            return result;
        }

    }
}
