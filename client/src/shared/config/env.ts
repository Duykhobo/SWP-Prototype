/**
 * @file env.ts
 * @description Quản lý tập trung các biến môi trường của dự án LegacyVault theo Quy tắc 2 (Zero Hardcoding)
 */

interface EnvironmentConfig {
  /**
   * @description URL gốc của Backend API (mặc định http://localhost:5000)
   */
  readonly API_BASE_URL: string;
  /**
   * @description Cờ kích hoạt chế độ Demo kiểm thử
   */
  readonly IS_DEMO_MODE: boolean;
  /**
   * @description Thời gian chờ tối đa cho các request API (milliseconds)
   */
  readonly API_TIMEOUT_MS: number;
}

export const ENV: EnvironmentConfig = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000',
  IS_DEMO_MODE: (import.meta.env.VITE_DEMO_MODE as string) === 'true' || true,
  API_TIMEOUT_MS: 30000,
} as const;
