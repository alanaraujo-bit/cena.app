import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { loginSchema } from '@cena/shared';
import { AppBackground, GlassTextField, PrimaryButton, ThemedText } from '@/design-system';
import { useAuth } from '@/features/auth';
import { ApiRequestError } from '@/lib/api';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ identifier: f.identifier?.[0], password: f.password?.[0] });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signIn(parsed.data);
    } catch (err) {
      setFormError(
        err instanceof ApiRequestError ? err.message : 'Não foi possível entrar. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={[styles.container, { padding: theme.spacing.xl }]}>
            <View style={styles.header}>
              <ThemedText variant="display" color="accent">
                CENA
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ marginTop: 4 }}>
                Sua cena favorita, toda noite.
              </ThemedText>
            </View>

            <View style={{ gap: theme.spacing.lg }}>
              <GlassTextField
                label="E-mail ou usuário"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
                error={errors.identifier}
              />
              <GlassTextField
                label="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />

              {formError ? (
                <ThemedText variant="caption" color="danger">
                  {formError}
                </ThemedText>
              ) : null}

              <PrimaryButton label="Entrar" onPress={handleSubmit} loading={loading} />
            </View>

            <View style={styles.footer}>
              <ThemedText variant="callout" color="secondary">
                Novo por aqui?{' '}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
                <ThemedText variant="callout" color="accent">
                  Criar conta
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', gap: 36 },
  header: { alignItems: 'flex-start' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
