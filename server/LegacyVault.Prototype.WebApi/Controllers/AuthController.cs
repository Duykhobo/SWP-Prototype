using System.ComponentModel.DataAnnotations;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Infrastructure.Persistence;
using LegacyVault.Prototype.WebApi.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[AllowAnonymous]
[EnableRateLimiting("auth")]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IOidcValidationService _oidcService;
    private readonly LegacyVaultDbContext _db;
    private readonly JwtTokenIssuer _tokens;
    private readonly PasswordHasher<UserRecord> _passwords = new();
    private readonly bool _demoEnabled;

    public AuthController(IOidcValidationService oidcService, LegacyVaultDbContext db, JwtTokenIssuer tokens,
        IWebHostEnvironment environment, IConfiguration configuration)
    {
        _oidcService = oidcService; _db = db; _tokens = tokens;
        _demoEnabled = environment.IsDevelopment() && configuration.GetValue<bool>("DemoMode:EnablePersonaLogin");
    }

    private static readonly Dictionary<string, PersonaModel> _personas = new(StringComparer.OrdinalIgnoreCase)
    {
        ["OWNER"] = new PersonaModel
        {
            PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            FullName = "Nguyễn Văn Nam",
            Email = "nam.owner@legacyvault.vn",
            Role = "OWNER",
            Roles = new[] { "OWNER" },
            Description = "Chủ sở hữu kho di sản số (Có quyền tải lên, chọn gói, gán người nhận)",
            Avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
        },
        ["EXECUTOR"] = new PersonaModel
        {
            PersonId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            FullName = "Trần Thị Bình (Luật sư)",
            Email = "binh.executor@legacyvault.vn",
            Role = "EXECUTOR",
            Roles = new[] { "EXECUTOR" },
            Description = "Người thực thi di sản (Độc lập với Owner & Beneficiary; Nộp chứng tử, hẹn ngày bàn giao)",
            Avatar = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
        },
        ["VERIFIER"] = new PersonaModel
        {
            PersonId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            FullName = "Lê Văn Cường (Công chứng viên)",
            Email = "cuong.verifier@legacyvault.vn",
            Role = "VERIFIER",
            Roles = new[] { "VERIFIER" },
            Description = "Người thẩm định pháp lý (Độc lập với 3 bên còn lại; Duyệt giấy chứng tử, xác nhận cam kết)",
            Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
        },
        ["BENEFICIARY"] = new PersonaModel
        {
            PersonId = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            FullName = "Phạm Thị Duyên",
            Email = "duyen.beneficiary@legacyvault.vn",
            Role = "BENEFICIARY",
            Roles = new[] { "BENEFICIARY" },
            Description = "Người thụ hưởng nhận di sản (Ký nhận kho 1:1 hoặc biểu quyết kho đồng sở hữu)",
            Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
        },
        ["ADMIN"] = new PersonaModel
        {
            PersonId = Guid.Parse("99999999-9999-9999-9999-999999999999"),
            FullName = "Quản trị viên Hệ thống",
            Email = "admin@legacyvault.vn",
            Role = "ADMIN",
            Roles = new[] { "ADMIN" },
            Description = "Quản trị viên kỹ thuật (Giám sát audit, kiểm tra cấu hình; Không nắm khóa giải mã)",
            Avatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
        }
    };

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim();
        if (email.Length > 320 || !new EmailAddressAttribute().IsValid(email))
            return BadRequest(new { success = false, message = "Email không hợp lệ." });
        if (request.Password.Length is < 12 or > 128 || request.FullName.Length > 200 || request.Phone?.Length > 30)
            return BadRequest(new { success = false, message = "Mật khẩu cần 12–128 ký tự; tên tối đa 200 ký tự; số điện thoại tối đa 30 ký tự." });
        var normalized = email.ToUpperInvariant();
        if (await _db.Users.AnyAsync(x => x.NormalizedEmail == normalized, ct)) return EmailConflict();
        var person = new PersonRecord { Id = Guid.NewGuid(), FullName = string.IsNullOrWhiteSpace(request.FullName) ? email.Split('@')[0] : request.FullName.Trim(), Phone = request.Phone?.Trim() };
        var user = new UserRecord { Id = Guid.NewGuid(), Person = person, PersonId = person.Id, Email = email, NormalizedEmail = normalized };
        user.PasswordHash = _passwords.HashPassword(user, request.Password);
        _db.Users.Add(user);
        try { await _db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex)) { return EmailConflict(); }
        return LoginResponse(user, "FORM_REGISTRATION");
    }

    [HttpPost("password-login")]
    public async Task<IActionResult> PasswordLogin(PasswordLoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || request.Password.Length is < 1 or > 128)
            return InvalidCredentials();
        var normalized = request.Email.Trim().ToUpperInvariant();
        var user = await _db.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.NormalizedEmail == normalized, ct);
        if (user == null || user.IsDisabled || user.IsDemo || user.PasswordHash == null) return InvalidCredentials();
        var result = _passwords.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed) return InvalidCredentials();
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwords.HashPassword(user, request.Password);
            await _db.SaveChangesAsync(ct);
        }
        return LoginResponse(user, "FORM_PASSWORD_LOGIN");
    }

    [HttpPost("google-oidc")]
    public async Task<IActionResult> ValidateGoogleOidc(GoogleOidcRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken)) return BadRequest(new { success = false, message = "ID Token is required." });
        // Audience is configured by the server; request.ClientId is retained only for wire compatibility.
        var info = await _oidcService.ValidateGoogleIdTokenAsync(request.IdToken, null, ct);
        if (!info.IsValid || string.IsNullOrWhiteSpace(info.Subject) || string.IsNullOrWhiteSpace(info.Email)) return InvalidCredentials();
        var user = await _db.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.GoogleSubject == info.Subject, ct);
        var isNew = user == null;
        if (isNew)
        {
            var normalized = info.Email.Trim().ToUpperInvariant();
            // Never implicitly link a Google identity to an existing password/demo account by email.
            if (await _db.Users.AnyAsync(x => x.NormalizedEmail == normalized, ct)) return EmailConflict();
            var person = new PersonRecord { Id = Guid.NewGuid(), FullName = info.Name.Length > 200 ? info.Name[..200] : info.Name };
            user = new UserRecord { Id = Guid.NewGuid(), Person = person, PersonId = person.Id, Email = info.Email.Trim(), NormalizedEmail = normalized, GoogleSubject = info.Subject };
            _db.Users.Add(user);
            try { await _db.SaveChangesAsync(ct); }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex)) { return EmailConflict(); }
        }
        if (user!.IsDisabled || user.IsDemo) return InvalidCredentials();
        return LoginResponse(user, "GOOGLE_OIDC_GIS", isNew);
    }

    [HttpPost("demo-login")]
    public async Task<IActionResult> DemoLogin(DemoLoginRequest request, CancellationToken ct)
    {
        if (!_demoEnabled) return NotFound();
        if (!_personas.TryGetValue(request.Role.Trim(), out var persona)) return BadRequest(new { success = false, message = "Vai trò demo không hợp lệ." });
        var normalized = persona.Email.ToUpperInvariant();
        var user = await _db.Users.Include(x => x.Person).SingleOrDefaultAsync(x => x.NormalizedEmail == normalized, ct);
        if (user == null)
        {
            var person = new PersonRecord { Id = persona.PersonId, FullName = persona.FullName };
            user = new UserRecord { Id = Guid.NewGuid(), Person = person, PersonId = person.Id, Email = persona.Email, NormalizedEmail = normalized, Roles = persona.Role, IsDemo = true };
            _db.Users.Add(user);
            try { await _db.SaveChangesAsync(ct); }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex)) { return EmailConflict(); }
        }
        if (!user.IsDemo || user.IsDisabled || user.PersonId != persona.PersonId || user.Roles != persona.Role) return Forbid();
        var token = _tokens.Issue(user);
        return Ok(new { success = true, authMethod = "DEMO_ROLE_SWITCHER", accessToken = token.Token, expiresAt = token.ExpiresAt, persona });
    }

    [HttpGet("personas")]
    public IActionResult GetPersonas() => _demoEnabled ? Ok(new { success = true, personas = _personas.Values }) : NotFound();

    [HttpGet("roles")]
    public IActionResult GetAvailableRoles() => Ok(_personas.Values.Select(x => new { role = x.Role, description = x.Description }));

    private IActionResult LoginResponse(UserRecord user, string method, bool isNewUser = false)
    {
        Response.Headers["Cache-Control"] = "no-store";
        var token = _tokens.Issue(user);
        return Ok(new { success = true, authMethod = method, isNewUser, accessToken = token.Token, expiresAt = token.ExpiresAt,
            user = new { userId = user.Id, personId = user.PersonId, email = user.Email, name = user.Person.FullName, roles = user.Roles.Split(',') } });
    }
    private IActionResult InvalidCredentials() => Unauthorized(new { success = false, message = "Thông tin đăng nhập không hợp lệ." });
    private IActionResult EmailConflict() => Conflict(new { success = false, message = "Email đã có tài khoản. Hãy đăng nhập bằng phương thức đã đăng ký." });
    private static bool IsUniqueViolation(DbUpdateException ex) => ex.InnerException is SqlException { Number: 2601 or 2627 };
}

public class GoogleOidcRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string? ClientId { get; set; }
}

public class DemoLoginRequest
{
    public string Role { get; set; } = "OWNER";
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class PasswordLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class PersonaModel
{
    public Guid PersonId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string[] Roles { get; set; } = Array.Empty<string>();
    public string Description { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
}

