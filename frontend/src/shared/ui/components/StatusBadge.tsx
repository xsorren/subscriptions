import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { housePalette } from '../../../core/theme/theme';

type StatusType = 'available' | 'reserved' | 'redeemed' | 'expired' | 'canceled' | 'active' | 'trialing' | 'past_due' | 'paused';

const statusConfig: Record<StatusType, { label: string; color: string; icon: string }> = {
    available: { label: 'Disponible', color: housePalette.success, icon: 'check-circle-outline' },
    reserved: { label: 'Reservado', color: housePalette.primary, icon: 'clock-outline' },
    redeemed: { label: 'Canjeado', color: '#8B8BF5', icon: 'check-all' },
    expired: { label: 'Expirado', color: housePalette.muted, icon: 'timer-off-outline' },
    canceled: { label: 'Cancelado', color: housePalette.error, icon: 'close-circle-outline' },
    active: { label: 'Activa', color: housePalette.success, icon: 'check-circle-outline' },
    trialing: { label: 'Prueba', color: housePalette.primary, icon: 'test-tube' },
    past_due: { label: 'Vencida', color: housePalette.error, icon: 'alert-circle-outline' },
    paused: { label: 'Pausada', color: housePalette.muted, icon: 'pause-circle-outline' },
};

type Props = {
    status: string;
    compact?: boolean;
};

export function StatusBadge({ status, compact = true }: Props) {
    const config = statusConfig[status as StatusType] ?? {
        label: status,
        color: housePalette.muted,
        icon: 'help-circle-outline',
    };

    return (
        <Chip
            compact={compact}
            icon={config.icon}
            style={[styles.badge, { borderColor: config.color }]}
            textStyle={{ color: config.color, fontSize: 12 }}
        >
            {config.label}
        </Chip>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
});
