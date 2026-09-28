/**
 * @file messages.ts
 * @description Quản lý thông điệp hệ thống tập trung theo Quy tắc 2 (Zero Hardcoding)
 */

export const APP_MESSAGES = {
  SUCCESS: {
    CREATE: 'Tạo mới thành công.',
    UPDATE: 'Cập nhật dữ liệu thành công.',
    DELETE: 'Xóa dữ liệu thành công.',
    ENCRYPT: 'Mã hóa phong bì AES-256-GCM thành công.',
    DECRYPT: 'Giải mã dữ liệu thành công.',
    CHECK_IN: 'Điểm danh Dead Man\'s Switch thành công.',
    PAYMENT_SUCCESS: 'Giao dịch thanh toán VietQR thành công.',
    RESCUE_SUBMITTED: 'Lệnh cứu hộ "Tôi còn sống" đã được ghi nhận (RESCUE_PENDING).',
  },
  ERROR: {
    UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
    FORBIDDEN: 'Bạn không có quyền truy cập vào tài nguyên này.',
    NETWORK: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.',
    VALIDATION: 'Dữ liệu đầu vào không thỏa mãn quy chuẩn xác thực.',
    FILE_SIZE: 'Tệp tin vượt quá dung lượng tối đa 20 MiB theo quy định.',
    ORDER_EXPIRED: 'Đơn thanh toán VietQR đã hết hạn (quá 15 phút).',
  },
} as const;
