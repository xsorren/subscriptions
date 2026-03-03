import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

const MOCK_SESSION: Session = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: 'mock-user-id',
    app_metadata: {},
    user_metadata: { full_name: 'Mock User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos latencia de red al cargar la sesión
    const timer = setTimeout(() => {
      setSession(MOCK_SESSION);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { session, loading };
}
