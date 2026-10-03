using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace LegacyVault.Prototype.Infrastructure.Persistence.Migrations;

[DbContext(typeof(LegacyVaultDbContext))]
[Migration("20261003160000_AddGrantItemScope")]
public class AddGrantItemScope : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
ALTER TABLE [CaseBundleItems] ADD CONSTRAINT [AK_CaseBundleItems_CaseBundleId_Id] UNIQUE ([CaseBundleId], [Id]);
ALTER TABLE [CaseBundleItemRecipients] ADD [CaseBundleId] uniqueidentifier NULL;
UPDATE r SET [CaseBundleId] = i.[CaseBundleId] FROM [CaseBundleItemRecipients] r JOIN [CaseBundleItems] i ON i.[Id] = r.[CaseBundleItemId];
ALTER TABLE [CaseBundleItemRecipients] ALTER COLUMN [CaseBundleId] uniqueidentifier NOT NULL;
ALTER TABLE [CaseBundleItemRecipients] DROP CONSTRAINT [FK_CaseBundleItemRecipients_CaseBundleItems_CaseBundleItemId];
ALTER TABLE [CaseBundleItemRecipients] ADD CONSTRAINT [AK_CaseBundleItemRecipients_CaseBundleId_CaseBundleItemId_RecipientPersonId]
    UNIQUE ([CaseBundleId], [CaseBundleItemId], [RecipientPersonId]);
ALTER TABLE [CaseBundleItemRecipients] ADD CONSTRAINT [FK_CaseBundleItemRecipients_CaseBundleItems_CaseBundleId_CaseBundleItemId]
    FOREIGN KEY ([CaseBundleId], [CaseBundleItemId]) REFERENCES [CaseBundleItems] ([CaseBundleId], [Id]);
ALTER TABLE [AccessGrants] ADD CONSTRAINT [AK_AccessGrants_CaseBundleId_Id_RecipientPersonId] UNIQUE ([CaseBundleId], [Id], [RecipientPersonId]);
CREATE TABLE [AccessGrantItems] (
    [AccessGrantId] uniqueidentifier NOT NULL,
    [CaseBundleItemId] uniqueidentifier NOT NULL,
    [CaseBundleId] uniqueidentifier NOT NULL,
    [RecipientPersonId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_AccessGrantItems] PRIMARY KEY ([AccessGrantId], [CaseBundleItemId]),
    CONSTRAINT [FK_AccessGrantItems_AccessGrants_CaseBundleId_AccessGrantId_RecipientPersonId]
        FOREIGN KEY ([CaseBundleId], [AccessGrantId], [RecipientPersonId]) REFERENCES [AccessGrants] ([CaseBundleId], [Id], [RecipientPersonId]),
    CONSTRAINT [FK_AccessGrantItems_CaseBundleItemRecipients_CaseBundleId_CaseBundleItemId_RecipientPersonId]
        FOREIGN KEY ([CaseBundleId], [CaseBundleItemId], [RecipientPersonId]) REFERENCES [CaseBundleItemRecipients] ([CaseBundleId], [CaseBundleItemId], [RecipientPersonId])
);
CREATE INDEX [IX_AccessGrantItems_CaseBundleId_AccessGrantId_RecipientPersonId] ON [AccessGrantItems] ([CaseBundleId], [AccessGrantId], [RecipientPersonId]);
CREATE INDEX [IX_AccessGrantItems_CaseBundleId_CaseBundleItemId_RecipientPersonId] ON [AccessGrantItems] ([CaseBundleId], [CaseBundleItemId], [RecipientPersonId]);
""");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
DROP TABLE [AccessGrantItems];
ALTER TABLE [AccessGrants] DROP CONSTRAINT [AK_AccessGrants_CaseBundleId_Id_RecipientPersonId];
ALTER TABLE [CaseBundleItemRecipients] DROP CONSTRAINT [FK_CaseBundleItemRecipients_CaseBundleItems_CaseBundleId_CaseBundleItemId];
ALTER TABLE [CaseBundleItemRecipients] DROP CONSTRAINT [AK_CaseBundleItemRecipients_CaseBundleId_CaseBundleItemId_RecipientPersonId];
ALTER TABLE [CaseBundleItemRecipients] DROP COLUMN [CaseBundleId];
ALTER TABLE [CaseBundleItemRecipients] ADD CONSTRAINT [FK_CaseBundleItemRecipients_CaseBundleItems_CaseBundleItemId]
    FOREIGN KEY ([CaseBundleItemId]) REFERENCES [CaseBundleItems] ([Id]);
ALTER TABLE [CaseBundleItems] DROP CONSTRAINT [AK_CaseBundleItems_CaseBundleId_Id];
""");
    }
}
