import axios from 'axios';

// Access tokens live only in this browser tab's memory.
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  if (!config.headers['X-Correlation-ID']) config.headers['X-Correlation-ID'] = crypto.randomUUID();
  if (accessToken && !config.headers.Authorization) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
}, (error) => Promise.reject(error));

axiosClient.interceptors.response.use((response) => {
  const isLogin = /\/api\/v1\/auth\/(register|password-login|google-oidc|demo-login)$/.test(response.config.url ?? '');
  if (isLogin && response.data?.success && typeof response.data.accessToken === 'string') {
    setAccessToken(response.data.accessToken);
  }
  return response;
}, (error) => {
  if (error.response?.status === 401) clearAccessToken();
  if (error.response?.data) console.warn('[API RFC 7807 ProblemDetails]:', error.response.data);
  return Promise.reject(error);
});
