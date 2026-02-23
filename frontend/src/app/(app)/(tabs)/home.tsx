import { Card, Text } from 'react-native-paper';
import { Screen } from '../../../shared/ui/Screen';
import { SectionTitle } from '../../../shared/ui/components/SectionTitle';

export default function HomeScreen() {
  return (
    <Screen>
      <SectionTitle>House</SectionTitle>
      <Card mode="elevated">
        <Card.Content>
          <Text variant="titleMedium">Bienvenido a tu club privado deportivo</Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Resumen premium de suscripción, cupones activos y recomendaciones cercanas.
          </Text>
        </Card.Content>
      </Card>
    </Screen>
  );
}
