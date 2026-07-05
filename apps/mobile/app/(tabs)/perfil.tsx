import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { PrivacyMode } from '@cena/shared';
import { AvatarWithFrame, GlassCard, GlassTextField, Icon, PrimaryButton, Screen, SegmentedControl, ThemedText } from '@/design-system';
import { useAuth } from '@/features/auth';
import { usePendingRequests, useRespondToRequest } from '@/features/follow/hooks';
import { usePremiumStatus } from '@/features/premium/hooks';
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

      <PrimaryButton label="Minhas molduras" variant="glass" onPress={() => router.push('/molduras')} />
      <PremiumSection />

      {profile.data?.privacyMode === 'privado' ? <PendingRequests /> : null}

      <GlassCard>
        <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
          Privacidade
        </ThemedText>
        <PrivacyControl username={user?.username} value={profile.data?.privacyMode} />
      </GlassCard>

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

function PremiumSection() {
  const theme = useTheme();
  const router = useRouter();
  const status = usePremiumStatus();
  const isPremium = status.data?.isPremium ?? false;

  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <Icon name="diamond" size={22} color={theme.colors.status.warning} />
        <View style={{ flex: 1 }}>
          <ThemedText variant="subheadline">{isPremium ? 'Você é Premium' : 'CENA Premium'}</ThemedText>
          <ThemedText variant="caption" color="secondary">
            {isPremium
              ? 'Selo, molduras exclusivas, Versus sem limite e estatísticas avançadas.'
              : 'Molduras exclusivas, Versus sem limite e estatísticas avançadas.'}
          </ThemedText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
        <PrimaryButton
          label={isPremium ? 'Gerenciar' : 'Assinar'}
          variant="glass"
          onPress={() => router.push('/premium')}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          label="Estatísticas"
          variant="ghost"
          onPress={() => router.push('/estatisticas')}
          style={{ flex: 1 }}
        />
      </View>
    </GlassCard>
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

function PrivacyControl({
  username,
  value,
}: {
  username: string | undefined;
  value: PrivacyMode | undefined;
}) {
  const update = useUpdateProfile(username);
  if (!value) return null;

  return (
    <SegmentedControl<PrivacyMode>
      value={value}
      onChange={(privacyMode) => update.mutate({ privacyMode })}
      segments={[
        { value: 'publico', label: 'Público' },
        { value: 'apenas_amigos', label: 'Amigos' },
        { value: 'privado', label: 'Privado' },
      ]}
    />
  );
}

function PendingRequests() {
  const theme = useTheme();
  const requests = usePendingRequests();
  const respond = useRespondToRequest();

  if (!requests.data || requests.data.length === 0) return null;

  return (
    <GlassCard>
      <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
        Solicitações de seguidor
      </ThemedText>
      <View style={{ gap: theme.spacing.md }}>
        {requests.data.map((req) => (
          <View key={req.username} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <AvatarWithFrame avatarUrl={req.avatarUrl} name={req.name} size={40} />
            <View style={{ flex: 1 }}>
              <ThemedText variant="callout">{req.name}</ThemedText>
              <ThemedText variant="caption" color="secondary">
                @{req.username}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <Pressable
                onPress={() => respond.mutate({ username: req.username, accept: true })}
                hitSlop={8}
              >
                <Icon name="check" size={22} color={theme.colors.status.success} />
              </Pressable>
              <Pressable
                onPress={() => respond.mutate({ username: req.username, accept: false })}
                hitSlop={8}
              >
                <Icon name="close" size={22} color={theme.colors.status.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}
