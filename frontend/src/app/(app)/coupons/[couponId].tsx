import { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import { Link, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../shared/ui/Screen';
import { StatusBadge } from '../../../shared/ui/components/StatusBadge';
import { QrCodeView } from '../../../shared/ui/components/QrCodeView';
import { CountdownTimer } from '../../../shared/ui/components/CountdownTimer';
import { SkeletonCard } from '../../../shared/ui/components/SkeletonCard';
import { AnimatedFadeIn } from '../../../shared/ui/components/AnimatedFadeIn';
import { AnimatedScaleIn } from '../../../shared/ui/components/AnimatedScaleIn';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { useCreateQrToken } from '../../../features/coupons/hooks/useCreateQrToken';
import { useCouponDetail } from '../../../features/coupons/hooks/useCouponDetail';
import { housePalette } from '../../../core/theme/theme';

const { width } = Dimensions.get('window');

export default function CouponDetailScreen() {
  const theme = useTheme();
  const { couponId } = useLocalSearchParams<{ couponId: string }>();
  const { data: coupon, isLoading: isLoadingCoupon } = useCouponDetail(couponId ?? '');
  const { mutateAsync, data, isPending, error, reset } = useCreateQrToken();
  const [qrExpired, setQrExpired] = useState(false);

  const canGenerateQr = coupon?.status === 'available';

  const handleGenerateQr = async () => {
    if (!couponId || !canGenerateQr) return;
    setQrExpired(false);
    await mutateAsync(couponId);
  };

  const handleQrExpired = useCallback(() => {
    setQrExpired(true);
  }, []);

  if (isLoadingCoupon) {
    return (
      <Screen>
        <SkeletonCard height={450} style={{ margin: 20, borderRadius: 24 }} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: housePalette.background }}>
      {/* Refraction background blobs */}
      <View style={styles.blob} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedScaleIn duration={600}>
          <View style={styles.ticketContainer}>
            {/* Header del Ticket */}
            <GlassWrapper intensity={20} tint="dark" style={styles.ticketTop} borderRadius={0}>
              <View style={styles.headerTitleRow}>
                <MaterialCommunityIcons name="ticket-star" size={26} color={housePalette.primary} />
                <Text variant="headlineSmall" style={styles.title}>Pase Deportivo</Text>
              </View>
              <View style={styles.clubNameRow}>
                <Text variant="titleMedium" style={styles.clubName}>
                  {coupon?.metadata?.club_name as string || 'Club House'}
                </Text>
                <StatusBadge status={coupon?.status ?? 'unknown'} />
              </View>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text variant="labelSmall" style={styles.infoLabel}>SERVICIO</Text>
                  <Text variant="titleSmall" style={styles.infoValue}>
                    {coupon?.metadata?.service_name as string || 'Pase General'}
                  </Text>
                </View>
                <View style={styles.infoColRight}>
                  <Text variant="labelSmall" style={styles.infoLabel}>VENCIMIENTO</Text>
                  <Text variant="titleSmall" style={styles.infoValue}>
                    {coupon?.expires_at ? new Date(coupon.expires_at).toLocaleDateString('es-AR') : 'Sin fecha'}
                  </Text>
                </View>
              </View>
            </GlassWrapper>

            {/* Línea Perforada del Ticket */}
            <GlassWrapper intensity={20} tint="dark" style={styles.ticketDivider} borderRadius={0}>
              <View style={[styles.punchHole, styles.punchHoleLeft]} />
              <View style={styles.dashedLine} />
              <View style={[styles.punchHole, styles.punchHoleRight]} />
            </GlassWrapper>

            {/* Cuerpo del Ticket (QR) */}
            <GlassWrapper intensity={20} tint="dark" style={styles.ticketBottom} borderRadius={0}>
              {data && !qrExpired ? (
                <AnimatedScaleIn delay={200} duration={500}>
                  <View style={styles.qrSection}>
                    <View style={styles.qrWrapper}>
                      <QrCodeView value={data.token} size={width * 0.55} label="Mostrar en recepción" />
                    </View>
                    <View style={styles.timerContainer}>
                      <CountdownTimer expiresAt={data.expiresAt} onExpired={handleQrExpired} />
                    </View>
                    <Text variant="bodySmall" style={styles.qrHelperText}>
                      El código es de un solo uso y se renueva por seguridad.
                    </Text>
                  </View>
                </AnimatedScaleIn>
              ) : data && qrExpired ? (
                <AnimatedFadeIn>
                  <View style={styles.expiredSection}>
                    <View style={styles.expiredIconWrapper}>
                      <MaterialCommunityIcons name="timer-off" size={48} color={housePalette.error} />
                    </View>
                    <Text variant="titleMedium" style={styles.expiredTitle}>QR Expirado</Text>
                    <Text variant="bodyMedium" style={styles.expiredSubtitle}>
                      El tiempo se agotó. Generá uno nuevo para canjear.
                    </Text>
                    <Button
                      mode="contained"
                      buttonColor={housePalette.primary}
                      textColor="#1A1A1A"
                      onPress={handleGenerateQr}
                      loading={isPending}
                      style={styles.generateBtn}
                      icon="refresh"
                    >
                      Renovar QR
                    </Button>
                  </View>
                </AnimatedFadeIn>
              ) : (
                <View style={styles.generateSection}>
                  {!canGenerateQr ? (
                    <View style={styles.disabledNotice}>
                      <MaterialCommunityIcons name="information" size={24} color={housePalette.muted} />
                      <Text variant="bodyMedium" style={styles.disabledText}>
                        Este cupón ya no está disponible para ser canjeado.
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.qrPlaceholder}>
                        <MaterialCommunityIcons name="qrcode-scan" size={56} color={housePalette.primary} />
                      </View>
                      <Text variant="bodyMedium" style={styles.generateHelperText}>
                        Tocá el botón abajo para revelar tu código QR cuando estés en recepción.
                      </Text>
                      <Button
                        mode="contained"
                        buttonColor={housePalette.primary}
                        textColor="#1A1A1A"
                        onPress={handleGenerateQr}
                        loading={isPending}
                        disabled={!canGenerateQr || isPending}
                        style={styles.generateBtn}
                        labelStyle={{ fontWeight: '800', fontSize: 16 }}
                        icon="qrcode"
                      >
                        {isPending ? 'Generando...' : 'Revelar QR'}
                      </Button>
                    </>
                  )}
                </View>
              )}

              {error ? (
                <AnimatedFadeIn>
                  <View style={styles.errorBanner}>
                    <MaterialCommunityIcons name="alert-circle" size={20} color={housePalette.error} />
                    <Text variant="bodyMedium" style={styles.errorText}>
                      Ocurrió un error. Intentá de nuevo.
                    </Text>
                  </View>
                </AnimatedFadeIn>
              ) : null}
            </GlassWrapper>
          </View>
        </AnimatedScaleIn>

        {/* Admin Link */}
        <AnimatedFadeIn delay={400}>
          <GlassWrapper intensity={10} tint="dark" borderRadius={16} style={{ marginTop: 24 }}>
            <Link href="/(app)/coupons/redeem-qr" asChild>
              <Pressable>
                <View style={styles.adminLinkContainer}>
                  <MaterialCommunityIcons name="store-cog" size={22} color={housePalette.muted} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="titleSmall" style={{ color: '#FFF' }}>¿Sos staff del club?</Text>
                    <Text variant="bodySmall" style={{ color: housePalette.muted, opacity: 0.8 }}>
                      Ir a la pantalla de escaneo
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={housePalette.muted} />
                </View>
              </Pressable>
            </Link>
          </GlassWrapper>
        </AnimatedFadeIn>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    top: 50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: housePalette.primary,
    opacity: 0.05,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  ticketContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ticketTop: {
    padding: 24,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: { fontWeight: '900', color: '#FFF' },
  clubNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  clubName: {
    fontWeight: '800',
    color: '#FFF',
    flex: 1,
    marginRight: 10,
    fontSize: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  infoCol: { flex: 1 },
  infoColRight: { flex: 1, alignItems: 'flex-end' },
  infoLabel: {
    color: housePalette.muted,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFF',
    fontWeight: '800',
  },
  ticketDivider: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  punchHole: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    backgroundColor: housePalette.background,
  },
  punchHoleLeft: {
    left: -20,
  },
  punchHoleRight: {
    right: -20,
  },
  dashedLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  ticketBottom: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  qrSection: {
    alignItems: 'center',
    width: '100%',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  timerContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(247, 201, 72, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qrHelperText: {
    color: housePalette.muted,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  expiredSection: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  expiredIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(243, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  expiredTitle: { color: housePalette.error, fontWeight: '800' },
  expiredSubtitle: { color: housePalette.muted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  generateSection: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 201, 72, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  generateHelperText: {
    color: housePalette.muted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  generateBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 6,
  },
  disabledNotice: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  disabledText: {
    color: housePalette.muted,
    textAlign: 'center',
    marginTop: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(243, 107, 107, 0.15)',
    width: '100%',
  },
  errorText: {
    color: housePalette.error,
    fontWeight: '600',
    marginLeft: 10,
  },
  adminLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});
