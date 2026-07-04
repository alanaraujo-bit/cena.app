import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { GlassCard, GlassTextField, PrimaryButton, Screen, SegmentedControl, ThemedText } from '@/design-system';
import { useAuth } from '@/features/auth';
import { ProfileView } from '@/features/profile/ProfileView';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import { useStrings } from '@/i18n';
import { useUiStore, type ThemePreference } from '@/store/uiStore';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const t = useStrings();
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profile = useProfile(user?.username);
  const themePreference = useUiStore((s) => s.themePreference);
  const setThemePreference = useUiStore((s) => s.setThemePreference);

  return (
    <Screen title={t.profile.title}>
      {profile.data ? (
        <ProfileView
          profile={profile.data}
          onOpenTitle={(key) => router.push(`/title/${key}`)}
          headerExtra={<EditBio username={user?.username} bio={profile.data.bio} />}
        />
      ) : (
        <GlassCard>
          <ThemedText variant="body" color="secondary">
            {t.common.loading}
          </ThemedText>
        </GlassCard>
      )}

      <GlassCard>
        <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
          {t.settings.appearance}
        </ThemedText>
        <SegmentedControl<ThemePreference>
          value={themePreference}
          onChange={setThemePreference}
          segments={[
            { value: 'system', label: t.settings.themeSystem },
            { value: 'light', label: t.settings.themeLight },
            { value: 'dark', label: t.settings.themeDark },
          ]}
        />
      </GlassCard>

      <PrimaryButton label="Sair" variant="glass" onPress={() => void signOut()} />
    </Screen>
  );
}

function EditBio({ username, bio }: { username: string | undefined; bio: string | null }) {
  const theme = useTheme();
  const update = useUpdateProfile(username);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio ?? '');

  if (!editing) {
    return (
      <PrimaryButton
        label={bio ? 'Editar bio' : 'Adicionar bio'}
        variant="ghost"
        onPress={() => {
          setValue(bio ?? '');
          setEditing(true);
        }}
        style={{ marginTop: theme.spacing.md }}
      />
    );
  }

  return (
    <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
      <GlassTextField
        placeholder="Fale um pouco sobre você"
        value={value}
        onChangeText={setValue}
        multiline
        maxLength={280}
      />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <PrimaryButton
          label="Salvar"
          loading={update.isPending}
          onPress={() => {
            update.mutate(
              { bio: value.trim() || null },
              { onSuccess: () => setEditing(false) },
            );
          }}
          style={{ flex: 1 }}
        />
        <PrimaryButton label="Cancelar" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
