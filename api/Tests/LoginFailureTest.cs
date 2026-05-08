using System.Net;
using System.Net.Http.Json;
using api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace api.Tests;

public class LoginFailureTest : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public LoginFailureTest(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact(DisplayName = "TC002: Invalid email format returns 400 with email validation message")]
    public async Task Login_WithInvalidEmailFormat_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();

        var request = new LoginRequest
        {
            Email = "userexample.com",
            Password = "password123"
        };

        var response = await client.PostAsJsonAsync("/api/login", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.True(problem!.Errors.ContainsKey(nameof(LoginRequest.Email)));
        Assert.Contains(
            "Please enter a valid email address.",
            problem.Errors[nameof(LoginRequest.Email)]);
    }

    [Fact(DisplayName = "TC003: Short password returns 400 with password validation message")]
    public async Task Login_WithShortPassword_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();

        var request = new LoginRequest
        {
            Email = CustomWebApplicationFactory.TestEmail,
            Password = "pass"
        };

        var response = await client.PostAsJsonAsync("/api/login", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);
        Assert.True(problem!.Errors.ContainsKey(nameof(LoginRequest.Password)));
        Assert.Contains(
            "Password must be at least 8 characters.",
            problem.Errors[nameof(LoginRequest.Password)]);
    }

    [Fact(DisplayName = "TC004: Incorrect credentials returns 401 with invalid credentials message")]
    public async Task Login_WithIncorrectPassword_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var request = new LoginRequest
        {
            Email = CustomWebApplicationFactory.TestEmail,
            Password = "wrongpassword"
        };

        var response = await client.PostAsJsonAsync("/api/login", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(body);
        Assert.Equal("Invalid email or password", body!.Message);
        Assert.Null(body.Token);
    }

    [Fact(DisplayName = "TC004b: Unknown email returns 401 with invalid credentials message")]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var request = new LoginRequest
        {
            Email = "nobody@example.com",
            Password = "password123"
        };

        var response = await client.PostAsJsonAsync("/api/login", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(body);
        Assert.Equal("Invalid email or password", body!.Message);
    }
}
