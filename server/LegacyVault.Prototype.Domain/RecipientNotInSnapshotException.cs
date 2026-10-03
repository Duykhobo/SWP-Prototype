namespace LegacyVault.Prototype.Domain;

public sealed class RecipientNotInSnapshotException() : UnauthorizedAccessException(ErrorCodes.FORBIDDEN_RECIPIENT_NOT_IN_SNAPSHOT);
