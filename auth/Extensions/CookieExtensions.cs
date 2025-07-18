using auth.Models;

namespace auth.Extensions;
public static class CookieExtensions
{
    public static void SetAuthCooke(this HttpResponse response, string token)
    {
        response.Cookies.Append(CookieNames.jwtCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.Now.AddDays(1),
            Path = "/"
        });

    }
    public static void DeleteAuthCookie(this HttpResponse response)
    {
        response.Cookies.Delete(CookieNames.jwtCookieName);
    }
}