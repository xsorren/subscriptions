import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, Pressable } from 'react-native';
import { Chip, Text, useTheme, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../shared/ui/Screen';
import { EmptyState } from '../../../shared/ui/components/EmptyState';
import { SkeletonList } from '../../../shared/ui/components/SkeletonCard';
import { AnimatedScaleIn } from '../../../shared/ui/components/AnimatedScaleIn';
import { AnimatedFadeIn } from '../../../shared/ui/components/AnimatedFadeIn';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { useCurrentLocation } from '../../../features/map/hooks/useCurrentLocation';
import { useDiscoverEligibleClubs } from '../../../features/map/hooks/useDiscoverEligibleClubs';
import { openExternalMaps } from '../../../features/map/utils/openExternalMaps';
import { housePalette } from '../../../core/theme/theme';
import { trackEvent } from '../../../core/telemetry/trackEvent';

const RADIUS_OPTIONS = [
  { label: 'Cerca (1 km)', value: 1000 },
  { label: 'Barrio (3 km)', value: 3000 },
  { label: 'Ciudad (10 km)', value: 10000 },
];

function formatDistance(meters: number | undefined): string {
  if (!meters) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [radius, setRadius] = useState(3000);
  const { coords, loading: locationLoading, permissionDenied, error: locationError, refresh: refreshLocation } = useCurrentLocation();
  const {
    data: clubs = [],
    isLoading: clubsLoading,
    isError: clubsError,
    refetch: refetchClubs,
    isFetching,
  } = useDiscoverEligibleClubs({ ...coords, radiusMeters: radius }, !locationLoading);

  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
    trackEvent('map_radius_changed', { radius: newRadius });
  }, []);

  const isLoading = locationLoading || clubsLoading;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !clubsLoading}
          onRefresh={() => {
            refreshLocation();
            refetchClubs();
          }}
          tintColor={housePalette.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Explorar</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Encontrá el lugar ideal para entrenar hoy.
        </Text>
      </View>

      {/* Radius Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {RADIUS_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleRadiusChange(opt.value)}
              style={[
                styles.filterChip,
                radius === opt.value ? styles.chipActive : styles.chipInactive
              ]}
            >
              <MaterialCommunityIcons 
                name="map-marker-radius" 
                size={16} 
                color={radius === opt.value ? '#1A1A1A' : housePalette.muted} 
              />
              <Text 
                variant="labelLarge" 
                style={[
                  styles.filterText,
                  { color: radius === opt.value ? '#1A1A1A' : housePalette.text }
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Errors */}
      {permissionDenied || locationError ? (
        <AnimatedFadeIn>
          <GlassWrapper intensity={15} tint="dark" style={styles.alertCard}>
            <View style={{ padding: 16 }}>
              <View style={styles.alertRow}>
                <View style={styles.alertIconWrapper}>
                  <MaterialCommunityIcons name="map-marker-off" size={24} color={housePalette.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: '800' }}>Sin ubicación</Text>
                  <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 4 }}>
                    {permissionDenied ? 'Necesitamos acceso a tu ubicación para mostrarte clubes cercanos.' : locationError}
                  </Text>
                </View>
              </View>
              <Button 
                mode="contained" 
                buttonColor="rgba(255,255,255,0.05)"
                textColor="#FFF"
                onPress={refreshLocation} 
                style={{ marginTop: 16, borderRadius: 14 }}
              >
                Habilitar permisos
              </Button>
            </View>
          </GlassWrapper>
        </AnimatedFadeIn>
      ) : null}

      {/* Results */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          <SkeletonList count={3} />
        </View>
      ) : clubs.length === 0 && !permissionDenied && !locationError ? (
        <AnimatedFadeIn>
          <EmptyState
            icon="compass-off-outline"
            title="No hay clubes cerca"
            description={`No encontramos clubes disponibles en un radio de ${radius / 1000} km. ¡Probá ampliando la distancia!`}
          />
        </AnimatedFadeIn>
      ) : (
        <View style={styles.resultsContainer}>
          {clubs.length > 0 && !permissionDenied && !locationError && (
            <AnimatedFadeIn>
              <Text variant="labelLarge" style={styles.resultCount}>
                {clubs.length} CLUB{clubs.length !== 1 ? 'ES' : ''} DISPONIBLE{clubs.length !== 1 ? 'S' : ''}
              </Text>
            </AnimatedFadeIn>
          )}

          {clubs.map((club, index) => (
            <AnimatedScaleIn key={club.clubBranchId} delay={index * 100} duration={500}>
              <Pressable onPress={() => router.push(`/(app)/clubs/${club.clubId}` as any)}>
                <GlassWrapper intensity={15} tint="dark" style={styles.clubCard}>
                  <View style={styles.clubImageContainer}>
                    {club.image_url ? (
                      <Image source={club.image_url} style={styles.clubImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.clubImage, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                    )}
                    
                    {/* Dark overlay for image to blend with glass */}
                    <View style={styles.imageOverlay} />
                    
                    {/* Distance Overlay Badge */}
                    {club.distanceMeters && (
                      <View style={styles.distanceBadge}>
                        <MaterialCommunityIcons name="walk" size={14} color="#1A1A1A" />
                        <Text style={styles.distanceText}>{formatDistance(club.distanceMeters)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.clubHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text variant="titleLarge" style={styles.clubName}>{club.name}</Text>
                        <Text variant="bodyMedium" style={{ color: housePalette.primary, fontWeight: '600' }}>
                          {club.sport || 'Deporte General'}
                        </Text>
                      </View>
                      <View style={styles.couponBadge}>
                        <MaterialCommunityIcons name="ticket-percent" size={16} color={housePalette.primary} />
                        <Text style={styles.couponBadgeText}>{club.availableCoupons}</Text>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        style={styles.btnSecondary}
                        buttonColor="rgba(255,255,255,0.05)"
                        textColor="#FFF"
                        onPress={() => openExternalMaps(club.lat, club.lng, club.name)}
                      >
                        <MaterialCommunityIcons name="directions" size={20} color={housePalette.muted} />
                      </Button>
                      <Button
                        mode="contained"
                        style={styles.btnPrimary}
                        buttonColor={housePalette.primary}
                        textColor="#1A1A1A"
                        labelStyle={{ fontWeight: '700' }}
                        onPress={() => router.push(`/(app)/clubs/${club.clubId}` as any)}
                      >
                        Ver detalle
                      </Button>
                    </View>
                  </View>
                </GlassWrapper>
              </Pressable>
            </AnimatedScaleIn>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 16 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: { fontWeight: '800', color: housePalette.text },
  headerSubtitle: { color: housePalette.muted, marginTop: 4 },
  filtersWrapper: {
    marginBottom: 24,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: housePalette.primary,
    borderColor: housePalette.primary,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: housePalette.border,
  },
  filterText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  alertCard: { 
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(243, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultCount: {
    color: housePalette.muted,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  clubCard: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  clubImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: housePalette.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    color: '#1A1A1A',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },
  cardContent: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  clubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  clubName: {
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 4,
    fontSize: 20,
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 201, 72, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(247, 201, 72, 0.2)',
  },
  couponBadgeText: {
    color: housePalette.primary,
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 14,
  },
  btnSecondary: {
    width: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
