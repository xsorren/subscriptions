import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
    value: string;
    size?: number;
    label?: string;
};

/**
 * QR code display placeholder.
 * In production, swap with `react-native-qrcode-svg` for real QR rendering.
 * For now renders the token value prominently so staff can read/input it.
 */
export function QrCodeView({ value, size = 200, label }: Props) {
    const theme = useTheme();
    const moduleSize = Math.floor(size / 25);

    // Create a deterministic visual pattern from the value
    const cells = generatePattern(value, 21);

    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.qrContainer,
                    {
                        width: size,
                        height: size,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                    },
                ]}
            >
                <View style={[styles.grid, { width: moduleSize * 21, height: moduleSize * 21 }]}>
                    {cells.map((row, y) =>
                        row.map((cell, x) => (
                            <View
                                key={`${y}-${x}`}
                                style={{
                                    position: 'absolute',
                                    left: x * moduleSize,
                                    top: y * moduleSize,
                                    width: moduleSize,
                                    height: moduleSize,
                                    backgroundColor: cell ? '#000000' : '#FFFFFF',
                                }}
                            />
                        ))
                    )}
                </View>
            </View>
            {label ? (
                <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    {label}
                </Text>
            ) : null}
            <Text variant="labelSmall" style={[styles.token, { color: theme.colors.onSurfaceVariant }]} selectable>
                {value.length > 24 ? `${value.slice(0, 12)}...${value.slice(-12)}` : value}
            </Text>
        </View>
    );
}

// Generate a deterministic visual QR-like pattern from a string
function generatePattern(input: string, size: number): boolean[][] {
    const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (startX: number, startY: number) => {
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
                const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
                grid[startY + y][startX + x] = isOuter || isInner;
            }
        }
    };

    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        grid[6][i] = i % 2 === 0;
        grid[i][6] = i % 2 === 0;
    }

    // Data area — deterministic from input string
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
    }

    for (let y = 8; y < size - 8; y++) {
        for (let x = 8; x < size - 8; x++) {
            if (x === 6 || y === 6) continue;
            hash = ((hash << 5) - hash + x * 31 + y * 17) | 0;
            grid[y][x] = (Math.abs(hash) % 3) !== 0;
        }
    }

    return grid;
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        gap: 10,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    grid: {
        position: 'relative',
    },
    label: {
        marginTop: 4,
        textAlign: 'center',
    },
    token: {
        fontSize: 10,
        opacity: 0.6,
        textAlign: 'center',
    },
});
