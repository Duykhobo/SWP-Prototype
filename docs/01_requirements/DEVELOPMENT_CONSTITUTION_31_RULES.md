# HIẾN CHƯƠNG 31 QUY TẮC PHÁT TRIỂN CHUẨN MỰC DỰ ÁN LEGACYVAULT (SWP391)

Tài liệu này tập hợp đầy đủ 31 Quy tắc cốt lõi (Hard Rules), Quy chuẩn kỹ thuật, Thiết kế kiến trúc và Quy trình cộng tác Gitflow/Agile bắt buộc cho toàn bộ thành viên và AI Assistant trong dự án LegacyVault.

---

## NHÓM I: KIẾN TRÚC NỀN TẢNG & PHÂN TẦNG MÃ NGUỒN (QUY TẮC 1 - 5)

### Quy tắc 1: Kiến Trúc Phân Tầng Feature-Sliced Design (FSD) Phân Tầng Một Chiều
* **Quy định**: Cấu trúc thư mục `client/src/` phải tuân theo thứ tự phân tầng nghiêm ngặt: `app` → `pages` → `widgets` → `features` → `entities` → `shared`.
* **Điều cấm**: Tầng dưới tuyệt đối không được import từ tầng trên nó. Cấm import chéo giữa các features (`features/claims` không được import `features/notary`). Mọi sự chia sẻ dữ liệu hoặc UI chung phải được chuyển xuống `entities` hoặc `shared`.
* **Code mẫu**:
```typescript
// ❌ SAI (Vi phạm import chéo feature và import ngược tầng):
import { NotaryReviewModal } from '@/features/notary/ui/NotaryReviewModal'; // Chết vì claims import chéo notary!
import { AppHeader } from '@/widgets/Header'; // Chết vì feature import ngược từ widget!

// ✅ ĐÚNG (Import một chiều chuẩn FSD):
import { useVaultDetails } from '@/entities/vault/model/useVaultDetails'; // Import từ entity (tầng dưới)
import { Button, Card } from '@/shared/ui'; // Import từ shared (tầng dưới cùng)
```

### Quy tắc 2: SOLID, DRY & Zero Hardcoding (Tuyệt Đối Không Hardcode)
* **Quy định**: Không bao giờ viết lại logic gọi API hay UI primitives. Tái sử dụng `createBaseService` từ `@/shared/api`. Cấm triệt để việc viết cứng (hardcode) chuỗi, số (Magic strings/numbers).
* **Điều bắt buộc**:
  * Mã HTTP dùng hằng số `HTTP_STATUS`.
  * Trạng thái dùng hằng số `STATUS`.
  * Thông báo dùng `APP_MESSAGES`.
  * URL backend dùng `ENV.API_BASE_URL`.
* **Code mẫu**:
```typescript
// ❌ SAI (Hardcode magic strings, numbers, URL):
if (error.response?.status === 401) { alert("Phiên hết hạn"); }
const response = await axios.get("https://localhost:5079/api/v1/vaults");

// ✅ ĐÚNG (Zero Hardcoding qua constants):
import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { APP_MESSAGES } from '@/shared/constants/messages';
import { ENV } from '@/shared/config/env';

if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
  toast.error(APP_MESSAGES.ERROR.UNAUTHORIZED);
}
```

### Quy tắc 3: Tương Thích Chuẩn DTO C# ASP.NET Core 8 Backend
* **Quy định**: Mọi Model, DTO và tham số truy vấn ở Frontend bắt buộc phải ánh xạ 1:1 với các lớp C# DTO phía Backend.
* **Code mẫu**:
```typescript
// Định nghĩa DTO chuẩn C# tại client/src/shared/types/pagination.ts
export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### Quy tắc 4: Quy Trình 4 Bước Chuẩn Khi Tạo Feature Mới
* **Quy định**: Khi phát triển bất kỳ feature nào, developer và AI bắt buộc tuân theo thứ tự 4 bước:
  1. **Bước 1**: Khai báo Model (Types & Zod Schemas).
  2. **Bước 2**: Khai báo API Service (kế thừa `createBaseService`).
  3. **Bước 3**: Tạo Custom React Query Hooks (`useQuery`, `useMutation` kèm `queryKeys`).
  4. **Bước 4**: Lắp ráp UI với `react-hook-form`, `zodResolver` và `@/shared/ui`.
* **Code mẫu**:
```typescript
// Bước 1: model/claim.schema.ts
export const createClaimSchema = z.object({
  deathCertRecordNumber: z.string().min(5, "Số hiệu hộ tịch không hợp lệ"),
  deathDate: z.string().date("Ngày mất không hợp lệ")
});

// Bước 2: api/claimService.ts
export const claimService = {
  submitClaim: (data: CreateClaimInput) => axiosClient.post<ApiResponse<ClaimDto>>('/claims', data)
};

// Bước 3: model/useClaims.ts
export const useSubmitClaimMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimService.submitClaim,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] })
  });
};
```

### Quy tắc 5: Chuẩn Mực Giao Diện 4 Trạng Thái (State-Driven UI Coverage)
* **Quy định**: Mọi màn hình tải dữ liệu bất đồng bộ bắt buộc xử lý đầy đủ 4 trạng thái: `isLoading`, `isError`, `isEmpty`, và `isSuccess`. Cấm việc chỉ kiểm tra `isLoading` mà bỏ quên `isEmpty` hay `isError`.
* **Code mẫu**:
```typescript
export const VaultListWidget = () => {
  const { data: vaults, isLoading, isError, error, refetch } = useVaults();

  if (isLoading) return <VaultTableSkeleton rows={5} />;
  if (isError) return <ErrorAlert message={error.message} onRetry={refetch} />;
  if (!vaults || vaults.length === 0) return <EmptyState title="Chưa có kho nào" actionLabel="+ Tạo kho mới" />;

  return <VaultTable data={vaults} />;
};
```

---

## NHÓM II: CHUẨN MỰC CỘNG TÁC, BẢN QUYỀN CODE & DESIGN PATTERNS (QUY TẮC 6 - 10)

### Quy tắc 6: Đặt Tên, Git Conventional Commits & Gitflow
* **Quy định**:
  * File Component: `PascalCase.tsx` (VD: `LegalDropzone.tsx`).
  * File Hook: `camelCase` bắt đầu bằng `use` (VD: `useVaultState.ts`).
  * File Service: `camelCaseService.ts` (VD: `notaryService.ts`).
  * Git Commit: Bắt buộc dùng Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`.
  * Gitflow: Nhánh tính năng đặt tên `feat/<tên-chức-năng>` tạo từ `develop`.

### Quy tắc 7: Nguyên Tắc 'Không Code Sẵn' & Bản Thiết Kế // TODO 5 Thông Số
* **Quy định**: AI TUYỆT ĐỐI KHÔNG VIẾT SẴN TOÀN BỘ LOGIC NGHIỆP VỤ. AI chỉ dựng khung (Scaffold) và để lại hướng dẫn `// TODO` với 5 thông số bắt buộc:
  1. `[Mục tiêu & Nghiệp vụ]`
  2. `[Input & Output]`
  3. `[Các bước tuần tự]`
  4. `[Hàm / Thư viện cần dùng]`
  5. `[Điều kiện biên & Bắt ngoại lệ]`
* **Code mẫu**:
```typescript
export async function verifySignature(msg: string, sig: string): Promise<boolean> {
  // TODO: [BẢN THIẾT KẾ THỰC THI - DEVELOPER BLUEPRINT]
  // 1. [MỤC TIÊU]: Xác thực chữ ký ECDSA P-256 đối chiếu với manifestHash.
  // 2. [INPUT]: msg (string), sig (base64 string). [OUTPUT]: boolean.
  // 3. [CÁC BƯỚC]:
  //    - Chuyển msg sang Uint8Array qua TextEncoder.
  //    - Chuyển sig Base64 về ArrayBuffer.
  //    - Gọi window.crypto.subtle.verify(...) với thuật toán ECDSA SHA-256.
  // 4. [THƯ VIỆN]: Sử dụng Web Crypto API thuần, không dùng thư viện ngoài.
  // 5. [EDGE CASES]: Bắt lỗi sig rỗng hoặc sai định dạng ASN.1/DER.
  throw new Error("Chưa cài đặt verifySignature - Developer tự hoàn thiện logic.");
}
```

### Quy tắc 8: Tiêu Chuẩn Bắt Buộc JSDoc / TSDoc / C# XML Doc 100%
* **Quy định**: Mọi hàm, interface, hook, component đều phải có chú thích chuẩn mực.
* **Code mẫu**:
```typescript
/**
 * @description Tính toán tỷ lệ phân bổ tài sản thừa kế cho người thụ hưởng
 * @param {number} totalAssets Tổng giá trị tài sản trong kho di sản
 * @param {number} percentage Tỷ lệ phần trăm được hưởng (0.01 - 100.00)
 * @returns {number} Giá trị tài sản thực tế được phân bổ
 * @throws {RangeError} Ném ra lỗi nếu percentage vượt quá 100 hoặc nhỏ hơn 0
 */
export function calculateShareAmount(totalAssets: number, percentage: number): number { ... }
```

### Quy tắc 9: Bộ Ba Design Patterns Thực Chiến (Strategy, Adapter, State Machine)
* **Quy định**:
  * **Strategy Pattern** (`features/assets/model/strategies/`): Xử lý hiển thị và giải mã cho từng loại tài sản (Crypto, Credential, Document). Cấm dùng switch-case trong UI.
  * **Adapter Pattern** (`entities/*/lib/adapters.ts`): Chuyển đổi DTO Backend thành ViewModel Frontend.
  * **State Machine Pattern** (`entities/vault/model/vaultState.ts`): Kiểm soát chuyển trạng thái kho qua `VAULT_TRANSITIONS`.
* **Code mẫu**:
```typescript
// Strategy Pattern
export interface AssetStrategy {
  validate(payload: unknown): boolean;
  renderViewer(payload: unknown): React.ReactNode;
}
export const assetStrategyMap: Record<AssetType, AssetStrategy> = {
  CRYPTO_WALLET: new CryptoStrategy(),
  CREDENTIAL: new CredentialStrategy(),
  DOCUMENT: new DocumentStrategy()
};
```

### Quy tắc 10: Nhận Diện Master UI Kit & 5 Domain Protocol Components
* **Quy định**: Tuân thủ 100% bảng màu Heritage: Forest Green (`#0B291E`), Champagne Gold (`#B88E4C`), Canvas (`#FAF9F5`). Áp dụng bộ 5 linh kiện nghiệp vụ cốt lõi:
  1. **Masked Private Key 12 Seed Words** (3 cột).
  2. **Live DMS Heartbeat Card** (pulse-dot xanh, nút ⚡ I am Alive).
  3. **Legal Dropzone** (Tính băm SHA-256 trực tiếp tại client).
  4. **Video Affidavit Frame** (Khung webcam tuyên thệ 15s - Điều 630 BLDS).
  5. **Hộp Cảnh Báo Tuân Thủ Pháp Luật** (Điều 612 khóa trần 50% & Điều 644 diện bắt buộc).

---

## NHÓM III: TRẢI NGHIỆM NGƯỜI DÙNG QUỐC TẾ & QUẢN LÝ STATE (QUY TẮC 11 - 15)

### Quy tắc 11: 5 Trụ Cột UI/UX Tiêu Chuẩn Quốc Tế
* **Quy định**: Tuân thủ 10 Heuristics (NN/g), lưới 8-point Grid Spacing, tỷ lệ màu 60-30-10, chuẩn tiếp cận WCAG 2.1 AA (tương phản 4.5:1, phím bấm ≥ 44x44px), và Laws of UX (Hick's Law chia nhỏ Stepper, Miller's Law chia nhóm 12 seed phrase).

### Quy tắc 12: Phân Loại & Tách Biệt State (Zero Lạm Dụng useState)
* **Quy định**: Cấm nhét mọi thứ vào `useState`. Phân chia rõ ràng:
  * **Server State**: TanStack Query (`useQuery`, `useMutation`).
  * **Form State**: React Hook Form + Zod.
  * **URL State**: `useSearchParams` / `nuqs` (Bộ lọc, phân trang, tab).
  * **Global Client State**: Redux Toolkit (auth, demo mode, theme).
  * **Local UI State**: `useState` tối giản cho tương tác DOM cục bộ (Modal `isOpen`, ẩn/hiện mật khẩu).
* **Code mẫu**:
```typescript
// ❌ SAI (Lạm dụng useState cho Server Data):
const [data, setData] = useState([]);
useEffect(() => { fetch(...).then(setData); }, []);

// ✅ ĐÚNG (TanStack Query chuẩn mực):
const { data, isLoading } = useQuery({ queryKey: ['vaults'], queryFn: vaultService.getAll });
```

### Quy tắc 13: Bốn Tinh Chỉnh Kỹ Thuật Hợp Đồng FE & BE
* **Quy định**:
  1. **Presigned URL R2**: Client băm SHA-256 → Xin Presigned URL → Đẩy file trực tiếp lên Cloudflare R2 (Zero Egress).
  2. **Shamir 2/3**: Tái hợp mảnh khóa 1 & 2 trực tiếp tại biến RAM, cấm lưu vào localStorage hay Cookie.
  3. **PDF/A Biên bản**: Backend C# sinh và đóng dấu chữ ký số; Frontend chỉ preview và download.
  4. **Header Interceptor**: `axiosClient` luôn tự động đính kèm `X-Active-Role` và `X-Demo-Mode: true`.

### Quy tắc 14: Thỏa Thuận 'Hướng 1' (Phân Định Vai Trò AI vs Developer)
* **Quy định**:
  * **AI**: Kiến trúc sư & Dựng khung cấu trúc FSD, DTO, Zod schema, Service contract, UI Skeleton, hướng dẫn `// TODO` và viết unit tests.
  * **Developer**: Trực tiếp làm chủ và tự tay viết code logic nghiệp vụ (business logic, crypto, submit handlers).

### Quy tắc 15: Quy Chuẩn Lập Kế Hoạch Triển Khai Thực Chiến (6 Trụ Cột Implementation Plan)
* **Quy định**: Mọi bản kế hoạch triển khai bắt buộc bóc tách đủ 6 thành phần:
  1. Mã Use Case & Endpoint API.
  2. Thứ tự phân tầng FSD.
  3. Ma trận tệp tin (`CREATE` / `MODIFY`).
  4. Bóc tách Micro-Tasks (Schema, Interface, Hook, Cache key).
  5. Xử lý điều kiện biên & Ngoại lệ.
  6. Tiêu chí nghiệm thu (DoD): Automated commands và Manual UI click scenarios.

---

## NHÓM IV: KHẮC CHẾ LỖI AI & BẢO ĐẢM TÍNH TOÀN VẸN CODE (QUY TẮC 16 - 20)

### Quy tắc 16: Cấm Tuyệt Đối Viết Code Cắt Xén (Zero Truncation Rule)
* **Quy định**: AI tuyệt đối không được dùng dấu ba chấm `...` để đại diện cho code bị ẩn. Mọi file sinh ra hoặc cập nhật bắt buộc phải hoàn chỉnh 100% cú pháp, đầy đủ từ dòng import đầu tiên đến dòng export cuối cùng, đảm bảo copy vào project là compile thành công.
* **Code mẫu**:
```typescript
// ❌ SAI (AI cắt xén làm hỏng cú pháp file):
import { Button } from '@/shared/ui';
// ... các import khác giữ nguyên
export const MyComponent = () => {
  // ... code cũ giữ nguyên
  return <div>New Feature</div>;
};

// ✅ ĐÚNG (File hoàn chỉnh toàn vẹn 100%):
import React from 'react';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';

export const MyComponent: React.FC = () => {
  return (
    <Card className="p-4">
      <Button variant="heritage">New Feature</Button>
    </Card>
  );
};
```

### Quy tắc 17: Type-Safety Tuyệt Đối & Cấm Cửa Thoát Hiểm (Zero any & No @ts-ignore)
* **Quy định**: Cấm 100% từ khóa `any`, `@ts-ignore`, `@ts-nocheck` trong toàn bộ codebase. Dữ liệu chưa xác định phải dùng `unknown` kết hợp Type Guards hoặc Zod schema narrowing.
* **Code mẫu**:
```typescript
// ❌ SAI (Dùng cửa thoát hiểm any):
const handleData = (payload: any) => { console.log(payload.user.id); }; // Dễ gây runtime crash nếu payload null!

// ✅ ĐÚNG (Strict Type Guard & Zod Parse):
const handleData = (payload: unknown): void => {
  const result = userPayloadSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(`Dữ liệu không hợp lệ: ${result.error.message}`);
  }
  console.log(result.data.user.id); // Type an toàn 100%
};
```

### Quy tắc 18: Kiểm Soát Thư Viện Thực Tế (Zero Speculative Packages & Native-First)
* **Quy định**: Ưu tiên Native Web APIs số 1 (Web Crypto API, WebAuthn, WebRTC). Chỉ dùng các thư viện đã được phê duyệt trong `package.json`. Cấm tự ý bịa ra package lạ hoặc đòi cài thêm thư viện mật mã bên ngoài (như `crypto-js`) khi chưa có sự đồng ý của developer.
* **Code mẫu**:
```typescript
// ❌ SAI (Tự ý đòi cài crypto-js ngoài package.json):
import CryptoJS from 'crypto-js'; // Bị cấm! Tăng bundle size và vi phạm kiến trúc

// ✅ ĐÚNG (Sử dụng Web Crypto API thuần của trình duyệt):
export async function computeSha256(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Quy tắc 19: Nhất Quán Đặt Tên Hợp Đồng FE & BE (Contract Naming Consistency)
* **Quy định**: Backend ASP.NET Core xuất JSON camelCase. Frontend DTO giữ nguyên camelCase. Database Entity giữ snake_case (VD: `national_id_number`). Mọi chuyển đổi DTO sang ViewModel bắt buộc tập trung tại Adapter Pattern (`adapters.ts`), cấm parse phân tán trong UI.
* **Code mẫu**:
```typescript
// Adapter chuẩn mực tại entities/vault/lib/adapters.ts
export const vaultAdapter = {
  toViewModel: (dto: VaultResponseDto): VaultViewModel => ({
    id: dto.id,
    name: dto.vaultName,
    statusText: STATUS_TEXT_MAP[dto.status] ?? 'Không xác định',
    isLocked: dto.status !== 'ACTIVE',
    formattedDate: new Date(dto.createdAt).toLocaleDateString('vi-VN')
  })
};
```

### Quy tắc 20: Bộ Lọc Tự Kiểm Toán Trước Khi Xuất Code (AI Pre-Output Self-Verification Gate)
* **Quy định**: Trước khi gửi bất kỳ đoạn code nào, AI bắt buộc phải tự động đối soát 6 bước:
  1. Tuân thủ Hướng 1 (Scaffold + // TODO Blueprint).
  2. Đúng phân tầng FSD một chiều.
  3. JSDoc/TSDoc đầy đủ 100%.
  4. Zero hardcode (Constants/Enums).
  5. Zero useState lạm dụng.
  6. File không bị cắt lửng (100% full content).

---

## NHÓM V: TIÊU CHUẨN DOANH NGHIỆP, BẢO MẬT & HIỆU NĂNG (QUY TẮC 21 - 25)

### Quy tắc 21: Chiến Lược Quản Lý Lỗi 3 Tầng (Multi-Tier Error Resilience)
* **Quy định**: Phân định rạch ròi 3 tầng lỗi:
  * **Tầng 1 (Form Input)**: Hiển thị Inline Error.
  * **Tầng 2 (API Call)**: Dùng Toast notification.
  * **Tầng 3 (Runtime Crash)**: Bọc `ErrorBoundary` toàn cục.
* **Code mẫu**:
```typescript
// Tầng 3: ErrorBoundary Fallback UI
export class GlobalErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#FAF9F5] p-6 text-center">
          <h2 className="text-2xl font-bold text-[#0B291E]">Đã xảy ra sự cố không mong muốn</h2>
          <p className="mt-2 text-sm text-gray-600">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-[#0B291E] px-6 py-2.5 text-white">
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Quy tắc 22: Bảo Mật Frontend Thực Chiến (OWASP Top 10 for SPAs)
* **Quy định**: Tuyệt đối không lưu Private Key, Seed Phrase, Mật khẩu vào `localStorage`, `sessionStorage` hay Cookie. Dữ liệu giải mã chỉ được lưu trong biến RAM. Cấm dùng `dangerouslySetInnerHTML` không qua `DOMPurify`. Khóa nhúng iFrame qua CSP `X-Frame-Options: DENY`.
* **Code mẫu**:
```typescript
// ❌ SAI (Lỗ hổng chí mạng: Lưu khóa bí mật vào localStorage):
localStorage.setItem("user_private_key", privateKey); // Hacker chỉ cần 1 script XSS là lấy cắp toàn bộ di sản!

// ✅ ĐÚNG (Chỉ giữ CryptoKey object trong RAM biến cục bộ hoặc React Context unmount tự hủy):
const [ephemeralKey, setEphemeralKey] = useState<CryptoKey | null>(null);
useEffect(() => {
  return () => { setEphemeralKey(null); }; // Dọn sạch RAM ngay khi unmount component
}, []);
```

### Quy tắc 23: Tối Ưu Hiệu Năng & Trì Hoãn Tải (Code-Splitting & Performance Budget)
* **Quy định**: Dùng `React.lazy()` và `Suspense` cho tất cả các trang và modal nặng. Áp dụng Debounce 300ms - 500ms cho ô tìm kiếm.
* **Code mẫu**:
```typescript
import React, { Suspense } from 'react';
const SplitScreenViewer = React.lazy(() => import('@/features/notary/ui/SplitScreenViewer'));

export const NotaryPage = () => (
  <Suspense fallback={<div className="p-8 text-center">Đang tải bộ xem PDF...</div>}>
    <SplitScreenViewer />
  </Suspense>
);
```

### Quy tắc 24: Trải Nghiệm Lạc Quan (Optimistic UI) & Cache Invalidation
* **Quy định**: Với các hành động nhanh phi pháp lý, UI cập nhật ngay tức thì trước khi API phản hồi; nếu API lỗi thì rollback. Mọi mutation thành công bắt buộc gọi `queryClient.invalidateQueries()`. Lưu ý: **Cấm dùng Optimistic UI** cho các thao tác nhạy cảm pháp lý (DMS Heartbeat, duyệt hồ sơ Verifier, nộp AliveClaim, bàn giao tài sản, thanh toán).
* **Code mẫu**:
```typescript
const { mutate: pingAlive } = useMutation({
  mutationFn: dmsService.pingAlive,
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ['dms-status'] });
    const prev = queryClient.getQueryData(['dms-status']);
    queryClient.setQueryData(['dms-status'], (old: any) => ({ ...old, isAlive: true, lastPing: new Date() }));
    return { prev };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['dms-status'], context?.prev); // Rollback nếu lỗi
    toast.error("Điểm danh thất bại. Đang khôi phục lại trạng thái cũ.");
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['dms-status'] })
});
```

### Quy tắc 25: Khả Năng Quan Sát & Dấu Vết Sự Cố (Correlation Tracing)
* **Quy định**: Mọi request trong `axiosClient` tự sinh và gắn header `X-Correlation-ID: crypto.randomUUID()`. Khi Backend lỗi 500, lỗi trả về kèm Correlation ID để tra cứu log.
* **Code mẫu**:
```typescript
// axiosClient.ts Interceptor
axiosClient.interceptors.request.use((config) => {
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
});
```

---

## NHÓM VI: HẠ TẦNG DỮ LIỆU, MẠNG & TỰ ĐỘNG HÓA CHẤT LƯỢNG (QUY TẮC 26 - 30)

### Quy tắc 26: An Toàn Di Trú Cơ Sở Dữ Liệu & Giao Tác Nguyên Khối (EF Core Migrations & ACID Transactions)
* **Quy định**: Mọi thay đổi CSDL bắt buộc qua EF Core Migration. Các nghiệp vụ ghi nhiều bảng bắt buộc bọc trong `IDbContextTransaction` để tự động Rollback nếu có lỗi.
* **Code mẫu (C# Backend)**:
```csharp
using var transaction = await _context.Database.BeginTransactionAsync();
try {
    _context.Vaults.Add(newVault);
    _context.AssetAllocations.AddRange(allocations);
    _context.KeyShares.AddRange(shares);
    _context.AuditLogs.Add(auditLog);
    await _context.SaveChangesAsync();
    await transaction.CommitAsync(); // Cam kết toàn bộ thành công
} catch (Exception) {
    await transaction.RollbackAsync(); // Hoàn tác 100% nếu 1 bảng bị lỗi
    throw;
}
```

### Quy tắc 27: Quản Trị Phiên Bản API & Chính Sách Không Gãy Vỡ (API Versioning & Backward Compatibility)
* **Quy định**: Mọi endpoint Backend bắt buộc đặt tiền tố `/api/v1/[controller]`. Cấm xóa hoặc đổi tên trường dữ liệu trong DTO đang chạy. Trường mới bắt buộc là Optional.
* **Code mẫu (C# Backend)**:
```csharp
[ApiController]
[Route("api/v1/[controller]")]
public class VaultsController : ControllerBase { ... }
```

### Quy tắc 28: Phòng Thủ Tấn Công Mạng & Giới Hạn Tần Suất (Zero-Trust & Rate Limiting)
* **Quy định**: Áp dụng Rate Limiting tại Backend cho Auth, DMS Ping và Public API. Client-side tự disable nút bấm ngay khi click để chống double-submit.
* **Code mẫu (C# Backend Program.cs)**:
```csharp
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("AuthLimiter", opt => {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});
```

### Quy tắc 29: Cổng Kiểm Soát Chất Lượng Tự Động CI/CD & Git Pre-commit Hooks
* **Quy định**: Cài đặt Husky + lint-staged tại client để tự động chạy check tsc và eslint. Pipeline CI/CD bắt buộc chạy type-check và test trước khi merge.
* **Code mẫu (package.json)**:
```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  },
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "tsc --noEmit && lint-staged"
  }
}
```

### Quy tắc 30: Chuẩn Mực Khả Năng Tiếp Cận & Semantic HTML (Accessibility a11y & Focus Trap)
* **Quy định**: Dùng thẻ ngữ nghĩa, cấm dùng div cho click event. Mọi Modal bắt buộc có Focus Trap và đóng bằng phím Escape. Mọi icon button bắt buộc có `aria-label`.
* **Code mẫu**:
```typescript
// ✅ ĐÚNG: Semantic button có aria-label rõ ràng
<button
  type="button"
  onClick={toggleMask}
  aria-label={isMasked ? "Hiển thị khóa riêng tư" : "Ẩn khóa riêng tư"}
  className="p-2 rounded-lg hover:bg-gray-100"
>
  {isMasked ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
</button>
```

---

## PHẦN II: QUY CHUẨN LÀM VIỆC VỚI GIT VÀ QUẢN TRỊ DỰ ÁN AGILE/SCRUM (ENTERPRISE GIT & PROJECT MANAGEMENT WORKFLOW)

### 1. QUY CHUẨN QUẢN TRỊ DỰ ÁN AGILE / SCRUM & JIRA
* **Chu kỳ Sprint 2 tuần**: Sprint Planning (Đầu sprint), Daily Standup (15 phút mỗi sáng), Sprint Review & Demo (Cuối sprint), Sprint Retrospective (Rút kinh nghiệm).
* **Quy chuẩn Issue Types trên Jira**:
  * **Epic**: Gói tính năng lớn cấp hệ thống (VD: `[LV-EPIC-01]` Quản lý Két Di Sản Số E2EE).
  * **Story**: Tính năng người dùng theo cấu trúc "Là... Tôi muốn... Để..." kèm Acceptance Criteria cụ thể.
  * **Task**: Nhiệm vụ kỹ thuật thuần túy (VD: Cấu hình Cloudflare R2, Cài đặt EF Core Migration).
  * **Bug**: Lỗi phát sinh trong quá trình kiểm thử hoặc review (phân loại Critical, High, Medium, Low).
* **Quy chuẩn Đánh giá Story Points theo dãy Fibonacci**: 1, 2, 3, 5, 8. Không bao giờ gán task quá 8 points (nếu 13 points bắt buộc phải phân rã nhỏ hơn).
* **Định nghĩa Sẵn sàng (Definition of Ready - DoR) & Định nghĩa Hoàn thành (Definition of Done - DoD)**.

### 2. CHIẾN LƯỢC PHÂN NHÁNH GIT (GITFLOW STRATEGY)
* **Nhánh `main` (Production)**: Được bảo vệ (Protected branch), khóa quyền đẩy trực tiếp (No direct push), chỉ nhận merge từ develop qua Release PR hoặc `hotfix/*` khẩn cấp.
* **Nhánh `develop` (Integration)**: Nhánh tích hợp trung tâm của cả nhóm, chỉ nhận merge qua Pull Request có phê duyệt.
* **Cú pháp đặt tên nhánh bắt buộc liên kết mã Jira Issue**:
  * `feat/<jira-key>-<tên-chức-năng>` (VD: `feat/LV-102-dms-heartbeat-card`).
  * `fix/<jira-key>-<tên-lỗi>` (VD: `fix/LV-205-login-redirect-403`).
  * `hotfix/<jira-key>-<tên-lỗi-khẩn>` (VD: `hotfix/LV-911-jwt-secret-leak`).
  * `refactor/<jira-key>-<tên-nhiệm-vụ>` (VD: `refactor/LV-140-api-base-service`).

### 3. QUY CHUẨN COMMIT MÃ NGUỒN (CONVENTIONAL & ATOMIC COMMITS)
* **Cú pháp commit bắt buộc**: `<type>(<scope>): [<jira-key>] <mô tả ngắn gọn dưới 72 ký tự>`
* **Các type được phép**: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`.
* **Nguyên tắc Atomic Commit**: Mỗi commit chỉ giải quyết đúng 1 thay đổi logic duy nhất. Cấm gom 10 file linh tinh vào một commit vô nghĩa "update code" hay "fix bug".
* **Ví dụ commit chuẩn**:
```bash
git commit -m "feat(dms): [LV-102] add pulse-dot heartbeat card and live countdown widget"
git commit -m "fix(auth): [LV-205] handle 401 unauthorized redirect to login page"
```

### 4. QUY TRÌNH PULL REQUEST (PR) & CODE REVIEW (2-APPROVALS RULE)
* **Tiêu đề PR**: `[<jira-key>] <Tên tính năng ngắn gọn>`
* **Mẫu mô tả PR (PR Template) bắt buộc**:
  * Tóm tắt thay đổi (Summary of Changes).
  * Liên kết Jira Issue.
  * Ảnh chụp / Video bằng chứng hoạt động (Screenshots / Recording).
  * Checklist của tác giả: Đã type-check (0 error), đã chạy unit test (100% pass), đã xóa console.log/debugger.
* **Quy tắc Duyệt Code (Code Review)**: Bắt buộc tối thiểu 1 - 2 thành viên (FE Lead hoặc Team Lead) phê duyệt (Approve) mới được merge.
* **Chiến lược Merge**: Dùng "Squash and Merge" hoặc "Rebase and Merge" để giữ lịch sử Git trên nhánh develop luôn sạch sẽ (Linear Git History), loại bỏ hoàn toàn các merge commit rác.

### 5. KỊCH BẢN THAO TÁC GIT TỪ A ĐẾN Z CHO DEVELOPER (STEP-BY-STEP CHEATSHEET)
1. Đồng bộ code develop mới nhất: `git checkout develop && git pull origin develop`
2. Tạo nhánh làm việc: `git checkout -b feat/LV-102-dms-heartbeat`
3. Lập trình và kiểm tra: `npm run type-check && npm run test:run`
4. Đẩy nhánh lên remote: `git push -u origin feat/LV-102-dms-heartbeat`
5. Mở PR trên GitHub và gán reviewer.
6. Sau khi được duyệt và merge, xóa nhánh cục bộ: `git branch -d feat/LV-102-dms-heartbeat`

---

## QUY TẮC 31: NHỊP ĐIỆU MICRO-COMMIT & ĐIỂM DỪNG KIỂM SOÁT (MICRO-COMMIT RHYTHM & CHECKPOINT CADENCE)

### 1. Hiểm họa của việc 'Viết một lèo không commit'
* Mất khả năng Rollback khi code lỗi: Lỡ tay `git checkout .` là mất sạch toàn bộ code vừa sinh.
* Gây khủng hoảng Merge Conflict cho các thành viên trong nhóm.
* Tạo ra các Pull Request khổng lồ (Mega PRs hàng nghìn dòng) khiến việc Code Review trở nên bất khả thi.

### 2. Quy tắc 4 Nhịp Commit Chuẩn Mực (The 4-Beat Commit Rhythm)
Cấm AI sinh liên tục quá 3 file mà không yêu cầu dừng lại commit. Bắt buộc chia nhỏ thành 4 nhịp rõ ràng:
* **Nhịp 1 (Model & Schemas)**: Sinh Types/Zod schemas → Chạy type-check → Bắt buộc commit:
  ```bash
  git commit -m "feat(<module>): [<jira-key>] define types and zod validation schemas"
  ```
* **Nhịp 2 (API Service & Hooks)**: Sinh Service & Custom Query Hooks → Commit:
  ```bash
  git commit -m "feat(<module>): [<jira-key>] implement api service and query hooks"
  ```
* **Nhịp 3 (UI Components & Modals)**: Sinh giao diện và wireframe layout → Commit:
  ```bash
  git commit -m "feat(<module>): [<jira-key>] scaffold ui components and form layout"
  ```
* **Nhịp 4 (Unit Tests & Hoàn thiện)**: Viết unit tests → Chạy test:run pass 100% → Commit và Push:
  ```bash
  git commit -m "test(<module>): [<jira-key>] add unit tests for validation and logic"
  git push origin feat/<branch-name>
  ```

### 3. Trách nhiệm bắt buộc của AI Assistant
* **Sau mỗi nhịp (tối đa 2-3 file liên quan trực tiếp), AI BẮT BUỘC PHẢI DỪNG LẠI.**
* **AI phải cung cấp sẵn câu lệnh `git add` và `git commit` mẫu chuẩn xác kèm mã Jira tương ứng** để Developer copy chạy ngay, tạo điểm dừng an toàn (Checkpoint) trước khi yêu cầu AI viết tiếp nhịp sau.

---

## THAM CHIẾU HỢP ĐỒNG KỸ THUẬT CHÍNH THỨC
- Quy chuẩn vòng đời trạng thái: [STATE_MACHINES.md](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/02_architecture/STATE_MACHINES.md)
- Ma trận phân quyền truy cập: [PERMISSION_MATRIX.md](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/02_architecture/PERMISSION_MATRIX.md)
- Danh mục mã lỗi hệ thống: [ERROR_CODES.md](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/02_architecture/ERROR_CODES.md)
- Hướng dẫn tích hợp Backend: [BE_INTEGRATION_GUIDE.md](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/03_api_and_integration/BE_INTEGRATION_GUIDE.md)
- Hướng dẫn tích hợp Frontend: [FE_INTEGRATION_GUIDE.md](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/03_api_and_integration/FE_INTEGRATION_GUIDE.md)
- Lược đồ cơ sở dữ liệu: [DATABASE_SCHEMA_ERD.md](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/02_architecture/DATABASE_SCHEMA_ERD.md)
