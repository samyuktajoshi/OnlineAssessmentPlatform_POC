using ResultService.DTOs;
using ResultService.Models;
using ResultService.Repositories.Interfaces;
using ResultService.Services.Interfaces;
using ResultService.Exceptions;
using System.Security.Claims;
using System.Net.Http.Json;

namespace ResultService.Services
{
    public class ResultServices : IResultService
    {
        private readonly IResultRepository _repo;
        private readonly HttpClient _http;
        private readonly ILogger<ResultServices> _logger;

        public ResultServices(
            IResultRepository repo,
            HttpClient http,
            ILogger<ResultServices> logger)
        {
            _repo = repo;
            _http = http;
            _logger = logger;
        }

        public async Task<ResultResponseDto> CalculateAsync(int submissionId, ClaimsPrincipal user)
        {
            var existingResult = await _repo.GetBySubmissionIdAsync(submissionId);

            if (existingResult != null)
            {
                throw new BadRequestException(
                    "Result already exists for this submission"
                );
            }
            if (submissionId <= 0)
                throw new BadRequestException("Invalid submission id");

            var claim = user.FindFirst(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("Invalid token");

            var userId = int.Parse(claim.Value);
            var userName = user.FindFirst(ClaimTypes.Name)?.Value ?? "User";

            _logger.LogInformation("Calculating result for Submission {Id}", submissionId);

            // 🔥 FETCH SUBMISSION
            var submission = await _http.GetFromJsonAsync<SubmissionDto>(
                $"https://localhost:7049/api/submissions/{submissionId}"
            ) ?? throw new NotFoundException("Submission not found");

            // 🔥 FETCH QUESTIONS
            var questions = await _http.GetFromJsonAsync<List<QuestionDto>>(
                $"https://localhost:7219/api/questions/assessment/{submission.AssessmentId}"
            ) ?? throw new NotFoundException("Questions not found");

            int score = 0;

            foreach (var q in questions)
            {
                var userAns = submission.Answers
                    .FirstOrDefault(a => a.QuestionId == q.Id);

                if (userAns == null) continue;

                var userAnswers = userAns.SelectedAnswers?
                    .Split(',').Select(x => x.Trim().ToUpper()).OrderBy(x => x).ToList();

                var correctAnswers = q.CorrectAnswers?
                    .Split(',').Select(x => x.Trim().ToUpper()).OrderBy(x => x).ToList();

                if (userAnswers != null &&
                    correctAnswers != null &&
                    userAnswers.SequenceEqual(correctAnswers))
                {
                    score++;
                }
            }

            var percentage = Math.Round((double)score / questions.Count * 100, 2);

            var result = new Result
            {
                SubmissionId = submissionId,
                UserId = userId,
                UserName = userName,
                AssessmentId = submission.AssessmentId,
                Score = score,
                TotalQuestions = questions.Count,
                Percentage = percentage,
                CreatedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(result);

            return new ResultResponseDto
            {
                Score = score,
                TotalQuestions = questions.Count,
                Percentage = percentage
            };
        }

        public async Task<List<Result>> GetAllAsync() =>
            await _repo.GetAllAsync();

        public async Task<List<Result>> GetByUserIdAsync(ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("Invalid token")
            );

            return await _repo.GetByUserIdAsync(userId);
        }

        public async Task<object> GetAnalyticsAsync(int assessmentId)
        {
            var results = await _repo.GetByAssessmentIdAsync(assessmentId);

            if (!results.Any())
                throw new NotFoundException("No results found");

            return new
            {
                TotalAttempts = results.Count,
                AverageScore = Math.Round(results.Average(r => r.Score), 2),
                HighestScore = results.Max(r => r.Score),
                PassPercentage = Math.Round(
                    results.Count(r => r.Percentage >= 50) * 100.0 / results.Count, 2)
            };
        }

        public async Task<List<Result>> GetLeaderboardAsync(int assessmentId)
        {
            var results = await _repo.GetByAssessmentIdAsync(assessmentId);

            return results
                .OrderByDescending(r => r.Score)
                .ThenBy(r => r.CreatedAt)
                .Take(5)
                .ToList();
        }

        public async Task<object> GetMyAnalyticsAsync(ClaimsPrincipal user)
        {
            var results = await GetByUserIdAsync(user);

            if (!results.Any())
            {
                return new { TotalTests = 0, AverageScore = 0, BestScore = 0, LatestScore = 0 };
            }

            return new
            {
                TotalTests = results.Count,
                AverageScore = Math.Round(results.Average(r => r.Score), 2),
                BestScore = results.Max(r => r.Score),
                LatestScore = results.OrderByDescending(r => r.CreatedAt).First().Score
            };
        }
        public async Task<Result> GetResultBySubmissionIdAsync(int submissionId)
        {
            var result = await _repo.GetBySubmissionIdAsync(submissionId);

            if (result == null)
                throw new NotFoundException("Result not found");

            return result;
        }
        public async Task<ResultWithDetailsDto> GetDetailedResultAsync(int submissionId)
        {
            // ✅ Get existing result
            var result = await _repo.GetBySubmissionIdAsync(submissionId);

            if (result == null)
                throw new NotFoundException("Result not found");

            // ✅ Fetch submission
            var submission = await _http.GetFromJsonAsync<SubmissionDto>(
                $"https://localhost:7049/api/submissions/{submissionId}"
            ) ?? throw new NotFoundException("Submission not found");

            // ✅ Fetch questions
            var questions = await _http.GetFromJsonAsync<List<QuestionDto>>(
                $"https://localhost:7219/api/questions/assessment/{submission.AssessmentId}"
            ) ?? throw new NotFoundException("Questions not found");

            var details = questions.Select(q =>
            {
                var userAns = submission.Answers
                    .FirstOrDefault(a => a.QuestionId == q.Id);

                var userAnswerStr = userAns?.SelectedAnswers;

                var userAnswers = userAnswerStr?
                    .Split(',').Select(x => x.Trim().ToUpper()).OrderBy(x => x);

                var correctAnswers = q.CorrectAnswers?
                    .Split(',').Select(x => x.Trim().ToUpper()).OrderBy(x => x);

                bool isCorrect = userAnswers != null &&
                                 correctAnswers != null &&
                                 userAnswers.SequenceEqual(correctAnswers);

                return new ResultDetailDto
                {
                    QuestionId = q.Id,
                    QuestionText = q.Text,

                    UserAnswer = userAnswerStr,
                    CorrectAnswer = q.CorrectAnswers,
                    IsCorrect = isCorrect,

                    // ✅ ADD THIS (you probably missed this)
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD
                };
            }).ToList();

            return new ResultWithDetailsDto
            {
                Score = result.Score,
                TotalQuestions = result.TotalQuestions,
                Percentage = result.Percentage,

                Details = details
            };
        }

    }
}