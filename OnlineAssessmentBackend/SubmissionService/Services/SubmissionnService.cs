using SubmissionService.DTOs;
using SubmissionService.Models;
using SubmissionService.Repositories.Interfaces;
using SubmissionService.Services.Interfaces;
using System.Security.Claims;
using SubmissionService.Exceptions;
using Microsoft.Extensions.Logging;

namespace SubmissionService.Services
{
    public class SubmissionnService : ISubmissionService
    {
        private readonly ISubmissionRepository _repo;
        private readonly ILogger<SubmissionnService> _logger;

        public SubmissionnService(
            ISubmissionRepository repo,
            ILogger<SubmissionnService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        // ✅ SUBMIT TEST
        public async Task<int> SubmitAsync(SubmitTestDto dto, ClaimsPrincipal user)
        {
            _logger.LogInformation("Submission request received for Assessment {AssessmentId}", dto.AssessmentId);

            if (dto.Answers == null || !dto.Answers.Any())
            {
                _logger.LogWarning("Submission failed: Answers are empty");
                throw new BadRequestException("Answers cannot be empty");
            }

            var claim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                _logger.LogWarning("Submission failed: Invalid token");
                throw new UnauthorizedAccessException("Invalid token");
            }

            var userId = int.Parse(claim.Value);

            _logger.LogInformation("User {UserId} submitting test with {Count} answers",
                userId, dto.Answers.Count);

            // ✅ LOG EACH ANSWER (VERY IMPORTANT)
            foreach (var a in dto.Answers)
            {
                _logger.LogInformation(
                    "Answer → QID: {Qid}, Selected: {Selected}, IsCorrect: {Correct}",
                    a.QuestionId,
                    a.SelectedAnswers,
                    a.IsCorrect
                );
            }

            var submission = new Submission
            {
                UserId = userId,
                AssessmentId = dto.AssessmentId,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,

                Answers = dto.Answers.Select(a => new SubmissionAnswer
                {
                    QuestionId = a.QuestionId,
                    SelectedAnswers = a.SelectedAnswers,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };

            await _repo.AddAsync(submission);

            _logger.LogInformation(
                "Submission stored successfully → SubmissionId: {Id}, User: {UserId}",
                submission.Id, userId
            );

            return submission.Id;
        }

        // ✅ GET SUBMISSION BY ID
        public async Task<SubmissionDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching submission {SubmissionId}", id);

            var sub = await _repo.GetByIdAsync(id);

            if (sub == null)
            {
                _logger.LogWarning("Submission not found {SubmissionId}", id);
                throw new NotFoundException("Submission not found");
            }

            _logger.LogInformation(
                "Submission {SubmissionId} retrieved with {Count} answers",
                id, sub.Answers.Count
            );

            return new SubmissionDto
            {
                SubmissionId = sub.Id,
                AssessmentId = sub.AssessmentId,

                Answers = sub.Answers.Select(a => new SubmissionAnswerDto
                {
                    QuestionId = a.QuestionId,
                    SelectedAnswers = a.SelectedAnswers,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };
        }
    }
}
