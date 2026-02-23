import { useMemo, useState } from 'react';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { Screen } from '../../../shared/ui/Screen';
import { useRedeemCoupon } from '../../../features/coupons/hooks/useRedeemCoupon';
import { trackEvent } from '../../../core/telemetry/trackEvent';

function makeIdempotencyKey() {
  return `redeem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function RedeemQrScreen() {
  const { mutateAsync, isPending, data, error } = useRedeemCoupon();

  const [qrNonce, setQrNonce] = useState('');
  const [clubBranchId, setClubBranchId] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(makeIdempotencyKey);
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(() => qrNonce.trim().length > 0 && clubBranchId.trim().length > 0, [qrNonce, clubBranchId]);

  const handleRedeem = async () => {
    setLocalError(null);

    if (!canSubmit) {
      setLocalError('Debes completar nonce QR y branch ID.');
      trackEvent('redeem_validation_failed');
      return;
    }

    try {
      await mutateAsync({
        qrNonce: qrNonce.trim(),
        clubBranchId: clubBranchId.trim(),
        idempotencyKey,
      });
      trackEvent('redeem_success', { clubBranchId: clubBranchId.trim() });
      setIdempotencyKey(makeIdempotencyKey());
    } catch {
      trackEvent('redeem_failed');
    }
  };

  return (
    <Screen>
      <Card mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            Canje House por QR
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Ejecuta canje contra la Edge Function `redeem-coupon`.
          </Text>

          <TextInput mode="outlined" label="QR Nonce" value={qrNonce} onChangeText={setQrNonce} style={{ marginTop: 16 }} />
          <TextInput mode="outlined" label="Club Branch ID" value={clubBranchId} onChangeText={setClubBranchId} style={{ marginTop: 10 }} />
          <TextInput
            mode="outlined"
            label="Idempotency Key"
            value={idempotencyKey}
            onChangeText={setIdempotencyKey}
            style={{ marginTop: 10 }}
          />

          {localError ? <HelperText type="error">{localError}</HelperText> : null}
          {error ? <HelperText type="error">No se pudo procesar el canje.</HelperText> : null}

          {data ? (
            <HelperText type="info">Canje exitoso. Redemption ID: {data.redemptionId}</HelperText>
          ) : null}

          <Button
            mode="contained"
            style={{ marginTop: 12 }}
            onPress={handleRedeem}
            loading={isPending}
            disabled={!canSubmit || isPending}
            accessibilityLabel="Confirmar canje"
            accessibilityHint="Procesa el canje del cupón con el nonce y la sede cargada"
          >
            {isPending ? 'Canjeando...' : 'Confirmar canje'}
          </Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
