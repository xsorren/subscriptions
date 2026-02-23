import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  loading?: boolean;
}>;

export function Screen({ children, loading = false }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>{loading ? <ActivityIndicator animating color={theme.colors.primary} /> : children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
});
