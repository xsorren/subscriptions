import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Image, Dimensions } from 'react-native';
import { Card, Text, Button, Divider, useTheme } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../shared/ui/Screen';
import { StatusBadge } from '../../../shared/ui/components/StatusBadge';
import { SkeletonCard, SkeletonList } from '../../../shared/ui/components/SkeletonCard';
import { AnimatedScaleIn } from '../../../shared/ui/components/AnimatedScaleIn';
import { AnimatedFadeIn } from '../../../shared/ui/components/AnimatedFadeIn';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { useMySubscription } from '../../../features/subscription/hooks/useMySubscription';
import { useMyCoupons } from '../../../features/coupons/hooks/useMyCoupons';
import { useMyProfile } from '../../../features/profile/hooks/useMyProfile';
import { useDiscoverEligibleClubs } from '../../../features/map/hooks/useDiscoverEligibleClubs';
import { useCurrentLocation } from '../../../features/map/hooks/useCurrentLocation';
import { housePalette } from '../../../core/theme/theme';

const { width } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getDaysRemaining(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const { data: subscription, isLoading: loadingSub, refetch: refetchSub } = useMySubscription();
  const { data: coupons = [], isLoading: loadingCoupons, refetch: refetchCoupons } = useMyCoupons();
  const { coords } = useCurrentLocation();
  const { data: nearbyCLubs = [] } = useDiscoverEligibleClubs({ ...coords, radiusMeters: 5000 }, true);

  const isRefreshing = false;
  const handleRefresh = () => {
    refetchSub();
    refetchCoupons();
  };

  const availableCount = coupons.filter(c => c.status === 'available').length;
  const redeemedCount = coupons.filter(c => c.status === 'redeemed').length;
  const displayName = profile?.full_name || 'Miembro House';
  const firstName = displayName.split(' ')[0];
  const daysLeft = subscription ? getDaysRemaining(subscription.ends_at) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Refraction background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={housePalette.primary} />}
      >
        {/* Welcome Header */}
        <AnimatedFadeIn duration={600}>
          <View style={styles.header}>
            <View>
              <Text variant="bodyLarge" style={{ color: housePalette.muted, fontWeight: '500' }}>{getGreeting()},</Text>
              <Text variant="headlineLarge" style={styles.name}>{firstName}</Text>
            </View>
            <Pressable onPress={() => router.push('/(app)/(tabs)/profile')}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: housePalette.primary }]}>
                  <Text style={styles.avatarText}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </AnimatedFadeIn>

        {/* Subscription Card with Glass and Glow */}
        {loadingSub ? (
          <SkeletonCard height={180} style={{ marginBottom: 28 }} />
        ) : subscription ? (
          <AnimatedScaleIn delay={150} duration={700}>
            <View style={styles.cardGlowContainer}>
              <View style={styles.glow} />
              <GlassWrapper intensity={40} tint="dark" style={styles.glassCardWrapper}>
                <View style={styles.cardPremiumContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons name="crown" size={26} color={housePalette.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text variant="labelLarge" style={styles.statusLabel}>
                        MIEMBRO HOUSE • PREMIUM
                      </Text>
                      <Text variant="headlineSmall" style={[styles.planName, { color: '#FFF' }]}>
                        {subscription.plan?.name ?? 'Socio Activo'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.subDetailsPremium}>
                    <View style={styles.statPremium}>
                      <Text variant="headlineMedium" style={styles.statValuePremium}>{availableCount}</Text>
                      <Text variant="labelMedium" style={styles.statLabelPremium}>PASES</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statPremium}>
                      <Text variant="headlineMedium" style={styles.statValuePremium}>{redeemedCount}</Text>
                      <Text variant="labelMedium" style={styles.statLabelPremium}>USADOS</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statPremium}>
                      <Text variant="headlineMedium" style={styles.statValuePremium}>{daysLeft}</Text>
                      <Text variant="labelMedium" style={styles.statLabelPremium}>DÍAS</Text>
                    </View>
                  </View>
                </View>
              </GlassWrapper>
            </View>
          </AnimatedScaleIn>
        ) : null}

        {/* Quick Actions with Glass */}
        <AnimatedFadeIn delay={300} duration={600}>
          <GlassWrapper intensity={25} tint="dark" style={styles.actionsGlass}>
            <View style={styles.quickActions}>
              <Link href="/(app)/(tabs)/coupons" asChild>
                <Pressable style={styles.quickAction}>
                  <View style={styles.quickActionIcon}>
                    <MaterialCommunityIcons name="wallet-outline" size={28} color={housePalette.primary} />
                  </View>
                  <Text variant="labelMedium" style={styles.quickActionLabel}>Billetera</Text>
                </Pressable>
              </Link>
              <Link href="/(app)/(tabs)/map" asChild>
                <Pressable style={styles.quickAction}>
                  <View style={styles.quickActionIcon}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={28} color={housePalette.primary} />
                  </View>
                  <Text variant="labelMedium" style={styles.quickActionLabel}>Explorar</Text>
                </Pressable>
              </Link>
              <Link href="/(app)/coupons/redeem-qr" asChild>
                <Pressable style={styles.quickAction}>
                  <View style={styles.quickActionIcon}>
                    <MaterialCommunityIcons name="qrcode-scan" size={28} color={housePalette.primary} />
                  </View>
                  <Text variant="labelMedium" style={styles.quickActionLabel}>Escanear</Text>
                </Pressable>
              </Link>
            </View>
          </GlassWrapper>
        </AnimatedFadeIn>

        {/* Nearby Clubs Horizontal Carousel */}
        {nearbyCLubs.length > 0 ? (
          <AnimatedScaleIn delay={450} duration={700}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="lightning-bolt" size={22} color={housePalette.primary} />
                <Text variant="titleLarge" style={styles.sectionTitle}>Entrená cerca</Text>
              </View>
              <Pressable onPress={() => router.push('/(app)/(tabs)/map')}>
                <Text variant="labelLarge" style={{ color: housePalette.primary, fontWeight: '700' }}>Ver todo</Text>
              </Pressable>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.clubsCarousel}
              decelerationRate="fast"
              snapToInterval={280 + 16}
            >
              {nearbyCLubs.slice(0, 5).map((club, index) => (
                <Link key={club.clubBranchId} href={`/(app)/clubs/${club.clubId}` as any} asChild>
                  <Pressable>
                    <GlassWrapper intensity={20} tint="dark" style={styles.clubCardCarousel}>
                      {club.image_url ? (
                        <Image source={club.image_url} style={styles.clubCardImage} />
                      ) : (
                        <View style={[styles.clubCardImage, { backgroundColor: housePalette.surfaceVariant, alignItems: 'center', justifyContent: 'center' }]}>
                          <MaterialCommunityIcons name="dumbbell" size={40} color={housePalette.muted} />
                        </View>
                      )}
                      <View style={styles.clubCardOverlay} />
                      <View style={styles.clubCardContent}>
                        <View style={styles.clubBadge}>
                          <Text variant="labelSmall" style={styles.clubBadgeText}>
                            {club.sport || 'GYM'}
                          </Text>
                        </View>
                        <View>
                          <Text variant="titleMedium" style={styles.clubCardName} numberOfLines={1}>{club.name}</Text>
                          <View style={styles.clubCardDistanceRow}>
                            <MaterialCommunityIcons name="map-marker-outline" size={14} color={housePalette.primary} />
                            <Text variant="labelSmall" style={styles.clubCardDistance}>
                              {club.distanceMeters ? (club.distanceMeters < 1000 ? `${Math.round(club.distanceMeters)} m` : `${(club.distanceMeters / 1000).toFixed(1)} km`) : 'Cerca'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </GlassWrapper>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          </AnimatedScaleIn>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: housePalette.primary,
    opacity: 0.1,
  },
  blob2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: housePalette.primary,
    opacity: 0.05,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  name: { fontWeight: '900', marginTop: 4, color: housePalette.text, letterSpacing: -0.5 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: housePalette.primary,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  cardGlowContainer: {
    marginBottom: 28,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: housePalette.primary,
    opacity: 0.15,
    borderRadius: 24,
    blurRadius: 30,
  },
  glassCardWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardPremiumContent: {
    padding: 24,
    backgroundColor: 'rgba(247, 201, 72, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 201, 72, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 201, 72, 0.3)',
  },
  statusLabel: { 
    color: housePalette.primary, 
    opacity: 0.9, 
    textTransform: 'uppercase', 
    letterSpacing: 2, 
    fontWeight: '800',
    fontSize: 10,
    marginBottom: 4,
  },
  planName: { fontWeight: '900', fontSize: 26, letterSpacing: -0.5 },
  subDetailsPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statPremium: { alignItems: 'center', flex: 1 },
  statValuePremium: { color: '#FFF', fontWeight: '900', fontSize: 26 },
  statLabelPremium: { color: housePalette.muted, fontWeight: '700', marginTop: 4, fontSize: 10, letterSpacing: 1.5 },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  actionsGlass: {
    marginBottom: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionLabel: { 
    color: '#FFF', 
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: { fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  clubsCarousel: {
    paddingRight: 20,
    paddingBottom: 20,
    gap: 16,
  },
  clubCardCarousel: {
    width: 280,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clubCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  clubCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  clubCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  clubBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(247, 201, 72, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clubBadgeText: {
    color: '#1A1A1A',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  clubCardName: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 4,
  },
  clubCardDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubCardDistance: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  viewAllBtn: {
    marginVertical: 4,
  }
});

