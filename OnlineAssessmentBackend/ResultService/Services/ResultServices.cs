using Microsoft.EntityFrameworkCore;
using ResultService.Data;
using ResultService.DTOs;
using ResultService.Exceptions;
using ResultService.Models;
using ResultService.Repositories.Interfaces;
using ResultService.Services.Interfaces;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;

namespace ResultService.Services
{
    public class ResultServices : IResultService
    {
        private readonly IResultRepository _repo;
        private readonly HttpClient _http;
        private readonly ILogger<ResultServices> _logger;
        private readonly ResultDbContext _context;

        public ResultServices(
            IResultRepository repo,
            HttpClient http,
            ILogger<ResultServices> logger,
            ResultDbContext context)
        {
            _repo = repo;
            _http = http;
            _logger = logger;
            _context = context;
        }
        
        private string Normalize(string str)
        {
            return (str ?? "")
                .Replace("\r", "")
                .Replace("\n", "")
                .Trim()
                .ToLower();
        }

        //CALCULATING RESULT 
        public async Task<ResultResponseDto> CalculateAsync(int submissionId, ClaimsPrincipal user)
        {
            _logger.LogInformation("Starting result calculation for {SubmissionId}", submissionId);

            if (submissionId <= 0)
                throw new BadRequestException("Invalid submission id");

            var existing = await _repo.GetBySubmissionIdAsync(submissionId);
            if (existing != null)
                throw new BadRequestException("Result already exists");

            var claim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Invalid token");

            var userId = int.Parse(claim.Value);
            var userName = user.FindFirst(ClaimTypes.Name)?.Value ?? "User";

            // Fetch submission
            var submission = await _http.GetFromJsonAsync<SubmissionDto>(
                $"https://localhost:7049/api/submissions/{submissionId}")
                ?? throw new NotFoundException("Submission not found");

            _logger.LogInformation("Answers count: {Count}", submission.Answers?.Count ?? 0);

            // Fetch questions
            var questions = await _http.GetFromJsonAsync<List<QuestionDto>>(
                $"https://localhost:7219/api/questions/assessment/{submission.AssessmentId}")
                ?? throw new NotFoundException("Questions not found");

            int score = 0;

            // SCORING 
            foreach (var q in questions)
            {
                var userAns = submission.Answers?
                    .FirstOrDefault(a => a.QuestionId == q.Id);

                if (userAns == null)
                {
                    _logger.LogWarning("No answer for Question {Qid}", q.Id);
                    continue;
                }

                //  CODING QUESTIONS
                if (q.Type == 4)
                {
                    var userCode = userAns.Code;
                    if (string.IsNullOrWhiteSpace(userCode))
                    {
                        _logger.LogWarning("No code provided for Q{Qid}", q.Id);
                        continue;
                    }

                    var testCases = q.TestCases ?? new List<TestCaseDto>();
                    int passed = 0;
                    int total = testCases.Count;

                    foreach (var tc in testCases)
                    {
                        try
                        {
                            var response = await _http.PostAsJsonAsync(
                                "https://localhost:7219/api/code/run",
                                new
                                {
                                    code = userCode,
                                    input = tc.Input
                                });

                            if (!response.IsSuccessStatusCode)
                            {
                                _logger.LogWarning(
                                    "Code runner returned {Status} for Q{Qid}",
                                    response.StatusCode, q.Id);
                                continue;
                            }

                            var json = await response.Content
                                .ReadFromJsonAsync<JsonElement>();

                            string output = json.TryGetProperty("output", out var outputProp)
                                ? outputProp.GetString() ?? ""
                                : "";

                            _logger.LogInformation(
                                "Q{Qid} TC - Expected: [{Exp}] Actual: [{Act}]",
                                q.Id, tc.ExpectedOutput, output);

                            if (Normalize(output) == Normalize(tc.ExpectedOutput))
                            {
                                passed++;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(
                                "Code execution failed for Q{Qid}: {Err}",
                                q.Id, ex.Message);
                        }
                    }

                    if (total > 0)
                    {
                        int marks = (5 * passed) / total; // partial scoring
                        score += marks;

                        _logger.LogInformation(
                            "Coding Q{Qid}: Passed {Passed}/{Total} → Marks {Marks}",
                            q.Id, passed, total, marks);
                    }
                }

                // MCQ / TRUE FALSE 
                else
                {
                    var userAnswers = userAns.SelectedAnswers?
                        .Split(',')
                        .Select(x => x.Trim().ToUpper())
                        .OrderBy(x => x)
                        .ToList();

                    var correctAnswers = q.CorrectAnswers?
                        .Split(',')
                        .Select(x => x.Trim().ToUpper())
                        .OrderBy(x => x)
                        .ToList();

                    if (userAnswers != null &&
                        correctAnswers != null &&
                        userAnswers.SequenceEqual(correctAnswers))
                    {
                        score += 1;
                        _logger.LogInformation("MCQ correct → +1 mark (Q{Qid})", q.Id);
                    }
                    else
                    {
                        _logger.LogInformation("MCQ incorrect (Q{Qid})", q.Id);
                    }
                }
            }

            // TOTAL MARK
            int totalMarks = questions.Sum(q => q.Type == 4 ? 5 : 1);

            // PERCENTAGE 
            var percentage = totalMarks == 0
                ? 0
                : Math.Round((double)score / totalMarks * 100, 2);

            _logger.LogInformation(
                "Final → Score: {Score}, Total: {Total}, Percentage: {Percent}%",
                score, totalMarks, percentage);

            // SAVE RESULT 
            var result = new Result
            {
                SubmissionId = submissionId,
                UserId = userId,
                UserName = userName,
                AssessmentId = submission.AssessmentId,
                Score = score,
                TotalQuestions = totalMarks,
                Percentage = percentage,
                CreatedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(result);
            _logger.LogInformation("Result saved for {SubmissionId}", submissionId);

            return new ResultResponseDto
            {
                Score = score,
                TotalQuestions = totalMarks,
                Percentage = percentage
            };
        }

        //GET USER RESULTS 
        public async Task<List<Result>> GetByUserIdAsync(ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Invalid token");

            var userId = int.Parse(claim.Value);
            return await _repo.GetByUserIdAsync(userId);
        }

        //ANALYTICS
        public async Task<object> GetAnalyticsAsync(int assessmentId)
        {
            var results = await _repo.GetByAssessmentIdAsync(assessmentId);

            if (!results.Any())
                throw new NotFoundException("No results found");

            var distribution = new
            {
                Low = results.Count(r => r.Percentage < 40),
                Medium = results.Count(r => r.Percentage >= 40 && r.Percentage < 70),
                High = results.Count(r => r.Percentage >= 70)
            };

            var topper = results.OrderByDescending(r => r.Score).First();

            return new
            {
                TotalAttempts = results.Count,
                //AverageScore = Math.Round(results.Average(r => r.Score), 2),
                //HighestScore = results.Max(r => r.Score),
                AverageScore = Math.Round(results.Average(r => r.Percentage), 2),
                HighestScore = results.Max(r => r.Percentage),
                PassPercentage = Math.Round(
                    results.Count(r => r.Percentage >= 50) * 100.0 / results.Count, 2),
                ScoreDistribution = distribution,
                Topper = new { topper.UserName, topper.Score }
            };
        }

        //LEADERBOARD 
        public async Task<List<LeaderboardDto>> GetLeaderboardAsync(int assessmentId)
        {
            var results = await _repo.GetByAssessmentIdAsync(assessmentId);

            return results
                .GroupBy(r => r.UserId)
                .Select(g => g
                    //.OrderByDescending(x => x.Score)
                    //.ThenBy(x => x.CreatedAt)
                    .OrderByDescending(r => r.Percentage)
.ThenBy(r => r.CreatedAt)
                    .First())
                .OrderByDescending(r => r.Score)
                .ThenBy(r => r.CreatedAt)
                .Select((r, index) => new LeaderboardDto
                {
                    Rank = index + 1,
                    UserName = r.UserName,
                    Score = r.Score
                })
                .Take(5)
                .ToList();
        }

        //  USER ANALYTICS
        public async Task<object> GetMyAnalyticsAsync(ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Invalid token");

            var userId = int.Parse(claim.Value);
            var results = await _repo.GetByUserIdAsync(userId);

            if (!results.Any())
            {
                return new
                {
                    TotalTests = 0,
                    AverageScore = 0,
                    BestScore = 0,
                    LatestScore = 0,
                    Improvement = 0
                };
            }

            var ordered = results.OrderBy(r => r.CreatedAt).ToList();

            return new
            {
                TotalTests = results.Count,
                AverageScore = Math.Round(results.Average(r => r.Score), 2),
                BestScore = results.Max(r => r.Score),
                LatestScore = ordered.Last().Score,
                Improvement = ordered.Count > 1
                    ? ordered.Last().Score - ordered.First().Score
                    : 0
            };
        }


        public async Task<List<Result>> GetAllAsync() =>
            await _repo.GetAllAsync();

        public async Task<Result> GetResultBySubmissionIdAsync(int submissionId)
        {
            return await _repo.GetBySubmissionIdAsync(submissionId)
                ?? throw new NotFoundException("Result not found");
        }

        public async Task<ResultWithDetailsDto> GetDetailedResultAsync(int submissionId)
        {
            var result = await _repo.GetBySubmissionIdAsync(submissionId)
                ?? throw new NotFoundException("Result not found");

            var submission = await _http.GetFromJsonAsync<SubmissionDto>(
                $"https://localhost:7049/api/submissions/{submissionId}")
                ?? throw new NotFoundException("Submission not found");

            var questions = await _http.GetFromJsonAsync<List<QuestionDto>>(
                $"https://localhost:7219/api/questions/assessment/{submission.AssessmentId}")
                ?? throw new NotFoundException("Questions not found");

            var details = questions.Select(q =>
            {
                var userAns = submission.Answers?
                    .FirstOrDefault(a => a.QuestionId == q.Id);

                bool isCorrect = userAns?.IsCorrect == true;

                var correctAnswer = q.Type == 4
                    ? string.Join("\n", q.TestCases?
                        .Where(tc => !tc.IsHidden)
                        .Select((tc, i) => $"Case {i + 1}: {tc.ExpectedOutput}") ?? new List<string>())
                    : q.CorrectAnswers;

                return new ResultDetailDto
                {
                    QuestionId = q.Id,
                    QuestionText = q.Text,

                    UserAnswer = q.Type == 4
                        ? (userAns?.Code ?? "No code submitted")
                        : (userAns?.SelectedAnswers ?? "Not answered"),

                    CorrectAnswer = correctAnswer,
                    IsCorrect = isCorrect,
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

        public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(int userId)
        {
            //  Get results from DB
            var results = await _repo.GetByUserIdAsync(userId);

            if (!results.Any())
                return new UserAnalyticsDto();

            //  Get unique assessment IDs
            var assessmentIds = results.Select(r => r.AssessmentId).Distinct();

            var assessmentMap = new Dictionary<int, string>();

            // Call Assessment API
            foreach (var id in assessmentIds)
            {
                var res = await _http.GetAsync(
                    $"https://localhost:7219/api/assessments/internal/{id}"
                );


                if (res.IsSuccessStatusCode)
                {
                    var data = await res.Content.ReadFromJsonAsync<AssessmentDto>();
                    assessmentMap[id] = data?.Title ?? "N/A";
                }
            }

            //  final response
            return new UserAnalyticsDto
            {
                TotalTests = results.Count,
                AverageScore = results.Average(r => r.Percentage),
                BestScore = results.Max(r => r.Percentage),

                Results = results.Select(r => new ResultItemDto
                {
                    AssessmentId = r.AssessmentId,

                    AssessmentName = assessmentMap.ContainsKey(r.AssessmentId)
                        ? assessmentMap[r.AssessmentId]
                        : "Unknown",

                    Score = r.Score,
                    Percentage = r.Percentage,
                    Date = r.CreatedAt
                }).ToList()
            };
        }

    }
}