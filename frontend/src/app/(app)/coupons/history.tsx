import { FlatList, View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../shared/ui/Screen';
import { EmptyState } from '../../../shared/ui/components/EmptyState';
import { SkeletonList } from '../../../shared/ui/components/SkeletonCard';
import { useRedemptionHistory, RedemptionHistoryItem } from '../../../features/coupons/hooks/useRedemptionHistory';
import { housePalette } from '../../../core/theme/theme';

export default function RedemptionHistoryScreen() {
    const theme = useTheme();
    const { data: history = [], isLoading } = useRedemptionHistory();

    const renderItem = ({ item }: { item: RedemptionHistoryItem }) => (
        <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.row}>
                <View style={[styles.icon, { backgroundColor: 'rgba(91, 214, 162, 0.12)' }]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={22} color={housePalette.success} />
                </View>
                <View style={styles.info}>
                    <Text variant="titleSmall" style={{ color: housePalette.text }}>
                        {item.club_name ?? item.branch_name ?? `Sede ${item.club_branch_id.slice(0, 8)}`}
                    </Text>
                    <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 2 }}>
                        Cupón: {item.coupon_id.slice(0, 12)}...
                    </Text>
                    <Text variant="bodySmall" style={{ color: housePalette.muted, marginTop: 2 }}>
                        {new Date(item.redeemed_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    if (isLoading) {
        return (
            <Screen>
                <SkeletonList count={6} />
            </Screen>
        );
    }

    return (
        <Screen>
            <Text variant="headlineSmall" style={styles.title}>Historial de canjes</Text>

            {history.length === 0 ? (
                <EmptyState
                    icon="history"
                    title="Sin canjes todavía"
                    description="Cuando canjees cupones en un club, aparecerán aquí."
                />
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: {
        fontWeight: '700',
        marginBottom: 16,
    },
    card: { borderRadius: 14 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: { flex: 1 },
});
