using UserService.DTOs;
using UserService.Models;
using UserService.Repositories.Interfaces;
using UserService.Services.Interfaces;
using BCrypt.Net;
using UserService.Exceptions;
using Microsoft.Extensions.Logging;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository repo, JwtHelper jwtHelper, ILogger<AuthService> logger)
    {
        _repo = repo;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    // REGISTER 
    public async Task<string> RegisterAsync(RegisterDto dto)
    {
        _logger.LogInformation("Register attempt for Username: {Username}, Email: {Email}", dto.Username, dto.Email);

        //  password match
        if (dto.Password != dto.ConfirmPassword)
        {
            _logger.LogWarning("Password mismatch for Username: {Username}", dto.Username);
            throw new BadRequestException("Passwords do not match");
        }

        // username
        var existingUser = await _repo.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
        {
            _logger.LogWarning("Username already exists: {Username}", dto.Username);
            throw new BadRequestException("Username already exists");
        }

        //  email
        var existingEmail = await _repo.GetByEmailAsync(dto.Email);
        if (existingEmail != null)
        {
            _logger.LogWarning("Email already exists: {Email}", dto.Email);
            throw new BadRequestException("Email Id already exists");
        }

        // Create user
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            Role = dto.Role
        };

        await _repo.AddUserAsync(user);

        _logger.LogInformation("User successfully registered: {Username}", dto.Username);

        return "User registered successfully";
    }

    // LOGIN 
    public async Task<string> LoginAsync(LoginDto dto)
    {
        var identifier = dto.Username.Trim().ToLower();

        _logger.LogInformation("Login attempt for identifier: {Identifier}", identifier);

        var user = await _repo.GetByUsernameOrEmailAsync(identifier);

        if (user == null)
        {
            _logger.LogWarning("Login failed: user not found for {Identifier}", identifier);
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (!VerifyPassword(dto.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed: incorrect password for {Identifier}", identifier);
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        var token = _jwtHelper.GenerateToken(user);

        _logger.LogInformation("Login successful for {Identifier}", identifier);

        return token;
    }

    //  HASH PASSWORD 
    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    // VERIFY PASSWORD 
    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _repo.GetAllAsync();

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email
        }).ToList();
    }
}