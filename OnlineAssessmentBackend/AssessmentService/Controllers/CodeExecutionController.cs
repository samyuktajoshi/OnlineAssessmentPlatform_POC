using AssessmentService.DTOs;
using AssessmentService.Services;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentService.Controllers
{
    [ApiController]
    [Route("api/code")]
    public class CodeExecutionController : ControllerBase
    {
        private readonly CodeExecutionService _service;

        public CodeExecutionController(CodeExecutionService service)
        {
            _service = service;
        }

        [HttpPost("run")]
        public async Task<IActionResult> Run([FromBody] RunCodeDto dto)
        {
            var output = await _service.RunCodeAsync(dto.Code, dto.Input);

            return Ok(new { output });
        }
    }
}