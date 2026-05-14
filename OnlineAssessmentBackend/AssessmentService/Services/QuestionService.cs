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

        // ✅ CREATE (RETURN ID)
        public async Task<int> CreateAsync(CreateQuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Text))
                throw new BadRequestException("Question text is required");
            if (dto.Type != 3) // not True/False
            {
                if (string.IsNullOrWhiteSpace(dto.OptionA) ||
                    string.IsNullOrWhiteSpace(dto.OptionB) ||
                    string.IsNullOrWhiteSpace(dto.OptionC) ||
                    string.IsNullOrWhiteSpace(dto.OptionD))

                    throw new BadRequestException("All options are required");
            }

            if (string.IsNullOrWhiteSpace(dto.CorrectAnswers))

                throw new BadRequestException("Correct answer is required");

            if (dto.Type == 1 && dto.CorrectAnswers.Contains(","))

                throw new BadRequestException("Single choice must have only one answer");

            if (dto.Type == 3 && !("A".Equals(dto.CorrectAnswers.ToUpper()) || "B".Equals(dto.CorrectAnswers.ToUpper())))
                throw new BadRequestException("True/False must be A or B");
            var question = new Question
            {
                Text = dto.Text,
                Type = (QuestionType)dto.Type,
                OptionA = dto.Type == 3 ? "True" : dto.OptionA,
                OptionB = dto.Type == 3 ? "False" : dto.OptionB,
                OptionC = dto.Type == 3 ? "" : dto.OptionC,
                OptionD = dto.Type == 3 ? "" : dto.OptionD,
                CorrectAnswers = dto.CorrectAnswers.ToUpper()
            };

            await _repo.AddAsync(question);

            _logger.LogInformation("Question created with ID {Id}", question.Id);

            return question.Id; // ✅ IMPORTANT FIX
        }

        // ✅ UPDATE
        public async Task<string> UpdateAsync(int id, CreateQuestionDto dto)
        {
            var question = await _repo.GetByIdAsync(id);

            if (question == null)
                throw new NotFoundException("Question not found");
            question.Text = dto.Text;
            question.Type = (QuestionType)dto.Type;
            question.OptionA = dto.Type == 3 ? "True" : dto.OptionA;
            question.OptionB = dto.Type == 3 ? "False" : dto.OptionB;
            question.OptionC = dto.Type == 3 ? "" : dto.OptionC;
            question.OptionD = dto.Type == 3 ? "" : dto.OptionD;
            question.CorrectAnswers = dto.CorrectAnswers.ToUpper();

            await _repo.UpdateAsync(question);

            return "Question updated";
        }

        public async Task<List<Question>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<Question?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<string> DeleteAsync(int id)
        {
            var question = await _repo.GetByIdAsync(id);

            if (question == null)
                throw new Exception("Question not found");

            await _repo.DeleteAsync(question);

            _logger.LogInformation("Question deleted {Id}", id);

            return "Question deleted";
        }
        public async Task<List<Question>> GetByAssessmentAsync(int assessmentId)
        {
            return await _repo.GetByAssessmentAsync(assessmentId);
        }
    }
}