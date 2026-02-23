import { Link } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { Screen } from '../shared/ui/Screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <Card mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            Ruta no encontrada
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            La pantalla que buscas no existe o fue movida.
          </Text>
          <Link href="/" asChild>
            <Button mode="contained" style={{ marginTop: 16 }}>
              Volver al inicio
            </Button>
          </Link>
        </Card.Content>
      </Card>
    </Screen>
  );
}
