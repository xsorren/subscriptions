import { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Card, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../shared/ui/Screen';
import { useRedeemCoupon } from '../../../features/coupons/hooks/useRedeemCoupon';
import { trackEvent } from '../../../core/telemetry/trackEvent';
import { housePalette } from '../../../core/theme/theme';

function makeIdempotencyKey() {
  return `redeem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function RedeemQrScreen() {
  const theme = useTheme();
  const { mutateAsync, isPending, data, error, reset } = useRedeemCoupon();

  const [qrNonce, setQrNonce] = useState('');
  const [clubBranchId, setClubBranchId] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(makeIdempotencyKey);
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => qrNonce.trim().length > 0 && clubBranchId.trim().length > 0,
    [qrNonce, clubBranchId]
  );

  const handleRedeem = async () => {
    setLocalError(null);

    if (!canSubmit) {
      setLocalError('Completá el nonce QR y el ID de sede.');
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

  const handleReset = () => {
    setQrNonce('');
    setClubBranchId('');
    setIdempotencyKey(makeIdempotencyKey());
    setLocalError(null);
    reset?.();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="store-check-outline" size={24} color={housePalette.primary} />
          <Text variant="headlineSmall" style={styles.headerTitle}>Canje House por QR</Text>
        </View>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: housePalette.muted }]}>
          Escaneá o ingresá el código QR del usuario para procesar el canje.
        </Text>

        {/* Success State */}
        {data ? (
          <Card mode="elevated" style={styles.successCard}>
            <Card.Content style={styles.successContent}>
              <View style={[styles.successIcon, { backgroundColor: 'rgba(91, 214, 162, 0.15)' }]}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={housePalette.success} />
              </View>
              <Text variant="titleLarge" style={{ color: housePalette.success, fontWeight: '700', marginTop: 14 }}>
                ¡Canje exitoso!
              </Text>
              <Text variant="bodyMedium" style={{ color: housePalette.muted, marginTop: 6, textAlign: 'center' }}>
                Redemption ID: {data.redemptionId.slice(0, 16)}...
              </Text>
              <Button mode="contained" onPress={handleReset} style={{ marginTop: 20 }} icon="refresh">
                Nuevo canje
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Form */}
            <Card mode="elevated" style={styles.formCard}>
              <Card.Content>
                <TextInput
                  mode="outlined"
                  label="QR Nonce"
                  value={qrNonce}
                  onChangeText={setQrNonce}
                  left={<TextInput.Icon icon="qrcode" />}
                  style={styles.input}
                  placeholder="Token del código QR"
                />
                <TextInput
                  mode="outlined"
                  label="Club Branch ID"
                  value={clubBranchId}
                  onChangeText={setClubBranchId}
                  left={<TextInput.Icon icon="map-marker-outline" />}
                  style={styles.input}
                  placeholder="ID de la sede del club"
                />
                <TextInput
                  mode="outlined"
                  label="Clave de idempotencia"
                  value={idempotencyKey}
                  onChangeText={setIdempotencyKey}
                  left={<TextInput.Icon icon="key-outline" />}
                  style={styles.input}
                  disabled
                />

                {localError ? <HelperText type="error">{localError}</HelperText> : null}
                {error ? (
                  <View style={styles.errorBanner}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={18} color={housePalette.error} />
                    <Text variant="bodyMedium" style={{ color: housePalette.error, flex: 1, marginLeft: 8 }}>
                      No se pudo procesar el canje. Verificá los datos e intentá de nuevo.
                    </Text>
                  </View>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleRedeem}
                  loading={isPending}
                  disabled={!canSubmit || isPending}
                  style={styles.submitBtn}
                  contentStyle={{ height: 50 }}
                  icon="check-bold"
                  accessibilityLabel="Confirmar canje"
                  accessibilityHint="Procesa el canje del cupón con el nonce y la sede cargada"
                >
                  {isPending ? 'Canjeando...' : 'Confirmar canje'}
                </Button>
              </Card.Content>
            </Card>
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: { fontWeight: '700' },
  subtitle: { marginBottom: 16 },
  formCard: { marginBottom: 16 },
  input: { marginTop: 10 },
  submitBtn: {
    marginTop: 16,
    borderRadius: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(243, 107, 107, 0.1)',
    marginTop: 10,
  },
  successCard: { marginBottom: 16 },
  successContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
