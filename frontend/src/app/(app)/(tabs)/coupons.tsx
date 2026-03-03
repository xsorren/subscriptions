import { useState, useMemo } from 'react';
import { FlatList, RefreshControl, View, StyleSheet, Pressable, Image } from 'react-native';
import { Chip, Text, Divider } from 'react-native-paper';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../shared/ui/Screen';
import { StatusBadge } from '../../../shared/ui/components/StatusBadge';
import { EmptyState } from '../../../shared/ui/components/EmptyState';
import { SkeletonList } from '../../../shared/ui/components/SkeletonCard';
import { AnimatedFadeIn } from '../../../shared/ui/components/AnimatedFadeIn';
import { GlassWrapper } from '../../../shared/ui/components/GlassWrapper';
import { useMyCoupons } from '../../../features/coupons/hooks/useMyCoupons';
import { CouponListItem } from '../../../features/coupons/api/coupons.service';
import { housePalette } from '../../../core/theme/theme';

const FILTERS = ['all', 'available', 'redeemed', 'expired'] as const;
type Filter = typeof FILTERS[number];

const filterLabels: Record<Filter, string> = {
  all: 'Todos',
  available: 'Disponibles',
  redeemed: 'Canjeados',
  expired: 'Expirados',
};

export default function CouponsScreen() {
  const { data: coupons = [], isLoading, isError, refetch, isFetching } = useMyCoupons();
  const [filter, setFilter] = useState<Filter>('all');

  const filteredCoupons = useMemo(() => {
    if (filter === 'all') return coupons;
    return coupons.filter((c) => c.status === filter);
  }, [coupons, filter]);

  const counts = useMemo(() => ({
    all: coupons.length,
    available: coupons.filter(c => c.status === 'available').length,
    redeemed: coupons.filter(c => c.status === 'redeemed').length,
    expired: coupons.filter(c => c.status === 'expired').length,
  }), [coupons]);

  const renderItem = ({ item, index }: { item: CouponListItem, index: number }) => {
    const isAvailable = item.status === 'available';
    
    return (
      <AnimatedFadeIn delay={index * 100} duration={600}>
        <Link href={`/(app)/coupons/${item.id}` as any} asChild>
          <Pressable>
            <GlassWrapper intensity={isAvailable ? 30 : 15} tint="dark" style={[styles.glassCard, !isAvailable && { opacity: 0.6 }]}>
              {/* Ticket cutouts for available coupons */}
              {isAvailable && (
                <>
                  <View style={styles.cutoutLeft} />
                  <View style={styles.cutoutRight} />
                </>
              )}
              
              <View style={styles.cardContainer}>
                {/* Imagen del club / deporte como cabecera del cupón */}
                <View style={styles.imageContainer}>
                  {item.metadata?.image_url ? (
                    <Image source={item.metadata.image_url} style={styles.coverImage} />
                  ) : (
                    <View style={[styles.coverImage, { backgroundColor: housePalette.surfaceVariant, alignItems: 'center', justifyContent: 'center' }]}>
                      <MaterialCommunityIcons name="ticket-confirmation-outline" size={40} color={housePalette.muted} />
                    </View>
                  )}
                  <View style={styles.imageOverlay} />
                  <View style={styles.badgeContainer}>
                    <StatusBadge status={item.status} />
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.couponRow}>
                    <View style={styles.couponInfo}>
                      <Text variant="labelMedium" style={styles.serviceName}>
                        {(item.metadata?.service_name as string || 'Servicio General').toUpperCase()}
                      </Text>
                      <Text variant="headlineSmall" style={styles.clubName}>
                        {item.metadata?.club_name as string || `Cupón #${item.id.slice(0, 8)}`}
                      </Text>
                      <View style={styles.detailsRow}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={housePalette.primary} />
                        <Text variant="bodySmall" style={styles.dateText}>
                          {item.expires_at
                            ? `Expira: ${new Date(item.expires_at).toLocaleDateString('es-AR')}`
                            : 'Uso ilimitado'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.actionIcon, isAvailable && { backgroundColor: 'rgba(247, 201, 72, 0.15)', borderColor: housePalette.primary }]}>
                      <MaterialCommunityIcons 
                        name={isAvailable ? "qrcode-scan" : "chevron-right"} 
                        size={20} 
                        color={isAvailable ? housePalette.primary : housePalette.muted} 
                      />
                    </View>
                  </View>
                </View>
              </View>
            </GlassWrapper>
          </Pressable>
        </Link>
      </AnimatedFadeIn>
    );
  };

  return (
    <View style={styles.container}>
      {/* Refraction background blobs */}
      <View style={styles.blob} />
      
      <Screen>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>Mi Billetera</Text>
          {!isLoading && coupons.length > 0 ? (
            <Text variant="bodyMedium" style={{ color: housePalette.primary, fontWeight: '600' }}>
              {counts.available} pases listos para usar
            </Text>
          ) : null}
        </View>

        <View style={styles.filters}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={(f) => f}
            renderItem={({ item: f }) => (
              <Pressable onPress={() => setFilter(f)} style={{ marginRight: 8 }}>
                <GlassWrapper 
                  intensity={filter === f ? 40 : 10} 
                  tint="dark" 
                  borderRadius={20}
                  style={[
                    styles.filterWrapper, 
                    filter === f && { borderColor: 'rgba(247, 201, 72, 0.4)', borderWidth: 1 }
                  ]}
                >
                  <View style={[styles.filterContent, filter === f && { backgroundColor: 'rgba(247, 201, 72, 0.1)' }]}>
                    <Text style={[
                      styles.filterText, 
                      filter === f ? { color: housePalette.primary, fontWeight: '800' } : { color: housePalette.muted }
                    ]}>
                      {filterLabels[f]} ({counts[f]})
                    </Text>
                  </View>
                </GlassWrapper>
              </Pressable>
            )}
          />
        </View>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : isError ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Error al cargar"
            description="Hubo un problema al obtener tus cupones."
            actionLabel="Reintentar"
            onAction={() => refetch()}
          />
        ) : filteredCoupons.length === 0 ? (
          <AnimatedFadeIn duration={500}>
            <EmptyState
              icon="ticket-outline"
              title={filter === 'all' ? 'Billetera vacía' : `No hay cupones ${filterLabels[filter].toLowerCase()}`}
              description={filter === 'all' ? 'Cuando tengas un plan activo, tus accesos deportivos aparecerán aquí.' : 'Probá cambiando de filtro.'}
              actionLabel={filter !== 'all' ? 'Ver todos' : undefined}
              onAction={filter !== 'all' ? () => setFilter('all') : undefined}
            />
          </AnimatedFadeIn>
        ) : (
          <FlatList
            data={filteredCoupons}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={housePalette.primary} />
            }
          />
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: housePalette.background },
  blob: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: housePalette.primary,
    opacity: 0.05,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: { 
    fontWeight: '900', 
    color: housePalette.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  filters: {
    marginBottom: 24,
  },
  filterWrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 13,
  },
  glassCard: { 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cutoutLeft: {
    position: 'absolute',
    left: -12,
    top: '65%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: housePalette.background,
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  cutoutRight: {
    position: 'absolute',
    right: -12,
    top: '65%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: housePalette.background,
    zIndex: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContainer: {
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  cardContent: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponInfo: { 
    flex: 1,
    paddingRight: 16,
  },
  clubName: { 
    color: '#FFF', 
    fontWeight: '900',
    marginBottom: 8,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  serviceName: { 
    color: housePalette.primary, 
    marginBottom: 4,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: { 
    color: housePalette.muted,
    fontWeight: '700',
    fontSize: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  list: { 
    paddingBottom: 120, // Espacio para el tab bar flotante
  },
});

