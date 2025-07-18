namespace backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
[ApiController]
[Route("auth")]

public class AuthController : ControllerBase
{
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
        if(isAuth == true)
            return Ok(token);
        return Ok("not authenticated");
    }

}   