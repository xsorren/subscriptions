import { jsonResponse, handleOptions } from '../_shared/http.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  return jsonResponse({
    ok: true,
    timestamp: new Date().toISOString(),
    runtime: 'supabase-edge-deno',
    version: 'v1',
  });
});
