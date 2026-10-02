namespace LegacyVault.Prototype.Application.Interfaces;

public interface ILiveKitVideoService
{
    string GenerateJoinToken(
        string roomName, 
        string participantIdentity, 
        string participantName, 
        TimeSpan ttl);

    Task<bool> DeleteRoomAsync(string roomName, CancellationToken ct = default);

    bool VerifyWebhookSignature(string? authHeader, byte[] rawBody);
}
