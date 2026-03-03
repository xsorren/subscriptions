import { View, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../../shared/ui/Screen';
import { SkeletonCard } from '../../../shared/ui/components/SkeletonCard';
import { EmptyState } from '../../../shared/ui/components/EmptyState';
import { StateMessage } from '../../../shared/ui/components/StateMessage';
import { AnimatedFadeIn } from '../../../shared/ui/components/AnimatedFadeIn';
import { AnimatedScaleIn } from '../../../shared/ui/components/AnimatedScaleIn';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { useClubDetail } from '../../../features/clubs/hooks/useClubDetail';
import { useClubEligibility } from '../../../features/clubs/hooks/useClubEligibility';
import { openExternalMapsByQuery } from '../../../features/map/utils/openExternalMaps';
import { housePalette } from '../../../core/theme/theme';

export default function ClubDetailScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  
  const {
    data: club,
    isLoading: isLoadingClub,
    isError: isErrorClub,
    refetch: refetchClub,
    isFetching: isFetchingClub,
  } = useClubDetail(clubId ?? '');
  
  const {
    data: eligibility,
    isLoading: isLoadingEligibility,
    isError: isErrorEligibility,
    refetch: refetchEligibility,
    isFetching: isFetchingEligibility,
  } = useClubEligibility(clubId ?? '');

  const isLoading = isLoadingClub || isLoadingEligibility;

  if (isLoading) {
    return (
      <Screen>
        <SkeletonCard height={240} style={{ marginBottom: -20, borderRadius: 0 }} />
        <SkeletonCard height={180} style={{ marginHorizontal: 16, marginBottom: 14 }} />
        <SkeletonCard height={120} style={{ marginHorizontal: 16 }} />
      </Screen>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* Cover Image / Header */}
      <View style={[styles.coverContainer, { width, height: width * 0.75 }]}>
        {club?.cover_url ? (
          <Image source={club.cover_url} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: housePalette.surfaceVariant }]} />
        )}
        <View style={styles.coverOverlay} />
      </View>

      <View style={styles.contentContainer}>
        {/* Errors */}
        {(isErrorClub || isErrorEligibility) ? (
          <AnimatedFadeIn>
            <Card mode="elevated" style={styles.card}>
              <Card.Content>
                <StateMessage variant="error" message="No se pudo cargar el detalle completo." />
                <View style={styles.retryRow}>
                  <Button mode="outlined" compact onPress={() => refetchClub()} loading={isFetchingClub}>
                    Reintentar club
                  </Button>
                  <Button mode="outlined" compact onPress={() => refetchEligibility()} loading={isFetchingEligibility}>
                    Reintentar elegibilidad
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </AnimatedFadeIn>
        ) : null}

        {/* Info Card (Floating) */}
        <AnimatedScaleIn delay={100} duration={600}>
          <View style={styles.clubHeaderFloating}>
            <View style={styles.avatarWrapper}>
              {club?.logo_url ? (
                <Image source={{ uri: club.logo_url }} style={styles.clubAvatar} />
              ) : (
                <View style={[styles.clubAvatar, { backgroundColor: 'rgba(247, 201, 72, 0.15)' }]}>
                  <MaterialCommunityIcons name="office-building" size={36} color={housePalette.primary} />
                </View>
              )}
            </View>

            <GlassWrapper intensity={15} tint="dark" style={styles.mainInfoCard}>
              <View style={styles.mainInfoContent}>
                <Text variant="headlineSmall" style={styles.clubName}>
                  {club?.name ?? 'Club House'}
                </Text>
                
                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <MaterialCommunityIcons name="star" size={14} color={housePalette.primary} />
                    <Text variant="labelSmall" style={styles.tagText}>4.9 (120)</Text>
                  </View>
                  {eligibility?.sports?.slice(0, 2).map(sport => (
                    <View key={sport} style={styles.tag}>
                      <Text variant="labelSmall" style={styles.tagText}>{sport}</Text>
                    </View>
                  ))}
                </View>

                <Text variant="bodyMedium" style={styles.clubDescription}>
                  {club?.description ?? 'Sin descripción disponible.'}
                </Text>
              </View>
            </GlassWrapper>
          </View>
        </AnimatedScaleIn>

        {/* Eligibility Details */}
        <AnimatedFadeIn delay={200} duration={600}>
          <GlassWrapper intensity={15} tint="dark" style={styles.card}>
            <View style={{ padding: 20 }}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="check-decagram-outline" size={20} color={housePalette.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>Tus Beneficios</Text>
              </View>

              <View style={styles.eligibilityGrid}>
                <View style={[styles.eligibilityCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                  <Text variant="headlineMedium" style={{ color: eligibility?.availableCoupons ? housePalette.success : housePalette.muted, fontWeight: '800' }}>
                    {eligibility?.availableCoupons ?? 0}
                  </Text>
                  <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 4 }}>Pases disponibles</Text>
                </View>
                
                {eligibility?.availableCoupons && eligibility.availableCoupons > 0 ? (
                  <View style={[styles.eligibilityCard, { backgroundColor: 'rgba(247, 201, 72, 0.1)' }]}>
                    <MaterialCommunityIcons name="ticket-confirmation" size={28} color={housePalette.primary} />
                    <Text variant="bodySmall" style={{ color: housePalette.primary, marginTop: 10, fontWeight: '700' }}>
                      ¡Listo para canjear!
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.eligibilityCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                    <MaterialCommunityIcons name="ticket-outline" size={28} color={housePalette.muted} />
                    <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 10, fontWeight: '600' }}>
                      Sin accesos hoy
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </GlassWrapper>
        </AnimatedFadeIn>

        {/* Branches list */}
        <AnimatedFadeIn delay={300} duration={600}>
          <GlassWrapper intensity={15} tint="dark" style={styles.card}>
            <View style={{ padding: 20 }}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker-multiple-outline" size={20} color={housePalette.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>Sedes ({club?.club_branches?.length ?? 0})</Text>
              </View>

              {club?.club_branches?.length ? (
                club.club_branches.map((branch, idx) => {
                  const addressQuery = `${branch.address_line}, ${branch.city}`;
                  return (
                    <View key={branch.id}>
                      {idx > 0 ? <Divider style={{ marginVertical: 16, backgroundColor: 'rgba(255,255,255,0.05)' }} /> : null}
                      <View style={styles.branchCard}>
                        <View style={styles.branchIconWrapper}>
                          <MaterialCommunityIcons name="map-marker" size={22} color={housePalette.primary} />
                        </View>
                        <View style={styles.branchDetails}>
                          <Text variant="titleSmall" style={{ color: '#FFF', fontWeight: '800' }}>{branch.name}</Text>
                          <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 4 }}>
                            {branch.address_line}
                          </Text>
                          <Text variant="bodySmall" style={{ color: housePalette.muted }}>
                            {branch.city}
                          </Text>
                          <Button
                            mode="contained"
                            buttonColor="rgba(255,255,255,0.05)"
                            textColor="#FFF"
                            onPress={() => openExternalMapsByQuery(addressQuery)}
                            style={styles.navigateBtn}
                            labelStyle={{ fontWeight: '700' }}
                            icon="navigation-variant"
                          >
                            Ir a la sede
                          </Button>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <EmptyState
                  icon="map-marker-off-outline"
                  title="Sin sedes"
                  description="No hay información de sedes disponibles para este club."
                />
              )}
            </View>
          </GlassWrapper>
        </AnimatedFadeIn>
        
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  coverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentContainer: {
    marginTop: 180, // Desplazamiento para mostrar la imagen de fondo
    paddingHorizontal: 16,
  },
  clubHeaderFloating: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  clubAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  mainInfoCard: {
    marginTop: 40,
    borderRadius: 24,
    backgroundColor: 'transparent',
    paddingTop: 50, // Espacio para el avatar flotante
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  mainInfoContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  clubName: { 
    fontWeight: '900', 
    color: '#FFF',
    fontSize: 26,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 201, 72, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(247, 201, 72, 0.3)',
  },
  tagText: {
    color: housePalette.primary,
    marginLeft: 4,
    fontWeight: '800',
  },
  clubDescription: {
    color: housePalette.muted,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: { 
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: '800', color: '#FFF' },
  eligibilityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  eligibilityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  branchIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(247, 201, 72, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  branchDetails: { flex: 1 },
  navigateBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  retryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
