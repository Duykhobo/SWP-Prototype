using LegacyVault.Prototype.Application.Services;
using LegacyVault.Prototype.Domain;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

/// <summary>
/// Kiểm thử cấu trúc White-box theo ISTQB Chương 4.4 (trang 105-113).
/// Đo lường Statement Coverage, Decision Coverage và MC/DC (Mục 4.4.4, trang 113) trên code thực tế.
/// </summary>
public class EstatePlanRulesWhiteBoxTests
{
    private readonly EstatePlanRulesService _service = new();

    #region WB-01: MC/DC trên biểu thức cam kết pháp lý: executorAttested && verifierAttested
    /*
    Biểu thức nguyên văn trong EstatePlanRulesService.cs dòng 206:
    return executorAttested && verifierAttested;

    Tách các điều kiện nguyên tử:
    - C1: executorAttested
    - C2: verifierAttested
    Quyết định D: C1 AND C2

    Bảng chân trị (Truth Table):
    | Test ID | C1 | C2 | D (Kết quả) | Mục đích kiểm thử |
    | :--- | :---: | :---: | :---: | :--- |
    | WB_MCDC_01 | T | T | T | Cả 2 đều cam kết |
    | WB_MCDC_02 | T | F | F | Verifier chưa cam kết |
    | WB_MCDC_03 | F | T | F | Executor chưa cam kết |
    | WB_MCDC_04 | F | F | F | Cả 2 chưa cam kết |

    Cặp thử nghiệm MC/DC (Independence Pairs):
    - Đối với điều kiện C1: Cặp (WB_MCDC_01, WB_MCDC_03): C1 thay đổi từ T -> F, C2 giữ nguyên T, Quyết định D đổi từ T -> F.
    - Đối với điều kiện C2: Cặp (WB_MCDC_01, WB_MCDC_02): C2 thay đổi từ T -> F, C1 giữ nguyên T, Quyết định D đổi từ T -> F.
    => Đạt 100% MC/DC với 3 test cases: {WB_MCDC_01, WB_MCDC_02, WB_MCDC_03}.
    */

    [Fact]
    public void WB_MCDC_01_BothAttested_ReturnsTrue()
    {
        // C1 = T, C2 = T -> D = T
        bool decision = _service.ValidateDeathAttestation(true, true);
        Assert.True(decision);
    }

    [Fact]
    public void WB_MCDC_02_VerifierNotAttested_ReturnsFalse()
    {
        // C1 = T, C2 = F -> D = F
        bool decision = _service.ValidateDeathAttestation(true, false);
        Assert.False(decision);
    }

    [Fact]
    public void WB_MCDC_03_ExecutorNotAttested_ReturnsFalse()
    {
        // C1 = F, C2 = T -> D = F
        bool decision = _service.ValidateDeathAttestation(false, true);
        Assert.False(decision);
    }
    #endregion

    #region WB-02: Decision & Statement Coverage trên ValidateThreePersonRule
    /*
    Biểu thức 1: bool isDistinctThree = (ownerId != executorId) && (ownerId != verifierId) && (executorId != verifierId);
    Biểu thức 2: bool hasConflictWithBeneficiary = benSet.Contains(executorId) || benSet.Contains(verifierId);
    */

    [Fact]
    public void WB_ThreePersonRule_AllDistinct_NoBeneficiaryConflict_BranchTrue()
    {
        // Branch 1: Hợp lệ hoàn toàn (isDistinctThree = True, hasConflict = False)
        var owner = Guid.NewGuid();
        var exec = Guid.NewGuid();
        var verifier = Guid.NewGuid();
        var beneficiaries = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

        bool valid = _service.ValidateThreePersonRule(owner, exec, verifier, beneficiaries, out string? err);

        Assert.True(valid);
        Assert.Null(err);
    }

    [Fact]
    public void WB_ThreePersonRule_OwnerEqualsExecutor_BranchFalse()
    {
        // Branch 2: owner == executor
        var person = Guid.NewGuid();
        var verifier = Guid.NewGuid();
        var beneficiaries = new List<Guid> { Guid.NewGuid() };

        bool valid = _service.ValidateThreePersonRule(person, person, verifier, beneficiaries, out string? err);

        Assert.False(valid);
        Assert.Equal(ErrorCodes.ERR_ROLE_THREE_PERSON_CONFLICT, err);
    }

    [Fact]
    public void WB_ThreePersonRule_ExecutorEqualsVerifier_BranchFalse()
    {
        // Branch 3: executor == verifier
        var owner = Guid.NewGuid();
        var person = Guid.NewGuid();
        var beneficiaries = new List<Guid> { Guid.NewGuid() };

        bool valid = _service.ValidateThreePersonRule(owner, person, person, beneficiaries, out string? err);

        Assert.False(valid);
        Assert.Equal(ErrorCodes.ERR_ROLE_THREE_PERSON_CONFLICT, err);
    }

    [Fact]
    public void WB_ThreePersonRule_ExecutorIsBeneficiary_BranchFalse()
    {
        // Branch 4: executor nằm trong danh sách Beneficiaries
        var owner = Guid.NewGuid();
        var exec = Guid.NewGuid();
        var verifier = Guid.NewGuid();
        var beneficiaries = new List<Guid> { exec, Guid.NewGuid() };

        bool valid = _service.ValidateThreePersonRule(owner, exec, verifier, beneficiaries, out string? err);

        Assert.False(valid);
        Assert.Equal(ErrorCodes.ERR_BENEFICIARY_ROLE_CONFLICT, err);
    }
    #endregion
}
