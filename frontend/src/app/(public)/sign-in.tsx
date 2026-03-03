import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../shared/ui/Screen';
import { useRequireAuth } from '../../features/auth/hooks/useRequireAuth';
import { trackEvent } from '../../core/telemetry/trackEvent';
import { housePalette } from '../../core/theme/theme';

export default function SignInScreen() {
  const theme = useTheme();
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
      setSuccess('Te enviamos un enlace mágico a tu correo. Revisá tu bandeja de entrada.');
      trackEvent('auth_signin_otp_sent', { email: email.trim().toLowerCase() });
    } catch {
      setError('No se pudo iniciar sesión. Reintentá en unos segundos.');
      trackEvent('auth_signin_failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Brand Area */}
        <View style={styles.brandArea}>
          <View style={[styles.logoContainer, { backgroundColor: housePalette.primary }]}>
            <MaterialCommunityIcons name="home-lightning-bolt-outline" size={42} color="#1A1A1A" />
          </View>
          <Text variant="displaySmall" style={styles.brandName}>House</Text>
          <Text variant="bodyLarge" style={[styles.tagline, { color: housePalette.muted }]}>
            Experiencia deportiva exclusiva
          </Text>
        </View>

        {/* Form Area */}
        <View style={styles.formArea}>
          <Text variant="titleMedium" style={[styles.formTitle, { color: housePalette.text }]}>
            Ingresá con tu email
          </Text>
          <Text variant="bodyMedium" style={{ color: housePalette.muted, marginTop: 4 }}>
            Te enviaremos un enlace mágico para acceder sin contraseña.
          </Text>

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            left={<TextInput.Icon icon="email-outline" />}
            style={styles.input}
            error={!!error || isInvalidEmail}
          />

          {isInvalidEmail ? <HelperText type="error">Formato de email inválido.</HelperText> : null}
          {error ? <HelperText type="error">{error}</HelperText> : null}

          {success ? (
            <View style={[styles.successBanner, { backgroundColor: 'rgba(91, 214, 162, 0.1)' }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={housePalette.success} />
              <Text variant="bodyMedium" style={{ color: housePalette.success, flex: 1, marginLeft: 8 }}>
                {success}
              </Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
            style={styles.continueBtn}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
            accessibilityLabel="Continuar con email"
            accessibilityHint="Envía un enlace mágico de acceso a tu correo"
          >
            {loading ? 'Enviando...' : 'Continuar'}
          </Button>
        </View>

        {/* Footer */}
        <Text variant="bodySmall" style={[styles.footer, { color: housePalette.muted }]}>
          Al continuar, aceptás los Términos de Servicio y la Política de Privacidad de House.
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 6,
  },
  formArea: {
    paddingHorizontal: 4,
  },
  formTitle: {
    fontWeight: '700',
  },
  input: {
    marginTop: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  continueBtn: {
    marginTop: 16,
    borderRadius: 12,
  },
  footer: {
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
