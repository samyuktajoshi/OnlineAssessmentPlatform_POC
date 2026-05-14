using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubmissionService.DTOs;
using SubmissionService.Services.Interfaces;

namespace SubmissionService.Controllers
{
    [ApiController]
    [Route("api/submissions")]
    public class SubmissionController : ControllerBase
    {
        private readonly ISubmissionService _service;

        public SubmissionController(ISubmissionService service)
        {
            _service = service;
        }

        // ✅ SUBMIT TEST
        [Authorize(Roles = "Candidate")]
        [HttpPost]
        public async Task<IActionResult> Submit(SubmitTestDto dto)
        {
            var id = await _service.SubmitAsync(dto, User);
            return Ok(new { submissionId = id });
        }

        // 🚨 VERY IMPORTANT (FOR RESULT SERVICE)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            return Ok(data);
        }
    }
}