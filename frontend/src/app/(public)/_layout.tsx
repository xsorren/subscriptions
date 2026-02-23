import { Redirect, Stack } from 'expo-router';
import { useRequireAuth } from '../../features/auth/hooks/useRequireAuth';
import { LoadingScreen } from '../../shared/ui/components/LoadingScreen';

export default function PublicLayout() {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Redirect href="/(app)/(tabs)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
