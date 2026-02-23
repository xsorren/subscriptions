import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';
import { useClubDetail } from '../../../features/clubs/hooks/useClubDetail';
import { useClubEligibility } from '../../../features/clubs/hooks/useClubEligibility';
import { openExternalMapsByQuery } from '../../../features/map/utils/openExternalMaps';
import { Screen } from '../../../shared/ui/Screen';
import { StateMessage } from '../../../shared/ui/components/StateMessage';

export default function ClubDetailScreen() {
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

  return (
    <Screen loading={isLoading}>
      {(isErrorClub || isErrorEligibility) ? (
        <View style={{ marginBottom: 12 }}>
          <StateMessage variant="error" message="No se pudo cargar el detalle completo del club." />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button mode="outlined" onPress={() => refetchClub()} loading={isFetchingClub}>
              Reintentar club
            </Button>
            <Button mode="outlined" onPress={() => refetchEligibility()} loading={isFetchingEligibility}>
              Reintentar elegibilidad
            </Button>
          </View>
        </View>
      ) : null}

      <Card mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            {club?.name ?? 'Club House'}
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            {club?.description ?? 'Sin descripción disponible.'}
          </Text>

          <View style={{ marginTop: 16 }}>
            <Text variant="titleMedium">Elegibilidad</Text>
            <Text variant="bodyMedium" style={{ marginTop: 6 }}>
              Cupones disponibles: {eligibility?.availableCoupons ?? 0}
            </Text>
            <Text variant="bodyMedium">Deportes: {eligibility?.sports?.join(', ') || 'N/A'}</Text>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text variant="titleMedium">Sedes</Text>
          {club?.club_branches?.length ? (
            club.club_branches.map((branch) => {
              const addressQuery = `${branch.address_line}, ${branch.city}, ${club.name}`;
              return (
                <View key={branch.id} style={{ marginTop: 12 }}>
                  <Text variant="titleSmall">{branch.name}</Text>
                  <Text variant="bodySmall" style={{ marginTop: 2 }}>
                    {branch.address_line} · {branch.city}
                  </Text>
                  <Button mode="contained" style={{ marginTop: 8 }} onPress={() => openExternalMapsByQuery(addressQuery)}>
                    Cómo llegar a esta sede
                  </Button>
                </View>
              );
            })
          ) : (
            <StateMessage variant="empty" message="No hay sedes disponibles para este club." />
          )}
        </Card.Content>
      </Card>
    </Screen>
  );
}
