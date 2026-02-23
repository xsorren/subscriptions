import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { HttpError } from './errors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !anonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

export async function requireUser(req: Request): Promise<{ id: string; email?: string | null }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw new HttpError(401, 'unauthenticated', 'Missing bearer token');
  }

  const supabaseUserClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabaseUserClient.auth.getUser();
  if (error || !data.user) {
    throw new HttpError(401, 'unauthenticated', 'Invalid or expired user token');
  }

  return { id: data.user.id, email: data.user.email };
}
