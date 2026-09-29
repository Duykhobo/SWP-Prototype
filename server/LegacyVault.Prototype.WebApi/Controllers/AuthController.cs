using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IOidcValidationService _oidcService;

    // Bộ nhớ RAM lưu trữ User & Persona phục vụ Prototype demo
    private static readonly ConcurrentDictionary<string, UserModel> _users = new(StringComparer.OrdinalIgnoreCase);

    // Danh sách 5 vai diễn chuẩn định dạng theo Quy tắc 3 người độc lập (ASSIGN-06)
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

    static AuthController()
    {
        // Khởi tạo sẵn một tài khoản thường mẫu
        var defaultSalt = Guid.NewGuid().ToString("N");
        _users["user.demo@legacyvault.vn"] = new UserModel
        {
            PersonId = Guid.NewGuid(),
            Email = "user.demo@legacyvault.vn",
            FullName = "Người Dùng Mẫu Form",
            PasswordHash = HashPassword("Demo@123456", defaultSalt),
            PasswordSalt = defaultSalt,
            Roles = new[] { "OWNER" },
            CreatedAt = DateTime.UtcNow
        };
    }

    public AuthController(IOidcValidationService oidcService)
    {
        _oidcService = oidcService;
    }

    /// <summary>
    /// 1. Demo Login nhanh theo Role ID (1-Click Persona Switcher cho buổi bảo vệ đồ án)
    /// </summary>
    [HttpPost("demo-login")]
    public IActionResult DemoLogin([FromBody] DemoLoginRequest request)
    {
        var roleKey = request.Role?.Trim().ToUpperInvariant() ?? "OWNER";
        if (!_personas.TryGetValue(roleKey, out var persona))
        {
            return BadRequest(new 
            { 
                success = false, 
                message = $"Vai trò '{request.Role}' không hợp lệ. Hỗ trợ: OWNER, EXECUTOR, VERIFIER, BENEFICIARY, ADMIN." 
            });
        }

        var token = "jwt_demo_" + persona.Role.ToLowerInvariant() + "_" + Guid.NewGuid().ToString("N");

        return Ok(new
        {
            success = true,
            authMethod = "DEMO_ROLE_SWITCHER",
            accessToken = token,
            persona = persona,
            threePersonRuleCompliant = true,
            message = $"Đã đăng nhập thành công với vai trò demo: {persona.FullName} ({persona.Role})"
        });
    }

    /// <summary>
    /// 2. Xác thực Google OIDC Token kèm cơ chế Tự tạo tài khoản Just-In-Time (JIT Auto-Provisioning)
    /// </summary>
    [HttpPost("google-oidc")]
    public async Task<IActionResult> ValidateGoogleOidc([FromBody] GoogleOidcRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest(new { success = false, message = "ID Token is required." });
        }

        var userInfo = await _oidcService.ValidateGoogleIdTokenAsync(request.IdToken, request.ClientId, ct);
        if (!userInfo.IsValid)
        {
            return Unauthorized(new { success = false, message = "Google ID Token không hợp lệ hoặc đã hết hạn." });
        }

        // Cơ chế JIT Auto-Provisioning:
        // Nếu email này chưa từng có trong hệ thống, tự động tạo hồ sơ Person & User mới
        bool isNewUser = false;
        var user = _users.GetOrAdd(userInfo.Email, email =>
        {
            isNewUser = true;
            return new UserModel
            {
                PersonId = Guid.NewGuid(),
                Email = email,
                FullName = userInfo.Name,
                Avatar = userInfo.Picture,
                Roles = new[] { "OWNER", "BENEFICIARY" },
                IsOidcAccount = true,
                CreatedAt = DateTime.UtcNow
            };
        });

        var token = "jwt_oidc_" + Guid.NewGuid().ToString("N");

        return Ok(new
        {
            success = true,
            authMethod = "GOOGLE_OIDC_GIS",
            isNewUser = isNewUser,
            provisioningAction = isNewUser ? "JUST_IN_TIME_CREATED" : "EXISTING_USER_LOGGED_IN",
            user = new
            {
                personId = user.PersonId,
                email = user.Email,
                name = user.FullName,
                picture = userInfo.Picture,
                roles = user.Roles
            },
            accessToken = token,
            message = isNewUser 
                ? $"Chào mừng {user.FullName}! Tài khoản vừa được tự động khởi tạo từ Google Identity."
                : $"Chào mừng trở lại {user.FullName}!"
        });
    }

    /// <summary>
    /// 3. Đăng ký tài khoản thường bằng Form (Email + Password)
    /// </summary>
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            return BadRequest(new { success = false, message = "Địa chỉ email không hợp lệ." });
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return BadRequest(new { success = false, message = "Mật khẩu phải chứa ít nhất 6 ký tự." });
        }

        if (_users.ContainsKey(request.Email))
        {
            return Conflict(new { success = false, message = "Email này đã được đăng ký trong hệ thống." });
        }

        var salt = Guid.NewGuid().ToString("N");
        var newUser = new UserModel
        {
            PersonId = Guid.NewGuid(),
            Email = request.Email.Trim(),
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? request.Email.Split('@')[0] : request.FullName.Trim(),
            Phone = request.Phone?.Trim(),
            PasswordHash = HashPassword(request.Password, salt),
            PasswordSalt = salt,
            Roles = new[] { "OWNER", "BENEFICIARY" },
            CreatedAt = DateTime.UtcNow
        };

        _users[newUser.Email] = newUser;
        var token = "jwt_form_" + Guid.NewGuid().ToString("N");

        return Ok(new
        {
            success = true,
            authMethod = "FORM_REGISTRATION",
            accessToken = token,
            user = new
            {
                personId = newUser.PersonId,
                email = newUser.Email,
                name = newUser.FullName,
                roles = newUser.Roles
            },
            message = "Đăng ký tài khoản thành công! Mật khẩu được băm bảo mật theo chuẩn SEC-02."
        });
    }

    /// <summary>
    /// 4. Đăng nhập bằng Form thông thường (Email + Password)
    /// </summary>
    [HttpPost("password-login")]
    public IActionResult PasswordLogin([FromBody] PasswordLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Email và mật khẩu không được để trống." });
        }

        if (!_users.TryGetValue(request.Email.Trim(), out var user) || user.IsOidcAccount)
        {
            return Unauthorized(new { success = false, message = "Email hoặc mật khẩu không chính xác." });
        }

        var computedHash = HashPassword(request.Password, user.PasswordSalt);
        if (computedHash != user.PasswordHash)
        {
            return Unauthorized(new { success = false, message = "Email hoặc mật khẩu không chính xác." });
        }

        var token = "jwt_form_" + Guid.NewGuid().ToString("N");

        return Ok(new
        {
            success = true,
            authMethod = "FORM_PASSWORD_LOGIN",
            accessToken = token,
            user = new
            {
                personId = user.PersonId,
                email = user.Email,
                name = user.FullName,
                roles = user.Roles
            },
            message = "Đăng nhập thành công!"
        });
    }

    /// <summary>
    /// 5. Lấy danh sách toàn bộ các vai trò và persona mẫu
    /// </summary>
    [HttpGet("personas")]
    public IActionResult GetPersonas()
    {
        return Ok(new
        {
            success = true,
            personas = _personas.Values,
            separationRule = "Tam quyền phân lập theo ASSIGN-06: Owner, Executor, Verifier bắt buộc là 3 Person ID khác nhau"
        });
    }

    [HttpGet("roles")]
    public IActionResult GetAvailableRoles()
    {
        return Ok(new[]
        {
            new { role = "OWNER", description = "Chủ sở hữu kho di sản" },
            new { role = "EXECUTOR", description = "Người thực thi di sản" },
            new { role = "VERIFIER", description = "Công chứng viên / Người thẩm định chứng tử" },
            new { role = "BENEFICIARY", description = "Người thụ hưởng / nhận di sản" },
            new { role = "ADMIN", description = "Quản trị viên hệ thống (Không nắm khóa giải mã)" }
        });
    }

    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + ":" + salt));
        return Convert.ToHexString(bytes);
    }
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

public class UserModel
{
    public Guid PersonId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public string[] Roles { get; set; } = Array.Empty<string>();
    public string? Avatar { get; set; }
    public bool IsOidcAccount { get; set; }
    public DateTime CreatedAt { get; set; }
}
