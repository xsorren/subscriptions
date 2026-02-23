import { HttpError } from './errors.ts';

export function assertString(value: unknown, field: string, minLength = 1): string {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    throw new HttpError(400, 'invalid_payload', `Field ${field} must be a non-empty string`, { field });
  }

  return value.trim();
}

export function assertUuid(value: unknown, field: string): string {
  const parsed = assertString(value, field);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(parsed)) {
    throw new HttpError(400, 'invalid_payload', `Field ${field} must be a valid UUID`, { field });
  }

  return parsed;
}

export function assertNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new HttpError(400, 'invalid_payload', `Field ${field} must be a valid number`, { field });
  }

  return value;
}
