import { useState } from 'react';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { Screen } from '../../shared/ui/Screen';
import { useRequireAuth } from '../../features/auth/hooks/useRequireAuth';
import { trackEvent } from '../../core/telemetry/trackEvent';

export default function SignInScreen() {
  const { signInWithEmailOtp } = useRequireAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isInvalidEmail = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContinue = async () => {
    setError(null);
    setSuccess(null);

    if (!email || isInvalidEmail) {
      setError('Ingresa un email válido para continuar.');
      trackEvent('auth_signin_validation_failed', { email });
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailOtp(email.trim().toLowerCase());
      setSuccess('Te enviamos un enlace mágico a tu correo.');
      trackEvent('auth_signin_otp_sent', { email: email.trim().toLowerCase() });
    } catch {
      setError('No se pudo iniciar sesión. Reintenta en unos segundos.');
      trackEvent('auth_signin_failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            House
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Accede a una experiencia deportiva minimalista, elegante y exclusiva.
          </Text>

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={{ marginTop: 16 }}
          />

          {isInvalidEmail ? <HelperText type="error">Formato de email inválido.</HelperText> : null}
          {error ? <HelperText type="error">{error}</HelperText> : null}
          {success ? <HelperText type="info">{success}</HelperText> : null}

          <Button
            mode="contained"
            style={{ marginTop: 8 }}
            onPress={handleContinue}
            loading={loading}
            accessibilityLabel="Continuar con email"
            accessibilityHint="Envía un enlace mágico de acceso a tu correo"
          >
            {loading ? 'Enviando...' : 'Continuar'}
          </Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
