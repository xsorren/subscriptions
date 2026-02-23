import { Text } from 'react-native-paper';

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 12 }}>
      {children}
    </Text>
  );
}
