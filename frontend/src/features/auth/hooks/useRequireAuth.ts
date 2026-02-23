import { useAuthContext } from '../context/AuthContext';

export function useRequireAuth() {
  return useAuthContext();
}
