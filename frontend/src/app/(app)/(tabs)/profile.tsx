import { Card, Button, Text } from 'react-native-paper';
import { Screen } from '../../../shared/ui/Screen';
import { SectionTitle } from '../../../shared/ui/components/SectionTitle';
import { useRequireAuth } from '../../../features/auth/hooks/useRequireAuth';

export default function ProfileScreen() {
  const { signOut } = useRequireAuth();

  return (
    <Screen>
      <SectionTitle>Perfil</SectionTitle>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Cuenta House</Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Gestiona preferencias, seguridad, soporte y configuración de tu membresía.
          </Text>
          <Button mode="outlined" style={{ marginTop: 14 }} onPress={signOut}>
            Cerrar sesión
          </Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
