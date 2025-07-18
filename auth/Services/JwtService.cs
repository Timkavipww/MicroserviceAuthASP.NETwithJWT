using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using auth.Data;
using auth.Models;
using Microsoft.IdentityModel.Tokens;

namespace auth.Services;

public class JwtService
{
    private readonly ApplicationDbContext _context;

    public JwtService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<string> GenerateTokenAsync(User user, CancellationToken cts)
    {
        var tokenhandler = new JwtSecurityTokenHandler();

        var key = Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_TOKEN_SECRET_KEY")!);

        var credentials = new SigningCredentials
        (
             new SymmetricSecurityKey(key),
             SecurityAlgorithms.HmacSha256
        );

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.Username),
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddMinutes(double.Parse(Environment.GetEnvironmentVariable("JWT_TOKEN_VALIDATE_TIME")!)),
            SigningCredentials = credentials
        };

        var token = tokenhandler.CreateToken(tokenDescriptor);

        return tokenhandler.WriteToken(token);

    }
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    }
    
}
