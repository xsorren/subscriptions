import { ActivityIndicator, Text } from 'react-native-paper';
import { Screen } from '../Screen';

export function LoadingScreen({ label = 'Cargando House...' }: { label?: string }) {
  return (
    <Screen>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12 }}>{label}</Text>
    </Screen>
  );
}
