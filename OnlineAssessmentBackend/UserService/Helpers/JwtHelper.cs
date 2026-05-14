using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Models;

public class JwtHelper
{
    private readonly IConfiguration _config;

    public JwtHelper(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(User user)
    {
        // ✅ 1. Claims (what info goes inside token)
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role)
        };

        // ✅ 2. Read JWT settings from config (fail‑fast)
        var key = _config["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key is missing");

        var issuer = _config["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer is missing");

        var audience = _config["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT Audience is missing");

        var expiryMinutes = int.Parse(
            _config["Jwt:ExpiryMinutes"]
                ?? throw new InvalidOperationException("JWT ExpiryMinutes is missing")
        );

        // ✅ 3. Create signing credentials
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        // ✅ 4. Create token
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        // ✅ 5. Return JWT string
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}