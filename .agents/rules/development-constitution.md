---
description: "Hiến chương 31 quy tắc phát triển chuẩn mực dự án LegacyVault (SWP391)"
globs: "**/*"
---

# HIẾN CHƯƠNG 31 QUY TẮC PHÁT TRIỂN CHUẨN MỰC DỰ ÁN LEGACYVAULT (SWP391)

Tài liệu này tập hợp 31 Quy tắc cốt lõi (Hard Rules), Quy chuẩn kỹ thuật và Quy trình cộng tác Gitflow/Agile bắt buộc cho toàn bộ thành viên và AI Assistant trong dự án LegacyVault.

Tài liệu chi tiết đầy đủ xem tại: docs/01_requirements/DEVELOPMENT_CONSTITUTION_31_RULES.md

## 1. NGUYÊN TẮC CỐT LÕI AI BẮT BUỘC TUÂN THỦ:
1. **Quy tắc 1 (FSD Phân Tầng Một Chiều)**: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. Cấm import ngược tầng và cấm import chéo giữa các features.
2. **Quy tắc 2 (Zero Hardcoding)**: Dùng constants (`HTTP_STATUS`, `APP_MESSAGES`, `ENV.API_BASE_URL`).
3. **Quy tắc 3 (DTO Mapping 1:1)**: Phía Client ánh xạ 1:1 với C# DTOs Backend.
4. **Quy tắc 4 (Quy Trình 4 Bước Tạo Feature)**: 
   - Bước 1: Model & Zod Schemas.
   - Bước 2: API Service (kế thừa `createBaseService`).
   - Bước 3: Custom React Query Hooks (`queryKeys`).
   - Bước 4: Lắp ráp UI với `react-hook-form`, `zodResolver`, `@/shared/ui`.
5. **Quy tắc 5 (Giao Diện 4 Trạng Thái)**: Bắt buộc đủ `isLoading`, `isError`, `isEmpty`, `isSuccess`.
6. **Quy tắc 7 (Nguyên Tắc 'Không Code Sẵn' - Hướng 1)**: AI dựng khung (Scaffold) và để lại `// TODO` với 5 thông số:
   - `[1. Mục tiêu & Nghiệp vụ]`
   - `[2. Input & Output]`
   - `[3. Các bước tuần tự]`
   - `[4. Hàm / Thư viện cần dùng]`
   - `[5. Điều kiện biên & Bắt ngoại lệ]`
   Developer tự tay hoàn thiện code logic nghiệp vụ thực tế.
7. **Quy tắc 8 (TSDoc/JSDoc/XML Doc 100%)**: Chú thích chuẩn mực toàn bộ hàm, interface, component.
8. **Quy tắc 10 (Master UI Kit)**: Heritage colors (Forest Green `#0B291E`, Champagne Gold `#B88E4C`, Canvas `#FAF9F5`) và 5 linh kiện: Masked Private Key 12 Words, Live DMS Heartbeat Card, Legal Dropzone, Video Affidavit Frame, Hộp Cảnh Báo Tuân Thủ Pháp Luật.
9. **Quy tắc 12 (Zero Lạm Dụng useState)**: Tách Server State (TanStack Query), Form State (React Hook Form), URL State (nuqs), Global (Redux), Local UI state (useState tối giản).
10. **Quy tắc 16 (Zero Truncation Rule)**: Cấm tuyệt đối dùng dấu `...` cắt xén code. Mọi file sinh ra phải hoàn chỉnh 100% cú pháp.
11. **Quy tắc 17 (Zero any & No @ts-ignore)**: Type-safety tuyệt đối, dùng `unknown` + Type Guards hoặc Zod schema safeParse.
12. **Quy tắc 18 (Zero Speculative Packages)**: Native Web APIs số 1 (Web Crypto API, WebAuthn, WebRTC). Cấm tự ý cài thư viện ngoài chưa duyệt.
13. **Quy tắc 20 (Bộ Lọc Tự Kiểm Toán 6 Bước)**: AI kiểm toán 6 bước trước khi xuất code.
14. **Quy tắc 22 (Bảo Mật OWASP)**: Cấm lưu Private Key, Seed Phrase, Mật khẩu vào localStorage/sessionStorage/Cookie. Chỉ giữ trong RAM biến cục bộ tự giải phóng khi unmount.
15. **Quy tắc 25 (Correlation ID)**: Tự động gắn header `X-Correlation-ID: crypto.randomUUID()`.
16. **Quy tắc 26 (EF Core Migrations & ACID)**: Thay đổi DB qua Migration, ghi nhiều bảng bọc trong `IDbContextTransaction`.
17. **Quy tắc 27 (API Versioning)**: Mọi endpoint có tiền tố `/api/v1/[controller]`.
18. **Quy tắc 31 (Nhịp Điệu Micro-Commit & Checkpoint Cadence)**:
   - Cấm sinh liên tục quá 3 file mà không yêu cầu dừng lại commit.
   - Chia 4 nhịp: (1) Model & Schemas → (2) API Service & Hooks → (3) UI Components → (4) Unit Tests & Hoàn thiện.
   - AI dừng lại sau mỗi nhịp và cung cấp sẵn câu lệnh `git add` & `git commit` mẫu kèm Jira Issue ID.
