import { Redirect } from 'expo-router';
import { useRequireAuth } from '../features/auth/hooks/useRequireAuth';
import { LoadingScreen } from '../shared/ui/components/LoadingScreen';

export default function RootIndex() {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading) return <LoadingScreen label="Iniciando House..." />;

  return <Redirect href={isAuthenticated ? '/(app)/(tabs)/home' : '/(public)/sign-in'} />;
}
