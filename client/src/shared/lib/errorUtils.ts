import axios from 'axios';

/**
 * Standard utility to safely extract error messages without using `any`.
 * Complies with Rule 17 (Zero `any`) and Rule 25 (RFC 7807 ProblemDetails & Correlation ID).
 */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const correlationId = err.response?.headers?.['x-correlation-id'] || err.config?.headers?.['X-Correlation-ID'];
    const detail = err.response?.data?.detail || err.response?.data?.title || err.response?.data?.message;
    if (detail) {
      return correlationId ? `${detail} (Ref: ${correlationId})` : String(detail);
    }
    if (err.message) {
      return correlationId ? `${err.message} (Ref: ${correlationId})` : err.message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
}
