import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: đính kèm X-Correlation-ID, X-Active-Role và X-Demo-Mode theo chuẩn FE_INTEGRATION_GUIDE
axiosClient.interceptors.request.use(
  (config) => {
    // 1. Tự động sinh correlation id phân tán
    if (!config.headers['X-Correlation-ID']) {
      config.headers['X-Correlation-ID'] = crypto.randomUUID();
    }

    // 2. Ngữ cảnh vai trò UI (Backend Zero-Trust không dùng header này để phân quyền)
    if (!config.headers['X-Active-Role']) {
      config.headers['X-Active-Role'] = 'OWNER';
    }

    // 3. Demo mode header
    config.headers['X-Demo-Mode'] = 'true';

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: chuẩn hóa lỗi RFC 7807 ProblemDetails
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      console.warn('[API RFC 7807 ProblemDetails]:', error.response.data);
    }
    return Promise.reject(error);
  }
);
