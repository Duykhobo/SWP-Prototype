export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const SUBSCRIPTION_TIERS = {
  OWNER_FREE: {
    code: 'OWNER_FREE',
    name: 'Gói Chủ Kho Miễn Phí',
    price: 0,
    priceLabel: '0 đ / Vĩnh viễn',
    assets: 3,
    storageMb: 20,
    features: ['Lưu trữ tối đa 3 tài sản', 'Dung lượng 20 MiB', 'Điểm danh Dead Man\'s Switch cơ bản'],
    canPlanEstate: false
  },
  LEGACY_XS: {
    code: 'LEGACY_XS',
    name: 'Gói Di Sản XS (1 Năm)',
    price: 199000,
    priceLabel: '199.000 đ / 365 ngày',
    assets: 20,
    storageMb: 200,
    features: ['Lưu trữ tối đa 20 tài sản', 'Dung lượng 200 MiB', 'Thiết lập Kế hoạch di sản & Chỉ định', 'Bổ nhiệm Người thực thi & Thẩm định'],
    canPlanEstate: true
  },
  LEGACY_XS_5Y: {
    code: 'LEGACY_XS_5Y',
    name: 'Gói Di Sản XS (5 Năm)',
    price: 799000,
    priceLabel: '799.000 đ / 5 năm (Tiết kiệm 20%)',
    assets: 25,
    storageMb: 250,
    features: ['Lưu trữ 25 tài sản', 'Dung lượng 250 MiB', 'Tiết kiệm 196.000 đ so với mua lẻ', 'Ưu tiên cảnh báo SMS & Email'],
    canPlanEstate: true
  },
  LEGACY_XS_10Y: {
    code: 'LEGACY_XS_10Y',
    name: 'Gói Di Sản XS Bền Vững (10 Năm)',
    price: 1290000,
    priceLabel: '1.290.000 đ / 10 năm (Tiết kiệm 35%)',
    assets: 30,
    storageMb: 300,
    features: ['Lưu trữ 30 tài sản', 'Dung lượng 300 MiB', 'Khóa giá 10 năm chống lạm phát', 'Tiết kiệm 700.000 đ'],
    canPlanEstate: true
  },
  LEGACY_XS_MAX: {
    code: 'LEGACY_XS_MAX',
    name: 'Gói Di Sản XS Max (1 Năm)',
    price: 399000,
    priceLabel: '399.000 đ / 365 ngày',
    assets: 50,
    storageMb: 500,
    features: ['Lưu trữ tối đa 50 tài sản', 'Dung lượng 500 MiB', 'Xuất bản PDF Kế hoạch an toàn', 'Hỗ trợ ưu tiên'],
    canPlanEstate: true
  },
  LEGACY_XS_MAX_5Y: {
    code: 'LEGACY_XS_MAX_5Y',
    name: 'Gói Di Sản XS Max (5 Năm)',
    price: 1590000,
    priceLabel: '1.590.000 đ / 5 năm (Tiết kiệm 20%)',
    assets: 60,
    storageMb: 600,
    features: ['Lưu trữ 60 tài sản', 'Dung lượng 600 MiB', 'Tặng 01 phiên Verifier Video Call', 'Tiết kiệm 405.000 đ'],
    canPlanEstate: true
  },
  LEGACY_XS_MAX_10Y: {
    code: 'LEGACY_XS_MAX_10Y',
    name: 'Gói Di Sản XS Max Hoàng Gia (10 Năm)',
    price: 2490000,
    priceLabel: '2.490.000 đ / 10 năm (Tiết kiệm 38%)',
    assets: 100,
    storageMb: 1000,
    features: ['Lưu trữ 100 tài sản', 'Dung lượng 1 GiB (1.000 MiB)', 'Trọn vẹn 10 năm an tâm', 'Tiết kiệm 1.500.000 đ'],
    canPlanEstate: true
  },
  RECIPIENT_FREE: {
    code: 'RECIPIENT_FREE',
    name: 'Kho Người Nhận Miễn Phí',
    price: 0,
    priceLabel: '0 đ / Vĩnh viễn',
    assets: 2,
    storageMb: 20,
    features: ['Lưu trữ 2 tài sản nhận được', 'Dung lượng 20 MiB'],
    canPlanEstate: false
  },
  RECIPIENT_PLUS: {
    code: 'RECIPIENT_PLUS',
    name: 'Kho Người Nhận Plus',
    price: 49000,
    priceLabel: '49.000 đ / 30 ngày',
    assets: 10,
    storageMb: 200,
    features: ['Lưu trữ 10 tài sản nhận được', 'Dung lượng 200 MiB', 'Gia hạn linh hoạt theo tháng'],
    canPlanEstate: false
  }
} as const;

export const CASE_STATUS = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ADDITIONAL_DOCUMENTS_REQUIRED: 'ADDITIONAL_DOCUMENTS_REQUIRED',
  APPROVED_FOR_DELIVERY: 'APPROVED_FOR_DELIVERY',
  REJECTED: 'REJECTED',
  RESCUE_PENDING: 'RESCUE_PENDING',
  CANCELLED_ALIVE: 'CANCELLED_ALIVE'
} as const;
