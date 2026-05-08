using System.Net;
using System.Net.Http.Json;
using api.DTOs;
using Xunit;

namespace api.Tests;

public class LoginSuccessTest : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public LoginSuccessTest(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact(DisplayName = "TC001: Valid login returns 200 with success message and JWT token")]
    public async Task Login_WithValidCredentials_ReturnsOkAndToken()
    {
        var client = _factory.CreateClient();

        var request = new LoginRequest
        {
            Email = CustomWebApplicationFactory.TestEmail,
            Password = CustomWebApplicationFactory.TestPassword
        };

        var response = await client.PostAsJsonAsync("/api/login", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(body);
        Assert.Equal("Login successful", body!.Message);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }
}
