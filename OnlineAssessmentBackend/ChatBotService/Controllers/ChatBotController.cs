
using ChatBotService.DTOs;
using ChatBotService.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChatBotService.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatBotController : ControllerBase
    {
        private readonly GeminiService _service;

        public ChatBotController(GeminiService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
        {
            var reply = await _service.AskAsync(dto.Message);

            return Ok(new { reply });
        }



    }
}