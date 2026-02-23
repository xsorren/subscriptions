export class HttpError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function normalizeError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;

  if (error instanceof Error) {
    return new HttpError(500, 'internal_error', error.message);
  }

  return new HttpError(500, 'internal_error', 'Unexpected error');
}
