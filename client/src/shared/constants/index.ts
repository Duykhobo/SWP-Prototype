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
    name: 'Gói Di Sản XS',
    price: 199000,
    priceLabel: '199.000 đ / 365 ngày',
    assets: 20,
    storageMb: 200,
    features: ['Lưu trữ tối đa 20 tài sản', 'Dung lượng 200 MiB', 'Thiết lập Kế hoạch di sản & Chỉ định', 'Bổ nhiệm Người thực thi & Thẩm định'],
    canPlanEstate: true
  },
  LEGACY_XS_MAX: {
    code: 'LEGACY_XS_MAX',
    name: 'Gói Di Sản XS Max',
    price: 399000,
    priceLabel: '399.000 đ / 365 ngày',
    assets: 50,
    storageMb: 500,
    features: ['Lưu trữ tối đa 50 tài sản', 'Dung lượng 500 MiB', 'Xuất bản PDF Kế hoạch an toàn', 'Hỗ trợ ưu tiên'],
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
