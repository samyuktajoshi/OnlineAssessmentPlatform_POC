using AssessmentService.DTOs;
using AssessmentService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentService.Controllers
{
    [ApiController]
    [Route("api/assessment-questions")]
    public class AssessmentQuestionController : ControllerBase
    {
        private readonly IAssessmentQuestionService _service;

        public AssessmentQuestionController(IAssessmentQuestionService service)
        {
            _service = service;
        }

        // ✅ ADD QUESTION
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Add(AddQuestionToAssessmentDto dto)
        {
            return Ok(await _service.AddQuestionAsync(dto));
        }

        // ✅ GET QUESTIONS (Admin view)
        [Authorize(Roles = "Admin")]
        [HttpGet("{assessmentId}")]
        public async Task<IActionResult> Get(int assessmentId)
        {
            return Ok(await _service.GetQuestionsByAssessmentAsync(assessmentId));
        }

        // ✅ REMOVE QUESTION
        [Authorize(Roles = "Admin")]
        [HttpDelete]
        public async Task<IActionResult> Remove(AddQuestionToAssessmentDto dto)
        {
            return Ok(await _service.RemoveQuestionAsync(dto.AssessmentId, dto.QuestionId));
        }
        [Authorize]
        [HttpGet("{assessmentId}/user")]
        public async Task<IActionResult> GetForCandidate(int assessmentId)
        {
            return Ok(await _service.GetQuestionsForCandidateAsync(assessmentId));
        }
    }
}