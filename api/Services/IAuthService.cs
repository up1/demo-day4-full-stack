using api.DTOs;

namespace api.Services;

public interface IAuthService
{
    Task<(bool Success, string? Token, string Message)> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
