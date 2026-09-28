namespace LegacyVault.Prototype.Domain.Models;

public class EkycOcrResult
{
    public bool Success { get; set; }
    public string IdCardNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public string HomeAddress { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string Provider { get; set; } = "FPT.AI"; // Chuẩn eKYC FPT.AI
    public bool IsTampered { get; set; } = false;
    public bool ReviewRequired { get; set; } = false;
    public string RawJson { get; set; } = string.Empty;
}

public class EkycLivenessResult
{
    public bool Success { get; set; }
    public bool IsLive { get; set; }
    public double MatchScore { get; set; } // Tỉ lệ khớp khuôn mặt với CCCD (0.0 -> 1.0)
    public bool IsFaceMatched => MatchScore >= 0.80; // Ngưỡng an toàn 80%
    public bool ReviewRequired { get; set; } = false;
    public string Provider { get; set; } = "FPT.AI";
    public string Message { get; set; } = string.Empty;
}
