# LegacyVault · Digital Estate & Post-Mortem Asset Handover Platform
> **Đồ án Tốt nghiệp / Dự án Chuyên ngành Kỹ thuật Phần mềm (SWP391 - Fall 2026)**  
> Nền tảng ủy thác, bảo quản và chuyển giao tài sản số, bí mật di sản sau khi qua đời với kiến trúc Zero-Knowledge và Dead Man's Switch (DMS).

---

## 🌟 Giới thiệu Tổng quan

**LegacyVault** là hệ thống quản lý và bàn giao di sản số tự động đầu tiên tại Việt Nam tuân thủ nghiêm ngặt:
- **Luật Giao dịch điện tử 2023 (Luật số 20/2023/QH15)**: Giá trị pháp lý của thông điệp dữ liệu và chứng thư điện tử.
- **Bộ luật Dân sự 2015 (Luật số 91/2015/QH13)**: Quyền để lại di chúc (Điều 624-630) và quyền/nghĩa vụ của người quản trị di sản (Điều 616).
- **Bộ luật Tố tụng Dân sự 2015 (Luật số 92/2015/QH13)**: Tính toàn vẹn và giá trị chứng cứ điện tử (Điều 95).

---

## 🚀 8 Trụ cột Công nghệ lõi (Đã tích hợp trong Prototype)

1. **Google OIDC (OpenID Connect)**: Xác thực danh tính chủ sở hữu qua OAuth2/OIDC, nhận JWT & Subject ID an toàn.
2. **Mã hóa Phong bì (Envelope Encryption - AES-256-GCM)**: Mỗi tệp tin và bí mật số được sinh một DEK (Data Encryption Key) 256-bit độc lập, mã hóa authenticated encryption với IV 12 bytes và Tag 16 bytes.
3. **Phân mảnh Khóa Shamir SSS (2/3 Threshold - Anti-Rogue Admin)**: Master Key được phân tách thành 3 mảnh Shamir trong trường hữu hạn $GF(2^8)$. Quản trị viên hệ thống dù chiếm quyền kiểm soát server cũng chỉ có 1 mảnh (0-bit thông tin về khóa gốc).
4. **Lưu trữ Cloudflare R2 (S3-Compatible)**: Lưu trữ các tệp bản mã (`.enc`) trong Private Bucket, hỗ trợ tải về giải mã trực tiếp trong RAM qua TLS với chi phí băng thông 0đ ($0 Egress).
5. **Cổng thanh toán SePay VietQR**: Tự động sinh mã VietQR động theo đơn hàng, webhook đối soát giao dịch ngân hàng theo thời gian thực để kích hoạt gói cước (`LEGACY_XS`, `LEGACY_XS_MAX`).
6. **Xác thực Danh tính eKYC FPT.AI**: Tích hợp OCR quét Căn cước công dân gắn chip và nhận diện khuôn mặt sống (Liveness Face Match), tự động thẩm định điều kiện pháp lý lập di chúc theo Điều 630 BLDS 2015.
7. **Thông báo bảo mật MailKit SMTP**: Gửi email thông báo, mã PIN kích hoạt và Thư mời Người thừa hành (Executor) với Token một lần có thời hạn (TTL 48 giờ).
8. **Dead Man's Switch (DMS) & Rescue TimeLock**: Chu kỳ điểm danh định kỳ (30 ngày) cùng cơ chế ân hạn cứu hộ (Rescue TimeLock 7 ngày) bảo vệ chống kích hoạt nhầm hoặc chiếm đoạt di sản.

---

## 🏗️ Cấu trúc Thư mục Dự án

```
SWP-Prototype/
├── client/                              # Frontend React 19 + TypeScript + Vite + TailwindCSS
│   ├── src/
│   │   ├── features/                    # Các module kiểm thử công nghệ (Testbenches)
│   │   │   ├── auth-oidc/               # Google OIDC Testbench
│   │   │   ├── crypto-envelope/         # Mã hóa Phong bì AES-256-GCM
│   │   │   ├── shamir-anti-rogue/       # Phân mảnh Shamir SSS (2/3)
│   │   │   ├── storage-r2/              # Cloudflare R2 Private Storage
│   │   │   ├── payment-sepay/           # Cổng thanh toán VietQR SePay
│   │   │   ├── ekyc-verification/       # eKYC FPT.AI (CCCD + Liveness)
│   │   │   ├── fpt-marketplace/         # AI Phân tích Di chúc Saola-Small-32B
│   │   │   ├── notification-mailkit/    # MailKit SMTP Security Alert
│   │   │   └── rescue-timelock/         # Dead Man's Switch & Rescue TimeLock
│   │   └── pages/TestbenchPage.tsx      # Bảng điều khiển kiểm thử trung tâm
├── server/                              # Backend .NET 8 WebApi (Clean Architecture)
│   ├── LegacyVault.Prototype.Application/
│   ├── LegacyVault.Prototype.Domain/
│   ├── LegacyVault.Prototype.Infrastructure/
│   └── LegacyVault.Prototype.WebApi/    # Controllers, Middlewares, Program.cs
├── docs/                                # Thư viện tài liệu kỹ thuật chuẩn hóa
│   ├── 01_requirements/                # Yêu cầu phần mềm (SRS v3.11.0) & Căn cứ pháp lý
│   ├── 02_architecture/                # Kiến trúc hệ thống, Mật mã phong bì & CSDL ERD
│   ├── 03_api_and_integration/         # Hợp đồng API Contract & Hướng dẫn tích hợp
│   ├── 04_business_flows/              # Đặc tả 5 luồng nghiệp vụ & Sơ đồ Swimlane XML
│   ├── 05_design_ui/                   # Design System & UI Kit HTML
│   ├── 06_diagrams_interactive/        # Sơ đồ tương tác độc lập (Archify)
│   ├── ai_knowledge_base/              # 1.259 Điều luật trích xuất cho AI RAG
│   └── README.md                       # Bản đồ điều hướng trung tâm tài liệu
└── run_prototype.bat                   # Script 1-click khởi động toàn bộ hệ thống
```

---

## ⚡ Hướng dẫn Khởi chạy Nhanh

### Yêu cầu tiên quyết:
- **Node.js**: Phiên bản 18+ (khuyến nghị v20+)
- **.NET SDK**: Phiên bản 8.0+

### Cách 1: Khởi chạy bằng file script tự động (Khuyến nghị trên Windows)
Nhấp đúp chuột vào file:
```bash
run_prototype.bat
```
Script sẽ tự động cài đặt dependency, build backend và khởi động cả hai máy chủ:
- **Frontend App**: `http://localhost:5173/`
- **Backend API & Swagger**: `http://localhost:5000/swagger`

### Cách 2: Khởi chạy thủ công từng phần
1. **Khởi chạy Backend**:
   ```bash
   cd server/LegacyVault.Prototype.WebApi
   dotnet run
   ```
2. **Khởi chạy Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 📜 Tài liệu Tham khảo & Bản quyền
- Bản quyền thuộc về Đội ngũ Phát triển Dự án **LegacyVault** (SWP391 Fall 2026).
- Mọi thắc mắc kỹ thuật vui lòng tham khảo thư mục [`docs/`](./docs) hoặc liên hệ qua kênh trao đổi nội bộ của nhóm.
