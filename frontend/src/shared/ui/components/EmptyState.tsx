import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export function EmptyState({ icon = 'inbox-outline', title, description, actionLabel, onAction }: Props) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon as any} size={56} color={theme.colors.onSurfaceVariant} style={styles.icon} />
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                {title}
            </Text>
            {description ? (
                <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                    {description}
                </Text>
            ) : null}
            {actionLabel && onAction ? (
                <Button mode="outlined" onPress={onAction} style={styles.action}>
                    {actionLabel}
                </Button>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    icon: {
        marginBottom: 16,
        opacity: 0.6,
    },
    title: {
        fontWeight: '600',
        textAlign: 'center',
    },
    description: {
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    action: {
        marginTop: 20,
    },
});
