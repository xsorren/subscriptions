import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { housePalette } from '../../../core/theme/theme';

type Props = {
    expiresAt: string;
    onExpired?: () => void;
};

export function CountdownTimer({ expiresAt, onExpired }: Props) {
    const theme = useTheme();
    const [secondsLeft, setSecondsLeft] = useState(() => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        return Math.max(0, Math.floor(diff / 1000));
    });

    useEffect(() => {
        if (secondsLeft <= 0) {
            onExpired?.();
            return;
        }

        const timer = setTimeout(() => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            const next = Math.max(0, Math.floor(diff / 1000));
            setSecondsLeft(next);
            if (next <= 0) onExpired?.();
        }, 1000);

        return () => clearTimeout(timer);
    }, [secondsLeft, expiresAt, onExpired]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const isUrgent = secondsLeft <= 30;
    const isExpired = secondsLeft <= 0;

    const color = isExpired
        ? housePalette.error
        : isUrgent
            ? housePalette.primary
            : housePalette.success;

    return (
        <View style={[styles.container, { borderColor: color }]}>
            <MaterialCommunityIcons
                name={isExpired ? 'timer-off-outline' : 'timer-outline'}
                size={20}
                color={color}
            />
            <Text style={[styles.time, { color }]}>
                {isExpired
                    ? 'Expirado'
                    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    time: {
        fontSize: 18,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
});
