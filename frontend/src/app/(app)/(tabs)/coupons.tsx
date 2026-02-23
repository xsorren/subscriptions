import { Link } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { CouponListItem, CouponStatus } from '../../../features/coupons/api/coupons.service';
import { useMyCoupons } from '../../../features/coupons/hooks/useMyCoupons';
import { Screen } from '../../../shared/ui/Screen';
import { SectionTitle } from '../../../shared/ui/components/SectionTitle';
import { StateMessage } from '../../../shared/ui/components/StateMessage';

const statusOrder: CouponStatus[] = ['available', 'reserved', 'redeemed', 'expired', 'canceled'];

function buildStatusSummary(data: CouponListItem[]) {
  return statusOrder.map((status) => ({
    status,
    count: data.filter((coupon) => coupon.status === status).length,
  }));
}

export default function CouponsScreen() {
  const { data = [], isLoading, isError, refetch, isFetching } = useMyCoupons();
  const summary = buildStatusSummary(data);

  return (
    <Screen loading={isLoading}>
      <SectionTitle>Cupones House</SectionTitle>

      <View style={{ marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {summary.map((item) => (
          <Chip key={item.status} compact>
            {item.status}: {item.count}
          </Chip>
        ))}
      </View>

      {isError ? (
        <View style={{ marginBottom: 12 }}>
          <StateMessage variant="error" message="No se pudieron cargar tus cupones." />
          <Button mode="outlined" onPress={() => refetch()} loading={isFetching} style={{ marginTop: 8 }}>
            Reintentar
          </Button>
        </View>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Link href={`/(app)/coupons/${item.id}`} asChild>
            <Pressable>
              <Card mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium">Cupón {item.id.slice(0, 8)}</Text>
                  <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                    <Chip compact>{item.status}</Chip>
                    <Chip compact icon="clock-outline">
                      {item.expires_at ? new Date(item.expires_at).toLocaleDateString('es-AR') : 'Sin fecha'}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<StateMessage variant="empty" message="No hay cupones disponibles." />}
      />
    </Screen>
  );
}
