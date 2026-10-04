# Graph Report - SWP-Prototype  (2026-10-04)

## Corpus Check
- 98 files · ~94,816 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1633 nodes · 3019 edges · 87 communities (73 shown, 14 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bdd0fc69`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LegacyVault.Prototype.Application.Interfaces
- CaseState
- VideoSessionService
- SubscriptionTier
- HandoverStatus
- StorageController
- .FinalizeHandoverSessionAsync
- LegacyVaultDbContext
- ControllerBase
- FptMarketplaceService
- IVideoSessionService
- App.tsx
- HeritageBadge
- DateTime
- .ExtractOcr
- .OnModelCreating
- OwnerVaultConfig
- Person
- Asset
- PaymentOrderDb
- ITimeLockRescueService
- ref_react
- CaseBundle
- HandoverSchedule
- OidcUserInfo
- Entities.cs
- Case
- VerificationDecision
- PersonalVault
- List
- User
- SmtpEnvironmentStatus
- MailSendResult
- AccessGrant
- ShamirTestbench.tsx
- CaseBundleItem
- HandoverReceipt
- RecipientAuthorization
- MailKitEmailService
- InteractiveWorkflowVisualizer.tsx
- BeneficiaryHandoverDecision
- ContentVersion
- Hold
- AuthController
- AuditLog
- Commitment
- WorkSession
- PaymentTransaction
- VideoVerificationTestbench.tsx
- .GenerateToken
- AssetDesignationVersion
- UserModel
- MailController
- DeathClaimAlertRequest
- SmtpConfigOverride
- TestbenchPage.tsx
- DmsNotice
- ExecutorAssignment
- ScheduleParticipant
- FptMarketplaceTestbench.tsx
- VideoSessionStatus
- PersonaModel
- Rfc7807ExceptionMiddleware
- InitTimeLockRequest
- Enums.cs
- constants/index.ts
- webCrypto.ts
- ErrorBoundary.tsx
- DispatchedEmailRecord
- baseService.ts
- AccessGrantStatus
- ParticipantRoleInCall
- PaymentStatus
- UserRole
- VerificationOutcome
- .ValidateGoogleOidc
- RegisterRequest
- CustomEmailRequest
- env.ts
- httpStatus.ts
- PasswordLoginRequest
- messages.ts
- BeneficiaryDecisionType

## God Nodes (most connected - your core abstractions)
1. `LegacyVaultDbContext` - 92 edges
2. `Person` - 51 edges
3. `VideoSessionService` - 43 edges
4. `OwnerVaultConfig` - 42 edges
5. `HeritageBadge()` - 40 edges
6. `CaseBundle` - 39 edges
7. `HeritageButton()` - 36 edges
8. `PaymentOrderDb` - 36 edges
9. `LegacyVault.Prototype.Application.Interfaces` - 35 edges
10. `Case` - 33 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `TestbenchPage()`  [EXTRACTED]
  client/src/App.tsx → client/src/pages/TestbenchPage.tsx
- `App()` --calls--> `ErrorBoundary`  [EXTRACTED]
  client/src/App.tsx → client/src/shared/ui/ErrorBoundary.tsx
- `ComparisonViewProps` --references--> `AssetItem`  [EXTRACTED]
  client/src/pages/ComparisonView.tsx → client/src/entities/asset/model/types.ts
- `DashboardPageProps` --references--> `AssetItem`  [EXTRACTED]
  client/src/pages/DashboardPage.tsx → client/src/entities/asset/model/types.ts
- `ProMaxDashboardPageProps` --references--> `AssetItem`  [EXTRACTED]
  client/src/pages/promax/ProMaxDashboardPage.tsx → client/src/entities/asset/model/types.ts

## Import Cycles
- None detected.

## Communities (87 total, 14 thin omitted)

### Community 0 - "LegacyVault.Prototype.Application.Interfaces"
Cohesion: 0.07
Nodes (10): LegacyVault.Prototype.Infrastructure.Services, LegacyVault.Prototype.Infrastructure.Persistence, LegacyVault.Prototype.Domain.Entities, LegacyVault.Prototype.Domain, LegacyVault.Prototype.Application.Services, LegacyVault.Prototype.Application.Interfaces, LegacyVault.Prototype.WebApi.Middlewares, LegacyVault.Prototype.WebApi.Controllers (+2 more)

### Community 1 - "CaseState"
Cohesion: 0.10
Nodes (17): CaseStatus, ADDITIONAL_DOCUMENTS_REQUIRED, APPROVED_FOR_DELIVERY, CANCELLED_ALIVE, DRAFT, REJECTED, RESCUE_PENDING, UNDER_REVIEW (+9 more)

### Community 3 - "SubscriptionTier"
Cohesion: 0.07
Nodes (13): IPaymentService, SubscriptionTier, LEGACY_XS, LEGACY_XS_10Y, LEGACY_XS_5Y, LEGACY_XS_MAX, LEGACY_XS_MAX_10Y, LEGACY_XS_MAX_5Y (+5 more)

### Community 4 - "HandoverStatus"
Cohesion: 0.06
Nodes (18): IEstatePlanRulesService, EstatePlanRulesService, HandoverStatus, CANCELLED_WITHOUT_DELIVERY, FROZEN_RECONSIDERATION, HANDOVER_COMMITTED, HANDOVER_STARTED, PENDING_RESPONSE (+10 more)

### Community 5 - "StorageController"
Cohesion: 0.07
Nodes (12): IR2StorageService, BucketName, IsConfigured, CloudflareR2StorageService, BucketName, IsConfigured, DownloadPresignedUrlRequest, Key (+4 more)

### Community 7 - "LegacyVaultDbContext"
Cohesion: 0.04
Nodes (45): LegacyVaultDbContext, AccessGrantAssets, AccessGrants, AssetDesignationVersions, Assets, AuditLogs, BeneficiaryHandoverDecisions, BundleAssets (+37 more)

### Community 8 - "ControllerBase"
Cohesion: 0.07
Nodes (18): EncryptionResult, ChecksumSha256, Ciphertext, Dek, Nonce, Tag, WrappedKeyBase64, IEnvelopeEncryptionService (+10 more)

### Community 9 - "FptMarketplaceService"
Cohesion: 0.08
Nodes (3): IFptMarketplaceService, FptMarketplaceService, FptMarketplaceController

### Community 10 - "IVideoSessionService"
Cohesion: 0.05
Nodes (11): IVideoSessionService, AuthContextResult, CaseBundlesController, ConfirmScheduleDto, ScheduledAt, VerifierId, TriggerRescueHoldDto, CaseId (+3 more)

### Community 11 - "App.tsx"
Cohesion: 0.09
Nodes (26): App(), AssetCategory, AssetItem, VaultType, BillingCycle, PlanFeature, SubscriptionPlan, SubscriptionTier (+18 more)

### Community 12 - "HeritageBadge"
Cohesion: 0.13
Nodes (24): ClientMediaPipeFacePoc(), ClientTesseractOcrPoc(), CropBox, ExtractedFields, ROI_PRESETS, RoiPreset, EkycTestbench(), EkycTestbenchProps (+16 more)

### Community 13 - "DateTime"
Cohesion: 0.08
Nodes (27): AccessGrantAsset, AccessGrant, AccessGrantId, Asset, AssetId, GrantedAt, DeathCertificate, Case (+19 more)

### Community 14 - ".ExtractOcr"
Cohesion: 0.11
Nodes (3): IEkycService, EkycService, EkycController

### Community 15 - ".OnModelCreating"
Cohesion: 0.08
Nodes (25): Bundle, BundleAssets, CaseBundles, CreatedAt, EstatePlanVersion, EstatePlanVersionId, HandoverPolicy, Id (+17 more)

### Community 16 - "OwnerVaultConfig"
Cohesion: 0.07
Nodes (27): OwnerVaultConfig, Assets, AuditLogs, Cases, CreatedAt, DmsPolicy, EstatePlans, ExecutorAssignments (+19 more)

### Community 17 - "Person"
Cohesion: 0.07
Nodes (27): Person, AccessGrants, AssetDesignations, AuditLogs, BeneficiaryDecisions, CaseAssignments, CreatedAt, DateOfBirth (+19 more)

### Community 18 - "Asset"
Cohesion: 0.08
Nodes (25): Asset, AccessGrantAssets, AssetDesignationVersions, AssetType, BundleAssets, ContentVersions, CreatedAt, Id (+17 more)

### Community 19 - "PaymentOrderDb"
Cohesion: 0.04
Nodes (49): PaymentOrderDb, Amount, CreatedAt, ExpiresAt, Id, OrderCode, PaidAt, Person (+41 more)

### Community 21 - "ref_react"
Cohesion: 0.13
Nodes (19): OidcResponse, Window, EncryptMetadata, DispatchedEmail, PaymentOrder, TimeLockStatus, UploadedEnvelopeAsset, axiosClient (+11 more)

### Community 22 - "CaseBundle"
Cohesion: 0.08
Nodes (24): CaseBundle, AccessGrants, Case, CaseId, Commitments, CreatedAt, Decisions, FreezeExpiresAt (+16 more)

### Community 24 - "HandoverSchedule"
Cohesion: 0.09
Nodes (22): HandoverNotice, HandoverSchedule, HandoverScheduleId, Id, NoticeType, RecipientPerson, RecipientPersonId, SentAt (+14 more)

### Community 25 - "OidcUserInfo"
Cohesion: 0.11
Nodes (11): IOidcValidationService, OidcUserInfo, Audience, Email, ExpiryTime, Issuer, IsValid, Name (+3 more)

### Community 26 - "Entities.cs"
Cohesion: 0.11
Nodes (18): EstatePlan, CreatedAt, Id, Status, Title, Vault, VaultId, Versions (+10 more)

### Community 27 - "Case"
Cohesion: 0.10
Nodes (20): Case, AuditLogs, CaseAssignments, CaseBundles, CreatedAt, DeathCertificates, DecidedAt, DmsCycle (+12 more)

### Community 28 - "VerificationDecision"
Cohesion: 0.10
Nodes (20): CaseAssignment, AssignedAt, AssignedPerson, AssignedPersonId, Case, CaseId, Id, Status (+12 more)

### Community 29 - "PersonalVault"
Cohesion: 0.10
Nodes (20): PersonalVault, CreatedAt, Id, Items, MaxAssetsQuota, OwnerPerson, OwnerPersonId, PlanExpiresAt (+12 more)

### Community 30 - "List"
Cohesion: 0.11
Nodes (18): DmsCycle, ActualCheckInAt, Case, DmsPolicy, DmsPolicyId, GraceExpiresAt, Id, Notices (+10 more)

### Community 31 - "User"
Cohesion: 0.11
Nodes (19): StaffRole, AssignedAt, AssignedByUserId, Id, RoleCode, User, UserId, User (+11 more)

### Community 32 - "SmtpEnvironmentStatus"
Cohesion: 0.13
Nodes (11): LegacyVault.Prototype.Application.Common, EmailUtils, SmtpEnvironmentStatus, GuidanceMessage, HasPasswordConfigured, Host, IsReadyForLiveSmtp, Port (+3 more)

### Community 33 - "MailSendResult"
Cohesion: 0.20
Nodes (9): IMailKitService, MailSendResult, ErrorDetails, IsRealSmtp, LatencyMs, Message, MessageId, SmtpServerResponse (+1 more)

### Community 34 - "AccessGrant"
Cohesion: 0.12
Nodes (17): AccessGrant, AccessGrantAssets, CaseBundle, CaseBundleId, CaseId, Commitment, CommitmentId, DownloadEvents (+9 more)

### Community 35 - "ShamirTestbench.tsx"
Cohesion: 0.38
Nodes (14): ShamirTestbench(), combineShares(), deriveBytesFromPassphrase(), EXP, getLagrangeTrace(), gfAdd(), gfDiv(), gfMul() (+6 more)

### Community 36 - "CaseBundleItem"
Cohesion: 0.12
Nodes (16): CaseBundleItem, AddedAt, Asset, AssetDesignationVersion, AssetDesignationVersionId, AssetId, CaseBundle, CaseBundleId (+8 more)

### Community 37 - "HandoverReceipt"
Cohesion: 0.12
Nodes (16): HandoverReceipt, AccessGrant, AccessGrantId, BeneficiaryPerson, BeneficiaryPersonId, CaseBundle, CaseBundleId, ConfirmedAssetIdsJson (+8 more)

### Community 38 - "RecipientAuthorization"
Cohesion: 0.12
Nodes (16): RecipientAuthorization, ApprovedByExecutorPerson, ApprovedByExecutorPersonId, AuthorizedAt, CaseBundle, CaseBundleId, FaceMatched, Id (+8 more)

### Community 40 - "InteractiveWorkflowVisualizer.tsx"
Cohesion: 0.25
Nodes (6): DEMO_PERSONAS, FLOW_01_STEPS, FLOW_02_STEPS, FLOW_03_STEPS, InteractiveWorkflowVisualizerProps, WorkflowStep

### Community 41 - "BeneficiaryHandoverDecision"
Cohesion: 0.14
Nodes (14): BeneficiaryHandoverDecision, CaseBundle, CaseBundleId, Commitment, CommitmentId, DecidedAt, DecisionStatus, Id (+6 more)

### Community 42 - "ContentVersion"
Cohesion: 0.14
Nodes (14): ContentVersion, Asset, AssetId, AuthTagHex, CaseBundleItems, ChecksumSha256, CiphertextStorageKey, CreatedAt (+6 more)

### Community 43 - "Hold"
Cohesion: 0.14
Nodes (14): Hold, Case, CaseId, HoldType, Id, PlacedAt, PlacedByPerson, PlacedByPersonId (+6 more)

### Community 44 - "AuthController"
Cohesion: 0.24
Nodes (3): AuthController, DemoLoginRequest, Role

### Community 45 - "AuditLog"
Cohesion: 0.15
Nodes (13): AuditLog, Action, Case, CaseId, ClientIp, CreatedAt, Id, PayloadHash (+5 more)

### Community 46 - "Commitment"
Cohesion: 0.15
Nodes (13): Commitment, AccessGrants, CaseBundle, CaseBundleId, CaseId, ClientIpAddress, CommittedAt, Decisions (+5 more)

### Community 47 - "WorkSession"
Cohesion: 0.09
Nodes (23): SessionParticipant, Id, IdentityVerified, JoinedAt, LeftAt, Person, PersonId, Role (+15 more)

### Community 48 - "PaymentTransaction"
Cohesion: 0.25
Nodes (8): PaymentTransaction, AmountIn, BankTransactionId, Id, Order, OrderId, RawWebhookPayload, TransactionTime

### Community 49 - "VideoVerificationTestbench.tsx"
Cohesion: 0.20
Nodes (11): AcceptResponseDto, CoBeneficiaryDecisionDto, CoOwnershipStatusDto, FinalReceiptData, HandoverAssetDto, HandoverEligibilityDto, HoldResultData, RegisteredDossierDto (+3 more)

### Community 51 - "AssetDesignationVersion"
Cohesion: 0.17
Nodes (12): AssetDesignationVersion, Asset, AssetId, BeneficiaryPerson, BeneficiaryPersonId, CaseBundleItems, CreatedAt, EstatePlanVersion (+4 more)

### Community 52 - "UserModel"
Cohesion: 0.17
Nodes (11): UserModel, Avatar, CreatedAt, Email, FullName, IsOidcAccount, PasswordHash, PasswordSalt (+3 more)

### Community 54 - "DeathClaimAlertRequest"
Cohesion: 0.17
Nodes (11): AliveClaimAlertRequest, CaseId, OwnerName, SmtpOverride, ToEmail, DeathClaimAlertRequest, CancelUrl, CaseId (+3 more)

### Community 55 - "SmtpConfigOverride"
Cohesion: 0.18
Nodes (11): SmtpConfigOverride, Host, Password, Port, SenderEmail, SenderName, Username, OtpEmailRequest (+3 more)

### Community 56 - "TestbenchPage.tsx"
Cohesion: 0.33
Nodes (14): GoogleOidcTestbench(), CryptoEnvelopeTestbench(), FptMarketplaceTestbench(), MailKitTestbench(), SePayTestbench(), RescueTimeLockTestbench(), R2StorageTestbench(), VideoVerificationTestbench() (+6 more)

### Community 57 - "DmsNotice"
Cohesion: 0.20
Nodes (10): DmsNotice, Channel, DeliveryStatus, DmsCycle, DmsCycleId, Id, NoticeType, RecipientPerson (+2 more)

### Community 58 - "ExecutorAssignment"
Cohesion: 0.20
Nodes (10): ExecutorAssignment, AcceptedAt, AssignedAt, ExecutorPerson, ExecutorPersonId, Id, ResignedAt, Status (+2 more)

### Community 59 - "ScheduleParticipant"
Cohesion: 0.20
Nodes (10): ScheduleParticipant, ConfirmationStatus, HandoverSchedule, HandoverScheduleId, Id, Notes, Person, PersonId (+2 more)

### Community 60 - "FptMarketplaceTestbench.tsx"
Cohesion: 0.29
Nodes (6): CLAUSE_PRESETS, ClauseReviewResponse, FptModelDto, FptModelListResponse, SyntheticClausePreset, VisionExtractResponse

### Community 62 - "VideoSessionStatus"
Cohesion: 0.22
Nodes (9): VideoSessionStatus, CANCELLED, COMPLETED, EXPIRED, IN_PROGRESS, REQUESTED, SCHEDULED, TERMINATED (+1 more)

### Community 63 - "PersonaModel"
Cohesion: 0.22
Nodes (8): PersonaModel, Avatar, Description, Email, FullName, PersonId, Role, Roles

### Community 66 - "InitTimeLockRequest"
Cohesion: 0.29
Nodes (6): InitTimeLockRequest, CaseId, IsDemoMode, ToggleDemoRequest, CaseId, IsDemoMode

### Community 67 - "Enums.cs"
Cohesion: 0.29
Nodes (6): RescueDecisionType, APPROVED_ALIVE, REJECTED_FRAUD, VideoSessionPurpose, HANDOVER_VERIFICATION, OWNER_RESCUE

### Community 68 - "constants/index.ts"
Cohesion: 0.50
Nodes (3): CASE_STATUS, HTTP_STATUS, SUBSCRIPTION_TIERS

### Community 69 - "webCrypto.ts"
Cohesion: 0.33
Nodes (3): ClientCryptoResult, encryptClientSide(), exportKeyToHex()

### Community 70 - "ErrorBoundary.tsx"
Cohesion: 0.29
Nodes (3): ErrorBoundary, Props, State

### Community 71 - "DispatchedEmailRecord"
Cohesion: 0.29
Nodes (6): DispatchedEmailRecord, HtmlBody, IsRealSmtp, SentAt, Subject, ToEmail

### Community 72 - "baseService.ts"
Cohesion: 0.47
Nodes (3): ApiResponse, PaginatedList, PaginationParams

### Community 74 - "AccessGrantStatus"
Cohesion: 0.33
Nodes (6): AccessGrantStatus, ACTIVE, EXPIRED, FINALIZED, REVOKED, SUSPENDED_RESCUE_HOLD

### Community 75 - "ParticipantRoleInCall"
Cohesion: 0.33
Nodes (6): ParticipantRoleInCall, CO_BENEFICIARY, HOST_VERIFIER, NOTARY_OBSERVER, OBSERVER, SUBJECT_USER

### Community 76 - "PaymentStatus"
Cohesion: 0.33
Nodes (6): PaymentStatus, CANCELLED, EXPIRED, FAILED, PAID, PENDING

### Community 77 - "UserRole"
Cohesion: 0.33
Nodes (6): UserRole, ADMIN, BENEFICIARY, EXECUTOR, OWNER, VERIFIER

### Community 78 - "VerificationOutcome"
Cohesion: 0.33
Nodes (6): VerificationOutcome, FAIL, INCONCLUSIVE, PASS, PENDING, REQUIRE_MORE_DOCS

### Community 79 - ".ValidateGoogleOidc"
Cohesion: 0.33
Nodes (3): GoogleOidcRequest, ClientId, IdToken

### Community 80 - "RegisterRequest"
Cohesion: 0.40
Nodes (5): RegisterRequest, Email, FullName, Password, Phone

### Community 81 - "CustomEmailRequest"
Cohesion: 0.40
Nodes (5): CustomEmailRequest, HtmlContent, SmtpOverride, Subject, ToEmail

### Community 84 - "PasswordLoginRequest"
Cohesion: 0.67
Nodes (3): PasswordLoginRequest, Email, Password

### Community 86 - "BeneficiaryDecisionType"
Cohesion: 0.50
Nodes (4): BeneficiaryDecisionType, ACCEPTED, PENDING, REJECTED

## Knowledge Gaps
- **797 isolated node(s):** `RegisteredDossierDto`, `CoOwnershipStatusDto`, `BillingCycle`, `PlanFeature`, `SubscriptionPlan` (+792 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 990 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LegacyVaultDbContext` connect `LegacyVaultDbContext` to `LegacyVault.Prototype.Application.Interfaces`, `DateTime`, `.OnModelCreating`, `OwnerVaultConfig`, `Person`, `Asset`, `PaymentOrderDb`, `CaseBundle`, `HandoverSchedule`, `Entities.cs`, `Case`, `VerificationDecision`, `PersonalVault`, `List`, `User`, `AccessGrant`, `CaseBundleItem`, `HandoverReceipt`, `RecipientAuthorization`, `BeneficiaryHandoverDecision`, `ContentVersion`, `Hold`, `AuditLog`, `Commitment`, `WorkSession`, `PaymentTransaction`, `AssetDesignationVersion`, `DmsNotice`, `ExecutorAssignment`, `ScheduleParticipant`?**
  _High betweenness centrality (0.380) - this node is a cross-community bridge._
- **Why does `LegacyVault.Prototype.Application.Interfaces` connect `LegacyVault.Prototype.Application.Interfaces` to `MailSendResult`, `StorageController`, `.FinalizeHandoverSessionAsync`, `ControllerBase`, `.GenerateToken`, `OidcUserInfo`?**
  _High betweenness centrality (0.335) - this node is a cross-community bridge._
- **What connects `RegisteredDossierDto`, `CoOwnershipStatusDto`, `BillingCycle` to the rest of the system?**
  _797 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LegacyVault.Prototype.Application.Interfaces` be split into smaller, more focused modules?**
  _Cohesion score 0.07042253521126761 - nodes in this community are weakly interconnected._
- **Should `CaseState` be split into smaller, more focused modules?**
  _Cohesion score 0.10483870967741936 - nodes in this community are weakly interconnected._
- **Should `VideoSessionService` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Should `SubscriptionTier` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._