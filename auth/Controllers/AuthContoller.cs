using auth.Data;
using auth.Extensions;
using auth.Models;
using auth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace auth.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthController> _logger;
    private readonly JwtService _jwtService;
    public AuthController(ApplicationDbContext context, ILogger<AuthController> logger, JwtService jwtService)
    {
        _context = context;
        _logger = logger;
        _jwtService = jwtService;
    }

    [HttpGet("without")]
    public async Task<IActionResult> GetTokenWithoutAuth()
    {
        await Task.Delay(1);
        var token = Environment.GetEnvironmentVariable("JWT_TOKEN_SECRET_KEY");

        return Ok(token);
    }


    [Authorize]
    [HttpGet("with")]
    public async Task<IActionResult> GetTokenWithAuth()
    {
        await Task.Delay(1);

        var token = Environment.GetEnvironmentVariable("JWT_TOKEN_SECRET_KEY");
        var isAuth = User?.Identity?.IsAuthenticated;
        if (isAuth == true)
            return Ok(token);
        return Ok("not authenticated");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel loginModel, CancellationToken cts)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username== loginModel.username, cts);

        if (user is null)
            throw new Exception($"user not found with username {loginModel.username}");

        var checkPasswordResult = BCrypt.Net.BCrypt.EnhancedVerify(loginModel.password, user.HashPassword);

        if (!checkPasswordResult)
        {
            _logger.LogWarning($"User {user.Username} provided an incorrect password");
            throw new Exception("wrond password");
        }

        _logger.LogInformation($"user with username {user.Username} logged in");
        
        var token = await _jwtService.GenerateTokenAsync(user, cts);
        HttpContext.Response
            .SetAuthCooke(token);
        var response = new
        {
            user.Username,
            token
        };

        return Ok(response);
    }
    [HttpPost("logout")]
    public async Task Logout(string id, CancellationToken cts)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id, cts);
        if (user is null)
            throw new Exception($"User with id {id} not found");

        _logger.LogInformation($"User {user.Username} logged out.");
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register(string username, string password, CancellationToken cts)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            return BadRequest("Username and password are required.");
        }

        var isUserExists = await _context.Users.AnyAsync(u => u.Username == username, cts);
        if (isUserExists)
        {
            return Conflict("User already exists.");
        }

        var newUser = new User
        {
            Username = username,
            HashPassword = BCrypt.Net.BCrypt.EnhancedHashPassword(password)
        };

        await _context.Users.AddAsync(newUser, cts);
        await _context.SaveChangesAsync(cts);

        _logger.LogInformation($"User with username {newUser.Username} was successfully registered.");

        var token = await _jwtService.GenerateTokenAsync(newUser, cts);

        var response = new
        {
            newUser.Username,
            token,
        };
        HttpContext.Response
            .SetAuthCooke(token);
        
        return Ok(response);
    }

}   