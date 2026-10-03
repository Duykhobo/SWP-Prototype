using LegacyVault.Prototype.Domain.Entities;
using LegacyVault.Prototype.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

public class DbContextWhiteBoxTests
{
    private LegacyVaultDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<LegacyVaultDbContext>()
            .UseInMemoryDatabase(databaseName: $"LegacyVault_TestDb_{Guid.NewGuid():N}")
            .Options;

        return new LegacyVaultDbContext(options);
    }

    [Fact]
    public async Task PersonAndUser_CanBePersistedAndQueried_WithOneToOneRelation()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var person = new Person
        {
            Id = Guid.NewGuid(),
            FullName = "Nguyễn Văn Nam",
            Email = "nam.owner@legacyvault.vn",
            IdentityCard = "079095001234",
            PhoneNumber = "0901234567"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            PersonId = person.Id,
            Email = person.Email,
            PasswordHash = "hash123",
            PasswordSalt = "salt123",
            Roles = "OWNER",
            Status = "ACTIVE"
        };

        // Act
        context.Persons.Add(person);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Assert
        var savedUser = await context.Users
            .Include(u => u.Person)
            .FirstOrDefaultAsync(u => u.Email == person.Email);

        Assert.NotNull(savedUser);
        Assert.NotNull(savedUser.Person);
        Assert.Equal("Nguyễn Văn Nam", savedUser.Person.FullName);
    }

    [Fact]
    public async Task Case_CanHaveMultipleCaseBundles_WithIndependentSnapshots()
    {
        // Arrange: 1 Case với 2 Bundle độc lập (Bundle 1 cho con cái, Bundle 2 cho đối tác)
        using var context = CreateInMemoryDbContext();
        var caseId = Guid.NewGuid();
        var vaultId = Guid.NewGuid();
        var executorPersonId = Guid.NewGuid();

        var estateCase = new Case
        {
            Id = caseId,
            VaultId = vaultId,
            EstatePlanId = Guid.NewGuid(),
            ExecutorPersonId = executorPersonId,
            Status = "APPROVED",
            SubmittedAt = DateTime.UtcNow.AddDays(-2),
            DecidedAt = DateTime.UtcNow.AddDays(-1)
        };

        // Bundle 1: Tài sản gia đình
        var bundle1 = new CaseBundle
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            Title = "Gói 1: Bất động sản và kỷ niệm",
            RecipientMode = "CO_OWNED",
            NormalizedRecipientSet = "ben_child_1,ben_child_2",
            Status = "PENDING_RESPONSE"
        };

        bundle1.Items.Add(new CaseBundleItem
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundle1.Id,
            AssetId = Guid.NewGuid(),
            ContentVersionId = Guid.NewGuid(),
            AssetDesignationVersionId = Guid.NewGuid(),
            Title = "So_do_nha_dat.pdf",
            FileSizeBytes = 2500000,
            CiphertextHash = "abc123hash",
            CiphertextStorageKey = "vaults/v1/versions/ver1.enc"
        });

        // Bundle 2: Tài sản kinh doanh
        var bundle2 = new CaseBundle
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            Title = "Gói 2: Khóa bảo mật công ty",
            RecipientMode = "SINGLE_RECIPIENT",
            NormalizedRecipientSet = "ben_partner",
            Status = "PENDING_RESPONSE"
        };

        bundle2.Items.Add(new CaseBundleItem
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundle2.Id,
            AssetId = Guid.NewGuid(),
            ContentVersionId = Guid.NewGuid(),
            AssetDesignationVersionId = Guid.NewGuid(),
            Title = "Server_Root_Key.kdbx",
            FileSizeBytes = 500000,
            CiphertextHash = "def456hash",
            CiphertextStorageKey = "vaults/v1/versions/ver2.enc"
        });

        estateCase.CaseBundles.Add(bundle1);
        estateCase.CaseBundles.Add(bundle2);

        // Act
        context.Cases.Add(estateCase);
        await context.SaveChangesAsync();

        // Assert
        var savedCase = await context.Cases
            .Include(c => c.CaseBundles)
                .ThenInclude(b => b.Items)
            .FirstOrDefaultAsync(c => c.Id == caseId);

        Assert.NotNull(savedCase);
        Assert.Equal(2, savedCase.CaseBundles.Count);

        var b1 = savedCase.CaseBundles.FirstOrDefault(b => b.Title.Contains("Gói 1"));
        Assert.NotNull(b1);
        Assert.Single(b1.Items);
        Assert.Equal("So_do_nha_dat.pdf", b1.Items[0].Title);

        var b2 = savedCase.CaseBundles.FirstOrDefault(b => b.Title.Contains("Gói 2"));
        Assert.NotNull(b2);
        Assert.Single(b2.Items);
        Assert.Equal("Server_Root_Key.kdbx", b2.Items[0].Title);
    }

    [Fact]
    public async Task HandoverConsensusFlow_DecisionsToCommitmentToGrantToReceipt()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var caseId = Guid.NewGuid();
        var bundleId = Guid.NewGuid();
        var ben1 = Guid.NewGuid();
        var ben2 = Guid.NewGuid();

        var bundle = new CaseBundle
        {
            Id = bundleId,
            CaseId = caseId,
            Title = "Kho Đồng Thừa Hưởng",
            RecipientMode = "CO_OWNED",
            NormalizedRecipientSet = $"{ben1},{ben2}",
            Status = "PENDING_RESPONSE"
        };
        context.CaseBundles.Add(bundle);

        // 1. Quyết định cá nhân của ben1 và ben2 (khi chưa đạt cam kết nhóm thì CommitmentId == null)
        var dec1 = new BeneficiaryHandoverDecision
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundleId,
            RecipientPersonId = ben1,
            DecisionStatus = "ACCEPTED",
            LegalAcknowledgment = true,
            DecidedAt = DateTime.UtcNow
        };
        var dec2 = new BeneficiaryHandoverDecision
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundleId,
            RecipientPersonId = ben2,
            DecisionStatus = "ACCEPTED",
            LegalAcknowledgment = true,
            DecidedAt = DateTime.UtcNow
        };
        context.BeneficiaryHandoverDecisions.AddRange(dec1, dec2);
        await context.SaveChangesAsync();

        // 2. Cả 2 đồng ý -> Tạo Commitment nhóm chốt 2 quyết định
        var commitment = new Commitment
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundleId,
            CaseId = caseId,
            PolicyMode = "ALL_OR_NOTHING",
            LegalAcknowledgment = "Cam kết tập thể đồng thuận 100%",
            CommittedAt = DateTime.UtcNow
        };

        dec1.CommitmentId = commitment.Id;
        dec2.CommitmentId = commitment.Id;
        context.Commitments.Add(commitment);

        // 3. Phát hành AccessGrant cho ben1 và ben2
        var grant1 = new AccessGrant
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundleId,
            CaseId = caseId,
            RecipientPersonId = ben1,
            CommitmentId = commitment.Id,
            Status = "ACTIVE",
            ExpiresAt = DateTime.UtcNow.AddHours(72)
        };
        var grant2 = new AccessGrant
        {
            Id = Guid.NewGuid(),
            CaseBundleId = bundleId,
            CaseId = caseId,
            RecipientPersonId = ben2,
            CommitmentId = commitment.Id,
            Status = "ACTIVE",
            ExpiresAt = DateTime.UtcNow.AddHours(72)
        };
        context.AccessGrants.AddRange(grant1, grant2);

        // 4. Ben 1 tải file -> Ghi DownloadEvent máy chủ phục vụ
        var downloadEvent = new DownloadEvent
        {
            Id = Guid.NewGuid(),
            AccessGrantId = grant1.Id,
            CaseBundleId = bundleId,
            AssetId = Guid.NewGuid(),
            ContentVersionId = Guid.NewGuid(),
            BytesServed = 1048576,
            ServedAt = DateTime.UtcNow,
            ClientIpAddress = "127.0.0.1"
        };
        context.DownloadEvents.Add(downloadEvent);

        // 5. Ben 1 ký xác nhận hoàn tất -> HandoverReceipt
        var receipt = new HandoverReceipt
        {
            ReceiptId = Guid.NewGuid(),
            AccessGrantId = grant1.Id,
            CaseBundleId = bundleId,
            BeneficiaryPersonId = ben1,
            ReceiptNumber = "RCP-LV-20261003-BEN1",
            ReceivedAt = DateTime.UtcNow,
            SignatureType = "ELECTRONIC_RECEIPT_SIGNATURE",
            SignatureHash = "sha256_of_signature",
            ReceiptContentHash = "sha256_of_receipt_content",
            ReceiptAuditDigest = "SHA256:audit_digest_123"
        };
        context.HandoverReceipts.Add(receipt);

        await context.SaveChangesAsync();

        // Assert
        var savedCommitment = await context.Commitments
            .Include(c => c.Decisions)
            .Include(c => c.AccessGrants)
            .FirstOrDefaultAsync(c => c.Id == commitment.Id);

        Assert.NotNull(savedCommitment);
        Assert.Equal(2, savedCommitment.Decisions.Count);
        Assert.Equal(2, savedCommitment.AccessGrants.Count);

        var savedReceipt = await context.HandoverReceipts
            .Include(r => r.AccessGrant)
            .FirstOrDefaultAsync(r => r.ReceiptNumber == "RCP-LV-20261003-BEN1");

        Assert.NotNull(savedReceipt);
        Assert.Equal(grant1.Id, savedReceipt.AccessGrantId);
    }
}
