using api.DTOs;
using FluentValidation;

namespace api.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Please enter a valid email address.")
            .EmailAddress().WithMessage("Please enter a valid email address.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password must be at least 8 characters.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.");
    }
}
