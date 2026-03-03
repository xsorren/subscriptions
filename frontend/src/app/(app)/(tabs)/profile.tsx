import { ScrollView, StyleSheet, View, RefreshControl, Pressable } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '../../../shared/ui/Screen';
import { StatusBadge } from '../../../shared/ui/components/StatusBadge';
import { SkeletonCard } from '../../../shared/ui/components/SkeletonCard';
import { AnimatedFadeIn } from '../../../shared/ui/components/AnimatedFadeIn';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { useRequireAuth } from '../../../features/auth/hooks/useRequireAuth';
import { useMyProfile } from '../../../features/profile/hooks/useMyProfile';
import { useMySubscription } from '../../../features/subscription/hooks/useMySubscription';
import { useRedemptionHistory } from '../../../features/coupons/hooks/useRedemptionHistory';
import { housePalette } from '../../../core/theme/theme';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut, session } = useRequireAuth();
  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useMyProfile();
  const { data: subscription, isLoading: loadingSub } = useMySubscription();
  const { data: history = [], isLoading: loadingHistory } = useRedemptionHistory();

  const email = session?.user?.email ?? '';
  const displayName = profile?.full_name || 'Miembro House';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Refraction background blobs */}
      <View style={styles.blob} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refetchProfile()} tintColor={housePalette.primary} />
        }
      >
        <AnimatedFadeIn duration={600}>
          {/* User Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: housePalette.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text variant="headlineSmall" style={styles.name}>{displayName}</Text>
            <Text variant="bodyMedium" style={{ color: housePalette.muted }}>{email}</Text>
            {profile?.phone ? (
              <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 4 }}>
                {profile.phone}
              </Text>
            ) : null}
          </View>
        </AnimatedFadeIn>

        {/* Subscription Section with Glass and Glow */}
        <AnimatedFadeIn delay={100} duration={600}>
          {loadingSub ? (
            <SkeletonCard height={150} style={{ marginBottom: 20 }} />
          ) : (
            <View style={styles.cardGlowContainer}>
              <View style={styles.glow} />
              <GlassWrapper intensity={30} tint="dark" style={styles.glassCard}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.subIconWrapper}>
                      <MaterialCommunityIcons name="crown" size={20} color={housePalette.primary} />
                    </View>
                    <Text variant="titleMedium" style={styles.cardTitle}>Suscripción House</Text>
                    {subscription && <StatusBadge status={subscription.status} />}
                  </View>
                  
                  {subscription ? (
                    <>
                      <Text variant="headlineSmall" style={[styles.planLabel, { color: '#FFF' }]}>
                        {subscription.plan?.name ?? 'Plan Premium'}
                      </Text>
                      <View style={styles.subRow}>
                        <View style={{ flex: 1 }}>
                          <Text variant="labelSmall" style={styles.subLabelText}>ACTIVO DESDE</Text>
                          <Text variant="bodyMedium" style={{ color: '#FFF', fontWeight: '700' }}>
                            {new Date(subscription.starts_at).toLocaleDateString('es-AR')}
                          </Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 }} />
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text variant="labelSmall" style={styles.subLabelText}>PRÓXIMO COBRO</Text>
                          <Text variant="bodyMedium" style={{ color: housePalette.primary, fontWeight: '700' }}>
                            {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString('es-AR') : 'Auto-renovación'}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={styles.emptySub}>
                      <Text variant="bodyMedium" style={{ color: housePalette.muted, textAlign: 'center' }}>
                        No tienes una suscripción activa actualmente.
                      </Text>
                      <Button mode="contained" onPress={() => {}} style={{ marginTop: 16 }} buttonColor={housePalette.primary} textColor="#1A1A1A">
                        Ver Planes
                      </Button>
                    </View>
                  )}
                </View>
              </GlassWrapper>
            </View>
          )}
        </AnimatedFadeIn>

        {/* Redemption History with Glass */}
        <AnimatedFadeIn delay={200} duration={600}>
          <GlassWrapper intensity={15} tint="dark" style={styles.glassCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="history" size={20} color={housePalette.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>Historial reciente</Text>
              </View>
              <Divider style={styles.divider} />
              
              {loadingHistory ? (
                <SkeletonCard height={60} />
              ) : history.length > 0 ? (
                <>
                  {history.slice(0, 3).map((item, idx) => (
                    <View key={item.id}>
                      <View style={styles.historyRow}>
                        <View style={styles.historyIcon}>
                          <MaterialCommunityIcons name="check" size={16} color={housePalette.success} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text variant="bodyMedium" style={{ color: '#FFF', fontWeight: '600' }}>
                            {item.club_name ?? item.branch_name ?? `Sede ${item.club_branch_id.slice(0, 8)}`}
                          </Text>
                          <Text variant="bodySmall" style={{ color: housePalette.muted }}>
                            {new Date(item.redeemed_at).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                      {idx < Math.min(history.length, 3) - 1 && <Divider style={styles.innerDivider} />}
                    </View>
                  ))}
                  {history.length > 3 && (
                    <Button 
                      mode="text" 
                      onPress={() => router.push('/(app)/coupons/history' as any)} 
                      style={{ marginTop: 8 }}
                      labelStyle={{ color: housePalette.primary, fontWeight: '700' }}
                    >
                      Ver todo el historial
                    </Button>
                  )}
                </>
              ) : (
                <Text variant="bodyMedium" style={{ color: housePalette.muted, paddingVertical: 12, textAlign: 'center' }}>
                  Aún no realizaste ningún canje.
                </Text>
              )}
            </View>
          </GlassWrapper>
        </AnimatedFadeIn>

        {/* Settings with Glass */}
        <AnimatedFadeIn delay={300} duration={600}>
          <GlassWrapper intensity={10} tint="dark" style={styles.glassCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="cog-outline" size={20} color={housePalette.muted} />
                <Text variant="titleMedium" style={styles.cardTitle}>Configuración</Text>
              </View>
              <Divider style={styles.divider} />

              <Pressable style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <MaterialCommunityIcons name="email-outline" size={18} color={housePalette.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ color: '#FFF', fontWeight: '600' }}>Soporte</Text>
                  <Text variant="bodySmall" style={{ color: housePalette.muted }}>soporte@house.app</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={housePalette.muted} />
              </Pressable>

              <View style={styles.settingRow}>
                <View style={styles.settingIcon}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={housePalette.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ color: '#FFF', fontWeight: '600' }}>Versión</Text>
                  <Text variant="bodySmall" style={{ color: housePalette.muted }}>
                    {Constants.expoConfig?.version ?? '1.0.0'}
                  </Text>
                </View>
              </View>
            </View>
          </GlassWrapper>
        </AnimatedFadeIn>

        {/* Sign Out */}
        <AnimatedFadeIn delay={400} duration={600}>
          <Button
            mode="text"
            onPress={signOut}
            textColor={housePalette.error}
            style={styles.signOutBtn}
            labelStyle={{ fontWeight: '800' }}
            icon="logout"
          >
            Cerrar sesión
          </Button>
        </AnimatedFadeIn>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: housePalette.background },
  blob: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: housePalette.primary,
    opacity: 0.05,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(247, 201, 72, 0.2)',
    shadowColor: housePalette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  name: { fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  cardGlowContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    backgroundColor: housePalette.primary,
    opacity: 0.12,
    borderRadius: 24,
  },
  glassCard: { 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  subIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(247, 201, 72, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 201, 72, 0.25)',
  },
  cardTitle: { 
    flex: 1, 
    fontWeight: '800', 
    color: housePalette.muted, 
    fontSize: 12, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5 
  },
  planLabel: { fontWeight: '900', marginTop: 4, fontSize: 26, letterSpacing: -0.5 },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subLabelText: { color: housePalette.muted, marginBottom: 4, fontWeight: '700', fontSize: 10, letterSpacing: 1 },
  emptySub: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
    marginBottom: 20,
  },
  innerDivider: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginVertical: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(91, 214, 162, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(243, 107, 107, 0.05)',
    borderRadius: 12,
  },
});

