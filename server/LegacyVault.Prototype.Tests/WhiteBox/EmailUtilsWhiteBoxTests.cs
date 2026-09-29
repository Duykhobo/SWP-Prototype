using LegacyVault.Prototype.Application.Common;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

/// <summary>
/// Kiểm thử cấu trúc White-box cho EmailUtils.cs theo ISTQB Chương 4.4.
/// </summary>
public class EmailUtilsWhiteBoxTests
{
    #region WB-05: MaskEmail Branch Testing
    /*
    Biểu thức 1 (dòng 29): if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
    Biểu thức 2 (dòng 38): if (local.Length <= 2)
    */

    [Theory]
    [InlineData(null, "***")]                     // Branch 1.1: null
    [InlineData("", "***")]                       // Branch 1.2: empty
    [InlineData("invalid_no_at", "***")]          // Branch 1.3: không có @
    [InlineData("a@domain.com", "a***@domain.com")] // Branch 2.1: local.Length = 1 (<= 2)
    [InlineData("ab@domain.com", "a***@domain.com")] // Branch 2.2: local.Length = 2 (<= 2)
    [InlineData("thanhduy@gmail.com", "th***y@gmail.com")] // Branch 2.3: local.Length > 2
    public void WB_MaskEmail_AllBranchesCovered(string? input, string expected)
    {
        string actual = EmailUtils.MaskEmail(input);
        Assert.Equal(expected, actual);
    }
    #endregion

    #region WB-06: SmtpEnvironmentStatus Decision Testing
    [Fact]
    public void WB_CheckEnvironmentVariables_Execution_CoversAllStatements()
    {
        var status = EmailUtils.CheckEnvironmentVariables();
        Assert.NotNull(status);
        Assert.False(string.IsNullOrEmpty(status.Host));
        Assert.False(string.IsNullOrEmpty(status.GuidanceMessage));
    }
    #endregion
}
