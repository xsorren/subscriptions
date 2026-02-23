import { Link } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { useDiscoverEligibleClubs } from '../../../features/map/hooks/useDiscoverEligibleClubs';
import { openExternalMaps } from '../../../features/map/utils/openExternalMaps';
import { useCurrentLocation } from '../../../features/map/hooks/useCurrentLocation';
import { Screen } from '../../../shared/ui/Screen';
import { SectionTitle } from '../../../shared/ui/components/SectionTitle';
import { StateMessage } from '../../../shared/ui/components/StateMessage';
import { useState } from 'react';
import { trackEvent } from '../../../core/telemetry/trackEvent';

const radiusOptions = [2000, 5000, 10000] as const;

export default function MapScreen() {
  const [radiusMeters, setRadiusMeters] = useState<number>(5000);
  const { coords, loading: loadingLocation, permissionDenied, error: locationError, refresh } = useCurrentLocation();
  const { data = [], isLoading, isError, refetch, isFetching } = useDiscoverEligibleClubs(
    { ...coords, radiusMeters },
    !loadingLocation
  );

  const handleRadiusChange = (value: number) => {
    setRadiusMeters(value);
    trackEvent('map_radius_changed', { radiusMeters: value });
  };

  return (
    <Screen loading={isLoading || loadingLocation}>
      <SectionTitle>Descubrimiento House</SectionTitle>

      <View style={{ marginBottom: 12, flexDirection: 'row', gap: 8 }}>
        {radiusOptions.map((value) => (
          <Chip
            key={value}
            selected={value === radiusMeters}
            onPress={() => handleRadiusChange(value)}
            compact
          >
            {value / 1000} km
          </Chip>
        ))}
      </View>

      {permissionDenied ? (
        <View style={{ marginBottom: 12 }}>
          <StateMessage variant="error" message="Permiso de ubicación denegado. Usamos ubicación por defecto." />
          <Button mode="outlined" onPress={refresh} accessibilityLabel="Reintentar permiso de ubicación">
            Reintentar permiso
          </Button>
        </View>
      ) : null}

      {locationError ? (
        <View style={{ marginBottom: 12 }}>
          <StateMessage variant="error" message={locationError} />
          <Button mode="outlined" onPress={refresh} accessibilityLabel="Reintentar obtención de ubicación">
            Reintentar ubicación
          </Button>
        </View>
      ) : null}

      {isError ? (
        <View style={{ marginBottom: 12 }}>
          <StateMessage variant="error" message="No se pudo cargar el mapa de clubes." />
          <Button mode="outlined" onPress={() => refetch()} loading={isFetching} accessibilityLabel="Reintentar búsqueda de clubes">
            Reintentar discover
          </Button>
        </View>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(item) => item.clubBranchId}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Card mode="elevated">
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodyMedium" style={{ marginTop: 6 }}>
                Cupones disponibles: {item.availableCoupons}
              </Text>
              <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
                <Link href={`/(app)/clubs/${item.clubId}`} asChild>
                  <Pressable>
                    <Button mode="outlined">Ver detalle</Button>
                  </Pressable>
                </Link>
                <Button
                  mode="contained"
                  onPress={() => {
                    trackEvent('map_navigation_opened', { clubId: item.clubId, clubBranchId: item.clubBranchId });
                    openExternalMaps(item.lat, item.lng, item.name);
                  }}
                  accessibilityLabel={`Cómo llegar a ${item.name}`}
                >
                  Cómo llegar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<StateMessage variant="empty" message="No se encontraron clubes elegibles." />}
      />
    </Screen>
  );
}
