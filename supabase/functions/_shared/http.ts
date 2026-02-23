import { corsHeaders } from './cors.ts';
import { HttpError, normalizeError } from './errors.ts';

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function handleOptions(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;

  return new Response('ok', {
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    },
  });
}

export function errorResponse(error: unknown): Response {
  const normalized = normalizeError(error);

  return jsonResponse(
    {
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details ?? null,
      },
    },
    normalized.status
  );
}

export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'invalid_json', 'Invalid JSON body');
  }
}
