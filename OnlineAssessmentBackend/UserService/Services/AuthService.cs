using UserService.DTOs;
using UserService.Models;
using UserService.Repositories.Interfaces;
using UserService.Services.Interfaces;
using BCrypt.Net;
using UserService.Exceptions;
public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly JwtHelper _jwtHelper;

    public AuthService(IUserRepository repo, JwtHelper jwtHelper)
    {
        _repo = repo;
        _jwtHelper = jwtHelper;
    }

    // -------------------- REGISTER --------------------
    public async Task<string> RegisterAsync(RegisterDto dto)
    {
        // Validate password match
        if (dto.Password != dto.ConfirmPassword)
            throw new BadRequestException("Passwords do not match");
        // Check username
        var existingUser = await _repo.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
            throw new BadRequestException("Username already exists");
        // Check email
        var existingEmail = await _repo.GetByEmailAsync(dto.Email);
        if (existingEmail != null)
            throw new BadRequestException("Email Id already exists");
        // Create user
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password), // 🔐 BCrypt
            Role = dto.Role
        };

        await _repo.AddUserAsync(user);

        return "User registered successfully";
    }

    // -------------------- LOGIN --------------------
    public async Task<string> LoginAsync(LoginDto dto)
    {
        var user = await _repo.GetByUsernameAsync(dto.Username);

        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        return _jwtHelper.GenerateToken(user);
    }

    // -------------------- HASH PASSWORD --------------------
    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    // -------------------- VERIFY PASSWORD --------------------
    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}