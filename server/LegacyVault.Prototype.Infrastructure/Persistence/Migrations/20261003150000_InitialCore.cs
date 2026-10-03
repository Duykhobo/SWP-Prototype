using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace LegacyVault.Prototype.Infrastructure.Persistence.Migrations;

[DbContext(typeof(LegacyVaultDbContext))]
[Migration("20261003150000_InitialCore")]
public class InitialCore : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
CREATE TABLE [Persons] (
    [Id] uniqueidentifier NOT NULL,
    [FullName] nvarchar(200) NOT NULL,
    [Phone] nvarchar(30) NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Persons] PRIMARY KEY ([Id])
);
CREATE TABLE [Users] (
    [Id] uniqueidentifier NOT NULL,
    [PersonId] uniqueidentifier NOT NULL,
    [Email] nvarchar(320) NOT NULL,
    [NormalizedEmail] nvarchar(320) NOT NULL,
    [PasswordHash] nvarchar(1000) NULL,
    [GoogleSubject] nvarchar(255) NULL,
    [Roles] nvarchar(200) NOT NULL,
    [IsDisabled] bit NOT NULL,
    [IsDemo] bit NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Users_Persons_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [Persons] ([Id])
);
CREATE UNIQUE INDEX [IX_Users_NormalizedEmail] ON [Users] ([NormalizedEmail]);
CREATE UNIQUE INDEX [IX_Users_GoogleSubject] ON [Users] ([GoogleSubject]) WHERE [GoogleSubject] IS NOT NULL;
CREATE UNIQUE INDEX [IX_Users_PersonId] ON [Users] ([PersonId]);
CREATE TABLE [Cases] (
    [Id] uniqueidentifier NOT NULL,
    [OwnerPersonId] uniqueidentifier NOT NULL,
    [ExecutorPersonId] uniqueidentifier NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [SubmittedAt] datetimeoffset NULL,
    [RescueHold] bit NOT NULL,
    [SecurityHold] bit NOT NULL,
    [LegalHold] bit NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Cases] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Cases_Persons_OwnerPersonId] FOREIGN KEY ([OwnerPersonId]) REFERENCES [Persons] ([Id]),
    CONSTRAINT [FK_Cases_Persons_ExecutorPersonId] FOREIGN KEY ([ExecutorPersonId]) REFERENCES [Persons] ([Id])
);
CREATE INDEX [IX_Cases_OwnerPersonId] ON [Cases] ([OwnerPersonId]);
CREATE INDEX [IX_Cases_ExecutorPersonId] ON [Cases] ([ExecutorPersonId]);
CREATE TABLE [CaseBundles] (
    [Id] uniqueidentifier NOT NULL,
    [CaseId] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [GroupPolicy] nvarchar(30) NOT NULL,
    [SnapshottedAt] datetimeoffset NULL,
    [HandoverNotBefore] datetimeoffset NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_CaseBundles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CaseBundles_Cases_CaseId] FOREIGN KEY ([CaseId]) REFERENCES [Cases] ([Id])
);
CREATE INDEX [IX_CaseBundles_CaseId] ON [CaseBundles] ([CaseId]);
CREATE TABLE [CaseBundleItems] (
    [Id] uniqueidentifier NOT NULL,
    [CaseBundleId] uniqueidentifier NOT NULL,
    [AssetId] uniqueidentifier NOT NULL,
    [ContentVersionId] uniqueidentifier NOT NULL,
    [DesignationVersionId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_CaseBundleItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CaseBundleItems_CaseBundles_CaseBundleId] FOREIGN KEY ([CaseBundleId]) REFERENCES [CaseBundles] ([Id])
);
CREATE UNIQUE INDEX [IX_CaseBundleItems_CaseBundleId_AssetId] ON [CaseBundleItems] ([CaseBundleId], [AssetId]);
CREATE TABLE [CaseBundleItemRecipients] (
    [CaseBundleItemId] uniqueidentifier NOT NULL,
    [RecipientPersonId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_CaseBundleItemRecipients] PRIMARY KEY ([CaseBundleItemId], [RecipientPersonId]),
    CONSTRAINT [FK_CaseBundleItemRecipients_CaseBundleItems_CaseBundleItemId] FOREIGN KEY ([CaseBundleItemId]) REFERENCES [CaseBundleItems] ([Id]),
    CONSTRAINT [FK_CaseBundleItemRecipients_Persons_RecipientPersonId] FOREIGN KEY ([RecipientPersonId]) REFERENCES [Persons] ([Id])
);
CREATE INDEX [IX_CaseBundleItemRecipients_RecipientPersonId] ON [CaseBundleItemRecipients] ([RecipientPersonId]);
CREATE TABLE [Commitments] (
    [Id] uniqueidentifier NOT NULL,
    [CaseBundleId] uniqueidentifier NOT NULL,
    [CommittedAt] datetimeoffset NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Commitments] PRIMARY KEY ([Id]),
    CONSTRAINT [AK_Commitments_CaseBundleId_Id] UNIQUE ([CaseBundleId], [Id]),
    CONSTRAINT [FK_Commitments_CaseBundles_CaseBundleId] FOREIGN KEY ([CaseBundleId]) REFERENCES [CaseBundles] ([Id])
);
CREATE TABLE [BeneficiaryHandoverDecisions] (
    [Id] uniqueidentifier NOT NULL,
    [CaseBundleId] uniqueidentifier NOT NULL,
    [RecipientPersonId] uniqueidentifier NOT NULL,
    [DecisionStatus] nvarchar(30) NOT NULL,
    [DecidedAt] datetimeoffset NOT NULL,
    [CommitmentId] uniqueidentifier NULL,
    CONSTRAINT [PK_BeneficiaryHandoverDecisions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_BeneficiaryHandoverDecisions_CaseBundles_CaseBundleId] FOREIGN KEY ([CaseBundleId]) REFERENCES [CaseBundles] ([Id]),
    CONSTRAINT [FK_BeneficiaryHandoverDecisions_Persons_RecipientPersonId] FOREIGN KEY ([RecipientPersonId]) REFERENCES [Persons] ([Id]),
    CONSTRAINT [FK_BeneficiaryHandoverDecisions_Commitments_CaseBundleId_CommitmentId] FOREIGN KEY ([CaseBundleId], [CommitmentId]) REFERENCES [Commitments] ([CaseBundleId], [Id])
);
CREATE UNIQUE INDEX [IX_BeneficiaryHandoverDecisions_CaseBundleId_RecipientPersonId] ON [BeneficiaryHandoverDecisions] ([CaseBundleId], [RecipientPersonId]);
CREATE INDEX [IX_BeneficiaryHandoverDecisions_CaseBundleId_CommitmentId] ON [BeneficiaryHandoverDecisions] ([CaseBundleId], [CommitmentId]);
CREATE INDEX [IX_BeneficiaryHandoverDecisions_RecipientPersonId] ON [BeneficiaryHandoverDecisions] ([RecipientPersonId]);
CREATE TABLE [RecipientAuthorizations] (
    [Id] uniqueidentifier NOT NULL,
    [CaseBundleId] uniqueidentifier NOT NULL,
    [RecipientPersonId] uniqueidentifier NOT NULL,
    [ExecutorPersonId] uniqueidentifier NOT NULL,
    [EvidenceId] uniqueidentifier NOT NULL,
    [AuthorizedAt] datetimeoffset NOT NULL,
    CONSTRAINT [PK_RecipientAuthorizations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RecipientAuthorizations_CaseBundles_CaseBundleId] FOREIGN KEY ([CaseBundleId]) REFERENCES [CaseBundles] ([Id]),
    CONSTRAINT [FK_RecipientAuthorizations_Persons_RecipientPersonId] FOREIGN KEY ([RecipientPersonId]) REFERENCES [Persons] ([Id]),
    CONSTRAINT [FK_RecipientAuthorizations_Persons_ExecutorPersonId] FOREIGN KEY ([ExecutorPersonId]) REFERENCES [Persons] ([Id])
);
CREATE UNIQUE INDEX [IX_RecipientAuthorizations_CaseBundleId_RecipientPersonId] ON [RecipientAuthorizations] ([CaseBundleId], [RecipientPersonId]);
CREATE INDEX [IX_RecipientAuthorizations_RecipientPersonId] ON [RecipientAuthorizations] ([RecipientPersonId]);
CREATE INDEX [IX_RecipientAuthorizations_ExecutorPersonId] ON [RecipientAuthorizations] ([ExecutorPersonId]);
CREATE TABLE [AccessGrants] (
    [Id] uniqueidentifier NOT NULL,
    [CaseBundleId] uniqueidentifier NOT NULL,
    [RecipientPersonId] uniqueidentifier NOT NULL,
    [CommitmentId] uniqueidentifier NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [IssuedAt] datetimeoffset NOT NULL,
    [ExpiresAt] datetimeoffset NOT NULL,
    [DownloadTokenHash] varchar(64) NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_AccessGrants] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AccessGrants_CaseBundles_CaseBundleId] FOREIGN KEY ([CaseBundleId]) REFERENCES [CaseBundles] ([Id]),
    CONSTRAINT [FK_AccessGrants_Persons_RecipientPersonId] FOREIGN KEY ([RecipientPersonId]) REFERENCES [Persons] ([Id]),
    CONSTRAINT [FK_AccessGrants_Commitments_CaseBundleId_CommitmentId] FOREIGN KEY ([CaseBundleId], [CommitmentId]) REFERENCES [Commitments] ([CaseBundleId], [Id])
);
CREATE UNIQUE INDEX [IX_AccessGrants_CaseBundleId_RecipientPersonId_CommitmentId] ON [AccessGrants] ([CaseBundleId], [RecipientPersonId], [CommitmentId]);
CREATE INDEX [IX_AccessGrants_CaseBundleId_CommitmentId] ON [AccessGrants] ([CaseBundleId], [CommitmentId]);
CREATE INDEX [IX_AccessGrants_RecipientPersonId] ON [AccessGrants] ([RecipientPersonId]);
CREATE UNIQUE INDEX [IX_AccessGrants_DownloadTokenHash] ON [AccessGrants] ([DownloadTokenHash]);
""");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
DROP TABLE [AccessGrants];
DROP TABLE [RecipientAuthorizations];
DROP TABLE [BeneficiaryHandoverDecisions];
DROP TABLE [Commitments];
DROP TABLE [CaseBundleItemRecipients];
DROP TABLE [CaseBundleItems];
DROP TABLE [CaseBundles];
DROP TABLE [Cases];
DROP TABLE [Users];
DROP TABLE [Persons];
""");
    }
}
