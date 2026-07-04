import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { registerSchema } from '@cena/shared';
import { AppBackground, GlassTextField, PrimaryButton, ThemedText } from '@/design-system';
import { useAuth } from '@/features/auth';
import { ApiRequestError } from '@/lib/api';
import { useTheme } from '@/theme';

type FieldErrors = Partial<Record<'name' | 'username' | 'email' | 'password', string>>;

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp } = useAuth();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    setFormError(null);
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({
        name: f.name?.[0],
        username: f.username?.[0],
        email: f.email?.[0],
        password: f.password?.[0],
      });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signUp(parsed.data);
    } catch (err) {
      setFormError(
        err instanceof ApiRequestError
          ? err.message
          : 'Não foi possível criar sua conta. Tente novamente.',
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
          <ScrollView
            contentContainerStyle={[styles.container, { padding: theme.spacing.xl }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <ThemedText variant="title">Criar conta</ThemedText>
              <ThemedText variant="body" color="secondary" style={{ marginTop: 4 }}>
                Comece a registrar suas cenas favoritas.
              </ThemedText>
            </View>

            <View style={{ gap: theme.spacing.lg }}>
              <GlassTextField
                label="Nome"
                value={form.name}
                onChangeText={set('name')}
                error={errors.name}
              />
              <GlassTextField
                label="Nome de usuário"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.username}
                onChangeText={set('username')}
                error={errors.username}
              />
              <GlassTextField
                label="E-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={form.email}
                onChangeText={set('email')}
                error={errors.email}
              />
              <GlassTextField
                label="Senha"
                secureTextEntry
                value={form.password}
                onChangeText={set('password')}
                error={errors.password}
              />

              {formError ? (
                <ThemedText variant="caption" color="danger">
                  {formError}
                </ThemedText>
              ) : null}

              <PrimaryButton label="Criar conta" onPress={handleSubmit} loading={loading} />
            </View>

            <View style={styles.footer}>
              <ThemedText variant="callout" color="secondary">
                Já tem conta?{' '}
              </ThemedText>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <ThemedText variant="callout" color="accent">
                  Entrar
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', gap: 28 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
