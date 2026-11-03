export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;
  constructor(
    message: string,
    status: number,
    code: string,
    requestId?: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'ScoutingWeb',
      ...options.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      'ติดต่อระบบไม่ได้ กรุณาตรวจการเชื่อมต่อ',
      response.status,
      'INVALID_RESPONSE',
    );
  }
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login')
      window.dispatchEvent(new Event('scouting:session-expired'));
    const error = (
      body as {
        error?: { message?: string; code?: string; requestId?: string };
      }
    ).error;
    throw new ApiError(
      error?.message ?? 'ทำรายการไม่สำเร็จ',
      response.status,
      error?.code ?? 'REQUEST_FAILED',
      error?.requestId,
    );
  }
  return body as T;
}
export function mutation(
  method: string,
  body: unknown,
  idempotent = false,
): RequestInit {
  return {
    method,
    body: JSON.stringify(body),
    headers: idempotent ? { 'Idempotency-Key': crypto.randomUUID() } : {},
  };
}
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่';
