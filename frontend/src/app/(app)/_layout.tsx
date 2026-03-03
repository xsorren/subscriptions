import { Redirect, Stack } from 'expo-router';
import { useRequireAuth } from '../../features/auth/hooks/useRequireAuth';
import { LoadingScreen } from '../../shared/ui/components/LoadingScreen';
import { housePalette } from '../../core/theme/theme';

export default function AppLayout() {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(public)/sign-in" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: housePalette.surface },
        headerTintColor: housePalette.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: housePalette.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="clubs/[clubId]" options={{ title: 'Club' }} />
      <Stack.Screen name="coupons/[couponId]" options={{ title: 'Cupón' }} />
      <Stack.Screen name="coupons/redeem-qr" options={{ title: 'Canje QR' }} />
      <Stack.Screen name="coupons/history" options={{ title: 'Historial de canjes' }} />
    </Stack>
  );
}
