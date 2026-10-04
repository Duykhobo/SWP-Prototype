# Graph Report - SWP-Prototype  (2026-10-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1606 nodes · 2946 edges · 86 communities (74 shown, 12 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 127 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `02b74897`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LegacyVault.Prototype.Application.Interfaces
- CaseState
- VideoSessionService
- SubscriptionTier
- HandoverStatus
- StorageController
- VideoSessionsController
- LegacyVaultDbContext
- ControllerBase
- FptMarketplaceService
- IVideoSessionService
- ref_react
- HeritageBadge
- DateTime
- .ExtractOcr
- Entities.cs
- OwnerVaultConfig
- Person
- Asset
- PaymentOrderDb
- CaseBundlesController
- FptMarketplaceTestbench.tsx
- CaseBundle
- SubscriptionPlan
- HandoverSchedule
- OidcUserInfo
- .OnModelCreating
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
- ClientTesseractOcrPoc.tsx
- HeritageBadge.tsx
- .GenerateToken
- AssetDesignationVersion
- UserModel
- MailController
- DeathClaimAlertRequest
- SmtpConfigOverride
- HeritageButton.tsx
- DmsNotice
- ExecutorAssignment
- ScheduleParticipant
- SessionParticipant
- VideoSessionStatus
- PersonaModel
- Rfc7807ExceptionMiddleware
- .AdjudicateRescueHoldAsync
- DeathCertificate
- Enums.cs
- CaseStatus
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

## God Nodes (most connected - your core abstractions)
1. `LegacyVaultDbContext` - 92 edges
2. `Person` - 51 edges
3. `VideoSessionService` - 43 edges
4. `OwnerVaultConfig` - 42 edges
5. `HeritageBadge()` - 40 edges
6. `CaseBundle` - 39 edges
7. `PaymentOrderDb` - 36 edges
8. `HeritageButton()` - 36 edges
9. `LegacyVault.Prototype.Application.Interfaces` - 35 edges
10. `Case` - 33 edges

## Surprising Connections (you probably didn't know these)
- `LegalDropzone()` --calls--> `HeritageBadge()`  [EXTRACTED]
  client/src/widgets/LegalDropzone.tsx → client/src/shared/ui/HeritageBadge.tsx
- `TechOverviewBar()` --calls--> `HeritageBadge()`  [EXTRACTED]
  client/src/widgets/TechOverviewBar.tsx → client/src/shared/ui/HeritageBadge.tsx
- `VideoSessionService` --references--> `ITimeLockRescueService`  [EXTRACTED]
  server/LegacyVault.Prototype.Infrastructure/Services/VideoSessionService.cs → server/LegacyVault.Prototype.Application/Interfaces/ITimeLockRescueService.cs
- `CaseState` --references--> `CaseStatus`  [EXTRACTED]
  server/LegacyVault.Prototype.Infrastructure/Services/TimeLockRescueService.cs → server/LegacyVault.Prototype.Domain/Enums.cs
- `VideoSessionService` --implements--> `IVideoSessionService`  [EXTRACTED]
  server/LegacyVault.Prototype.Infrastructure/Services/VideoSessionService.cs → server/LegacyVault.Prototype.Application/Interfaces/IVideoSessionService.cs

## Import Cycles
- None detected.

## Communities (86 total, 12 thin omitted)

### Community 0 - "LegacyVault.Prototype.Application.Interfaces"
Cohesion: 0.07
Nodes (10): LegacyVault.Prototype.Infrastructure.Services, LegacyVault.Prototype.Infrastructure.Persistence, LegacyVault.Prototype.Domain.Entities, LegacyVault.Prototype.Domain, LegacyVault.Prototype.Application.Services, LegacyVault.Prototype.Application.Interfaces, LegacyVault.Prototype.WebApi.Middlewares, LegacyVault.Prototype.WebApi.Controllers (+2 more)

### Community 1 - "CaseState"
Cohesion: 0.07
Nodes (17): ITimeLockRescueService, CaseState, AliveClaimReason, AliveClaimSubmittedAt, CaseId, IsDemoMode, StartedAt, Status (+9 more)

### Community 3 - "SubscriptionTier"
Cohesion: 0.07
Nodes (13): IPaymentService, SubscriptionTier, LEGACY_XS, LEGACY_XS_10Y, LEGACY_XS_5Y, LEGACY_XS_MAX, LEGACY_XS_MAX_10Y, LEGACY_XS_MAX_5Y (+5 more)

### Community 4 - "HandoverStatus"
Cohesion: 0.06
Nodes (18): IEstatePlanRulesService, EstatePlanRulesService, HandoverStatus, CANCELLED_WITHOUT_DELIVERY, FROZEN_RECONSIDERATION, HANDOVER_COMMITTED, HANDOVER_STARTED, PENDING_RESPONSE (+10 more)

### Community 5 - "StorageController"
Cohesion: 0.07
Nodes (12): IR2StorageService, BucketName, IsConfigured, CloudflareR2StorageService, BucketName, IsConfigured, DownloadPresignedUrlRequest, Key (+4 more)

### Community 6 - "VideoSessionsController"
Cohesion: 0.09
Nodes (10): ILiveKitVideoService, LiveKitVideoService, ConfirmScheduleDto, ScheduledAt, VerifierId, TriggerRescueHoldDto, CaseId, OwnerId (+2 more)

### Community 7 - "LegacyVaultDbContext"
Cohesion: 0.04
Nodes (45): LegacyVaultDbContext, AccessGrantAssets, AccessGrants, AssetDesignationVersions, Assets, AuditLogs, BeneficiaryHandoverDecisions, BundleAssets (+37 more)

### Community 8 - "ControllerBase"
Cohesion: 0.07
Nodes (18): EncryptionResult, ChecksumSha256, Ciphertext, Dek, Nonce, Tag, WrappedKeyBase64, IEnvelopeEncryptionService (+10 more)

### Community 9 - "FptMarketplaceService"
Cohesion: 0.08
Nodes (3): IFptMarketplaceService, FptMarketplaceService, FptMarketplaceController

### Community 11 - "ref_react"
Cohesion: 0.15
Nodes (20): App(), AssetItem, NewAssetModal(), NewAssetModalProps, SePayPaymentModal(), SePayPaymentModalProps, MainNavbar(), MainNavbarProps (+12 more)

### Community 12 - "HeritageBadge"
Cohesion: 0.19
Nodes (25): GoogleOidcTestbench(), CryptoEnvelopeTestbench(), ClientMediaPipeFacePoc(), ClientTesseractOcrPoc(), EkycTestbench(), EkycTestbenchProps, LivenessData, OcrData (+17 more)

### Community 13 - "DateTime"
Cohesion: 0.08
Nodes (27): AccessGrantAsset, AccessGrant, AccessGrantId, Asset, AssetId, GrantedAt, IdempotencyRecordDb, Id (+19 more)

### Community 14 - ".ExtractOcr"
Cohesion: 0.11
Nodes (3): IEkycService, EkycService, EkycController

### Community 15 - "Entities.cs"
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
Cohesion: 0.08
Nodes (25): PaymentOrderDb, Amount, CreatedAt, ExpiresAt, Id, OrderCode, PaidAt, Person (+17 more)

### Community 21 - "FptMarketplaceTestbench.tsx"
Cohesion: 0.11
Nodes (16): OidcResponse, Window, CLAUSE_PRESETS, ClauseReviewResponse, FptModelDto, FptModelListResponse, SyntheticClausePreset, VisionExtractResponse (+8 more)

### Community 22 - "CaseBundle"
Cohesion: 0.08
Nodes (24): CaseBundle, AccessGrants, Case, CaseId, Commitments, CreatedAt, Decisions, FreezeExpiresAt (+16 more)

### Community 23 - "SubscriptionPlan"
Cohesion: 0.08
Nodes (24): SubscriptionPlan, AllowEstatePlan, AllowPdfExport, Category, CreatedAt, DurationDays, Id, MaxAssetsQuota (+16 more)

### Community 24 - "HandoverSchedule"
Cohesion: 0.09
Nodes (22): HandoverNotice, HandoverSchedule, HandoverScheduleId, Id, NoticeType, RecipientPerson, RecipientPersonId, SentAt (+14 more)

### Community 25 - "OidcUserInfo"
Cohesion: 0.11
Nodes (11): IOidcValidationService, OidcUserInfo, Audience, Email, ExpiryTime, Issuer, IsValid, Name (+3 more)

### Community 26 - ".OnModelCreating"
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
Cohesion: 0.16
Nodes (10): EncryptMetadata, DEMO_PERSONAS, FLOW_01_STEPS, FLOW_02_STEPS, FLOW_03_STEPS, InteractiveWorkflowVisualizerProps, WorkflowStep, LivePipelineProgress() (+2 more)

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
Cohesion: 0.15
Nodes (13): WorkSession, CaseBundle, CaseBundleId, EndedAt, HandoverSchedule, HandoverScheduleId, Id, LivekitRoomName (+5 more)

### Community 48 - "ClientTesseractOcrPoc.tsx"
Cohesion: 0.21
Nodes (9): CropBox, ExtractedFields, ROI_PRESETS, RoiPreset, BENCHMARK_TEST_CASES, BenchmarkResultItem, BenchmarkTestCase, computeSimilarity() (+1 more)

### Community 49 - "HeritageBadge.tsx"
Cohesion: 0.17
Nodes (5): ExtendedUserRole, JoinTokenData, HeritageBadgeProps, AppHeaderProps, TechOverviewBar()

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

### Community 56 - "HeritageButton.tsx"
Cohesion: 0.20
Nodes (6): AuditRecord, VerificationStatus, HeritageButtonProps, ComplianceWarningBoxProps, LegalDropzone(), LegalDropzoneProps

### Community 57 - "DmsNotice"
Cohesion: 0.20
Nodes (10): DmsNotice, Channel, DeliveryStatus, DmsCycle, DmsCycleId, Id, NoticeType, RecipientPerson (+2 more)

### Community 58 - "ExecutorAssignment"
Cohesion: 0.20
Nodes (10): ExecutorAssignment, AcceptedAt, AssignedAt, ExecutorPerson, ExecutorPersonId, Id, ResignedAt, Status (+2 more)

### Community 59 - "ScheduleParticipant"
Cohesion: 0.20
Nodes (10): ScheduleParticipant, ConfirmationStatus, HandoverSchedule, HandoverScheduleId, Id, Notes, Person, PersonId (+2 more)

### Community 60 - "SessionParticipant"
Cohesion: 0.20
Nodes (10): SessionParticipant, Id, IdentityVerified, JoinedAt, LeftAt, Person, PersonId, Role (+2 more)

### Community 62 - "VideoSessionStatus"
Cohesion: 0.22
Nodes (9): VideoSessionStatus, CANCELLED, COMPLETED, EXPIRED, IN_PROGRESS, REQUESTED, SCHEDULED, TERMINATED (+1 more)

### Community 63 - "PersonaModel"
Cohesion: 0.22
Nodes (8): PersonaModel, Avatar, Description, Email, FullName, PersonId, Role, Roles

### Community 65 - ".AdjudicateRescueHoldAsync"
Cohesion: 0.29
Nodes (3): RescueDecisionType, APPROVED_ALIVE, REJECTED_FRAUD

### Community 66 - "DeathCertificate"
Cohesion: 0.25
Nodes (8): DeathCertificate, Case, CaseId, ChecksumSha256, Id, MimeType, StorageKey, UploadedAt

### Community 67 - "Enums.cs"
Cohesion: 0.25
Nodes (7): BeneficiaryDecisionType, ACCEPTED, PENDING, REJECTED, VideoSessionPurpose, HANDOVER_VERIFICATION, OWNER_RESCUE

### Community 68 - "CaseStatus"
Cohesion: 0.25
Nodes (8): CaseStatus, ADDITIONAL_DOCUMENTS_REQUIRED, APPROVED_FOR_DELIVERY, CANCELLED_ALIVE, DRAFT, REJECTED, RESCUE_PENDING, UNDER_REVIEW

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

## Knowledge Gaps
- **792 isolated node(s):** `ErrorCodes`, `NewAssetModalProps`, `SePayPaymentModalProps`, `MainNavbarProps`, `PricingPageProps` (+787 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 986 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LegacyVaultDbContext` connect `LegacyVaultDbContext` to `LegacyVault.Prototype.Application.Interfaces`, `DateTime`, `Entities.cs`, `OwnerVaultConfig`, `Person`, `Asset`, `PaymentOrderDb`, `CaseBundle`, `SubscriptionPlan`, `HandoverSchedule`, `.OnModelCreating`, `Case`, `VerificationDecision`, `PersonalVault`, `List`, `User`, `AccessGrant`, `CaseBundleItem`, `HandoverReceipt`, `RecipientAuthorization`, `BeneficiaryHandoverDecision`, `ContentVersion`, `Hold`, `AuditLog`, `Commitment`, `WorkSession`, `AssetDesignationVersion`, `DmsNotice`, `ExecutorAssignment`, `ScheduleParticipant`, `SessionParticipant`, `DeathCertificate`?**
  _High betweenness centrality (0.419) - this node is a cross-community bridge._
- **Why does `LegacyVault.Prototype.Application.Interfaces` connect `LegacyVault.Prototype.Application.Interfaces` to `MailSendResult`, `StorageController`, `VideoSessionsController`, `ControllerBase`, `.GenerateToken`, `OidcUserInfo`?**
  _High betweenness centrality (0.384) - this node is a cross-community bridge._
- **What connects `ErrorCodes`, `NewAssetModalProps`, `SePayPaymentModalProps` to the rest of the system?**
  _792 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LegacyVault.Prototype.Application.Interfaces` be split into smaller, more focused modules?**
  _Cohesion score 0.07042253521126761 - nodes in this community are weakly interconnected._
- **Should `CaseState` be split into smaller, more focused modules?**
  _Cohesion score 0.07329462989840348 - nodes in this community are weakly interconnected._
- **Should `VideoSessionService` be split into smaller, more focused modules?**
  _Cohesion score 0.07993966817496229 - nodes in this community are weakly interconnected._
- **Should `SubscriptionTier` be split into smaller, more focused modules?**
  _Cohesion score 0.06787330316742081 - nodes in this community are weakly interconnected._