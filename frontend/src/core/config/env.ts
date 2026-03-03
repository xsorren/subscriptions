export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://mock-project.supabase.co',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'mock-anon-key',
};

export function assertEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables. App will run in static/mock mode.');
  }
}
