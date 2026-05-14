using AssessmentService.DTOs;
using AssessmentService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentService.Controllers
{
    [ApiController]
    [Route("api/questions")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _service;

        public QuestionController(IQuestionService service)
        {
            _service = service;
        }

        // ✅ CREATE
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateQuestionDto dto)
        {
            var id = await _service.CreateAsync(dto);
            return Ok(new { id = id });
        }

        // ✅ GET ALL
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        // ✅ GET BY ID
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var q = await _service.GetByIdAsync(id);

            if (q == null)
                return NotFound(new { message = "Question not found" });

            return Ok(q);
        }

        // ✅ UPDATE
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateQuestionDto dto)
        {
            return Ok(await _service.UpdateAsync(id, dto));
        }

        // ✅ DELETE
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _service.DeleteAsync(id));
        }

        // ✅ IMPORTANT (USED BY RESULT SERVICE)
        // ❌ NO AUTHORIZE → so microservice call works
        [HttpGet("assessment/{assessmentId}")]
        public async Task<IActionResult> GetByAssessment(int assessmentId)
        {
            var questions = await _service.GetByAssessmentAsync(assessmentId);

            if (questions == null || !questions.Any())
                return NotFound(new { message = "No questions found for this assessment" });

            return Ok(questions);
        }
    }
}