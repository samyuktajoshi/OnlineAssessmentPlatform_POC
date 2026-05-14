using SubmissionService.DTOs;
using SubmissionService.Models;
using SubmissionService.Repositories.Interfaces;
using SubmissionService.Services.Interfaces;
using System.Security.Claims;
using SubmissionService.Exceptions;
namespace SubmissionService.Services
{
    public class SubmissionnService : ISubmissionService
    {
        private readonly ISubmissionRepository _repo;

        public SubmissionnService(ISubmissionRepository repo)
        {
            _repo = repo;
        }

        public async Task<int> SubmitAsync(SubmitTestDto dto, ClaimsPrincipal user)
        {
            if (dto.Answers == null || !dto.Answers.Any())
                throw new BadRequestException("Answers cannot be empty");

            var claim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                throw new UnauthorizedAccessException("Invalid token");

            var userId = int.Parse(claim.Value);

            var submission = new Submission
            {
                UserId = userId,
                AssessmentId = dto.AssessmentId,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,
                Answers = dto.Answers.Select(a => new SubmissionAnswer
                {
                    QuestionId = a.QuestionId,
                    SelectedAnswers = a.SelectedAnswers
                }).ToList()
            };

            await _repo.AddAsync(submission);

            return submission.Id;
        }

        // ✅ ADD THIS (FOR RESULT SERVICE)
        public async Task<SubmissionDto?> GetByIdAsync(int id)
        {
            var sub = await _repo.GetByIdAsync(id);

            if (sub == null)
                throw new NotFoundException("Submission not found");
            return new SubmissionDto
            {
                SubmissionId = sub.Id,
                AssessmentId = sub.AssessmentId,
                Answers = sub.Answers.Select(a => new SubmissionAnswerDto
                {
                    QuestionId = a.QuestionId,
                    SelectedAnswers = a.SelectedAnswers
                }).ToList()
            };
        }
    }
}