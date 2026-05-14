using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResultService.Services.Interfaces;

namespace ResultService.Controllers
{
    [ApiController]
    [Route("api/results")]
    public class ResultController : ControllerBase
    {
        private readonly IResultService _service;

        public ResultController(IResultService service)
        {
            _service = service;
        }

        // ✅ CALCULATE RESULT (Candidate)
        [Authorize(Roles = "Candidate")]
        [HttpPost("{submissionId}")]
        public async Task<IActionResult> Calculate(int submissionId)
        {
            var result = await _service.CalculateAsync(submissionId, User);
            return Ok(result);
        }

        // ✅ MY RESULTS (Candidate)
        [Authorize(Roles = "Candidate")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyResults()
        {
            var results = await _service.GetByUserIdAsync(User);
            return Ok(results);
        }

        // ✅ ALL RESULTS (Admin)
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllResults()
        {
            return Ok(await _service.GetAllAsync());
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("analytics/{assessmentId}")]
        public async Task<IActionResult> Analytics(int assessmentId)
        {
            return Ok(await _service.GetAnalyticsAsync(assessmentId));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("leaderboard/{assessmentId}")]
        public async Task<IActionResult> Leaderboard(int assessmentId)
        {
            return Ok(await _service.GetLeaderboardAsync(assessmentId));
        }

        [Authorize(Roles = "Candidate")]
        [HttpGet("my/analytics")]
        public async Task<IActionResult> MyAnalytics()
        {
            return Ok(await _service.GetMyAnalyticsAsync(User));
        }
        [Authorize(Roles = "Candidate")]
        [HttpGet("by-submission/{submissionId}")]
        public async Task<IActionResult> GetBySubmission(int submissionId)
        {
            var result = await _service.GetResultBySubmissionIdAsync(submissionId);
            return Ok(result);
        }

        [HttpGet("details/{submissionId}")]
        public async Task<IActionResult> GetDetailedResult(int submissionId)
        {
            var result = await _service.GetDetailedResultAsync(submissionId);
            return Ok(result);
        }

    }
}