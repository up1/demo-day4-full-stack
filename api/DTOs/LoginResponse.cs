namespace api.DTOs;

public class LoginResponse
{
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
}
