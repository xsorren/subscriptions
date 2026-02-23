export class AppError extends Error {
  code: string;
  context?: Record<string, unknown>;

  constructor(message: string, code = 'unknown_error', context?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}
