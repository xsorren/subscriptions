import { createContext, PropsWithChildren, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { signInWithOtp, signOut } from '../api/auth.service';
import { useSession } from '../hooks/useSession';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithEmailOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { session, loading } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <AuthContext.Provider value={{ session, loading, isAuthenticated, signInWithEmailOtp: signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
