using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using UserService.DTOs;
using UserService.Services.Interfaces;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService service, ILogger<AuthController> logger)
    {
        _service = service;
        _logger = logger;
    }

    // -------------------- REGISTER --------------------
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _logger.LogInformation("Register request for {Username}", dto.Username);

        var result = await _service.RegisterAsync(dto);
        return Ok(new { message = result });
    }

    // -------------------- LOGIN --------------------
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        _logger.LogInformation("Login attempt for {Username}", dto.Username);

        var token = await _service.LoginAsync(dto);
        return Ok(new { token });
    }

    // -------------------- TEST AUTH --------------------
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            Username = User.Identity?.Name,
            Role = User.Claims.FirstOrDefault(c => c.Type.Contains("role"))?.Value
        });
    }

    // -------------------- ADMIN TEST --------------------
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult AdminOnly()
    {
        return Ok("Admin access granted");
    }

    // -------------------- CANDIDATE TEST --------------------
    [Authorize(Roles = "Candidate")]
    [HttpGet("candidate")]
    public IActionResult CandidateOnly()
    {
        return Ok("Candidate access granted");
    }
}