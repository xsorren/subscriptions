import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { Screen } from '../../../shared/ui/Screen';
import { useCreateQrToken } from '../../../features/coupons/hooks/useCreateQrToken';
import { useCouponDetail } from '../../../features/coupons/hooks/useCouponDetail';

export default function CouponDetailScreen() {
  const { couponId } = useLocalSearchParams<{ couponId: string }>();
  const { data: coupon, isLoading: isLoadingCoupon } = useCouponDetail(couponId ?? '');
  const { mutateAsync, data, isPending, error } = useCreateQrToken();

  const canGenerateQr = coupon?.status === 'available';

  const handleGenerateQr = async () => {
    if (!couponId || !canGenerateQr) return;
    await mutateAsync(couponId);
  };

  return (
    <Screen loading={isLoadingCoupon}>
      <Card mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            Detalle de cupón
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 6 }}>
            ID: {couponId}
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>
            Estado: {coupon?.status ?? 'N/A'}
          </Text>

          <Button
            mode="contained"
            style={{ marginTop: 16 }}
            loading={isPending}
            disabled={!canGenerateQr || isPending}
            onPress={handleGenerateQr}
          >
            {isPending ? 'Generando...' : 'Generar QR efímero'}
          </Button>

          {!canGenerateQr ? (
            <Text variant="bodySmall" style={{ marginTop: 8 }}>
              Solo puedes generar QR con cupones en estado available.
            </Text>
          ) : null}

          {data ? (
            <View style={{ marginTop: 12 }}>
              <Text variant="titleSmall">Nueva sesión QR activa</Text>
              <Text variant="bodySmall">Token: {data.token.slice(0, 16)}...</Text>
              <Text variant="bodySmall">Expira: {new Date(data.expiresAt).toLocaleString('es-AR')}</Text>
            </View>
          ) : null}

          {error ? (
            <Text style={{ marginTop: 12, color: '#dc2626' }}>No se pudo generar el QR. Reintenta.</Text>
          ) : null}

          <Link href="/(app)/coupons/redeem-qr" asChild>
            <Pressable style={{ marginTop: 12 }}>
              <Button mode="outlined">Ir a pantalla de canje</Button>
            </Pressable>
          </Link>
        </Card.Content>
      </Card>
    </Screen>
  );
}
