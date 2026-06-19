using AssessmentService.DTOs;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using AssessmentService.Services.Interfaces;
using AssessmentService.Exceptions;

namespace AssessmentService.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository _repo;
        private readonly ILogger<QuestionService> _logger;

        public QuestionService(IQuestionRepository repo, ILogger<QuestionService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        //  CREATE
        public async Task<int> CreateAsync(CreateQuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Text))
                throw new BadRequestException("Question text is required");

            var type = (QuestionType)dto.Type;

            // MCQ validation
            if (type != QuestionType.TrueFalse && type != QuestionType.Coding)
            {
                if (string.IsNullOrWhiteSpace(dto.OptionA) ||
                    string.IsNullOrWhiteSpace(dto.OptionB) ||
                    string.IsNullOrWhiteSpace(dto.OptionC) ||
                    string.IsNullOrWhiteSpace(dto.OptionD))
                {
                    throw new BadRequestException("All options are required");
                }
            }

            //  Correct answer 
            if (type != QuestionType.Coding &&
                string.IsNullOrWhiteSpace(dto.CorrectAnswers))
            {
                throw new BadRequestException("Correct answer is required");
            }

            var question = new Question
            {
                Text = dto.Text,
                Type = type,

                //  MCQ
                OptionA = type == QuestionType.TrueFalse ? "True" : dto.OptionA,
                OptionB = type == QuestionType.TrueFalse ? "False" : dto.OptionB,
                OptionC = type == QuestionType.TrueFalse ? null : dto.OptionC,
                OptionD = type == QuestionType.TrueFalse ? null : dto.OptionD,

                CorrectAnswers = type == QuestionType.Coding
                    ? null
                    : dto.CorrectAnswers?.ToUpper(),

                //  Coding
                StarterCode = dto.StarterCode,

                TestCases = dto.TestCases?.Select(tc => new TestCase
                {
                    Input = tc.Input,
                    ExpectedOutput = tc.ExpectedOutput,
                    IsHidden = tc.IsHidden
                }).ToList()
            };

            await _repo.AddAsync(question);

            return question.Id;
        }

        // UPDATE
        public async Task<string> UpdateAsync(int id, CreateQuestionDto dto)
        {
            var question = await _repo.GetByIdAsync(id);

            if (question == null)
                throw new NotFoundException("Question not found");

            var type = (QuestionType)dto.Type;

            question.Text = dto.Text;
            question.Type = type;

            question.OptionA = type == QuestionType.TrueFalse ? "True" : dto.OptionA;
            question.OptionB = type == QuestionType.TrueFalse ? "False" : dto.OptionB;
            question.OptionC = type == QuestionType.TrueFalse ? null : dto.OptionC;
            question.OptionD = type == QuestionType.TrueFalse ? null : dto.OptionD;

            question.CorrectAnswers = type == QuestionType.Coding
                ? null
                : dto.CorrectAnswers?.ToUpper();

            question.StarterCode = dto.StarterCode;

            // UPDATE TEST CASES
            question.TestCases = dto.TestCases?.Select(tc => new TestCase
            {
                Input = tc.Input,
                ExpectedOutput = tc.ExpectedOutput,
                IsHidden = tc.IsHidden,
                QuestionId = question.Id
            }).ToList();

            await _repo.UpdateAsync(question);

            return "Question updated";
        }

        //  GET ALL
        public async Task<List<Question>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        // GET BY ID
        public async Task<Question?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        //  DELETE
        public async Task<string> DeleteAsync(int id)
        {
            var question = await _repo.GetByIdAsync(id);

            if (question == null)
                throw new NotFoundException("Question not found");

            await _repo.DeleteAsync(question);

            return "Question deleted";
        }

        // GET BY ASSESSMENT
        public async Task<List<Question>> GetByAssessmentAsync(int assessmentId)
        {
            return await _repo.GetByAssessmentAsync(assessmentId);
        }
    }
}