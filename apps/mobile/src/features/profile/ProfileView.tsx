import { ScrollView, View } from 'react-native';
import type { PublicProfile } from '@cena/shared';
import { AvatarWithFrame, GlassCard, PosterCard, StatTile, ThemedText } from '@/design-system';
import { FollowButton } from '@/features/follow/FollowButton';
import { useTheme } from '@/theme';
import { CinephileOrderCard } from './CinephileOrderCard';

interface ProfileViewProps {
  profile: PublicProfile;
  onOpenTitle: (key: string) => void;
  /** Rendered above the favorites shelf — e.g. an "editar perfil" button. */
  headerExtra?: React.ReactNode;
}

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  return `${hours}h`;
}

export function ProfileView({ profile, onOpenTitle, headerExtra }: ProfileViewProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <GlassCard>
        <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
          <AvatarWithFrame
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            online={profile.online}
            frameId={profile.activeFrameId}
          />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ThemedText variant="headline">{profile.name}</ThemedText>
            <ThemedText variant="callout" color="secondary">
              @{profile.username}
            </ThemedText>
          </View>
        </View>

        {profile.bio ? (
          <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
            {profile.bio}
          </ThemedText>
        ) : null}

        {!profile.isOwnProfile ? (
          <View style={{ marginTop: theme.spacing.md }}>
            <FollowButton username={profile.username} relationship={profile.relationship} />
          </View>
        ) : null}

        {headerExtra}
      </GlassCard>

      {profile.isRestricted ? (
        <GlassCard>
          <ThemedText variant="body" color="secondary" align="center">
            Este perfil é privado.
          </ThemedText>
        </GlassCard>
      ) : (
        <>
          <CinephileOrderCard order={profile.cinephileOrder} />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <StatTile label="Assistidos" value={String(profile.stats.watchedCount)} />
            <StatTile label="Seguidores" value={String(profile.followersCount)} />
            <StatTile label="Seguindo" value={String(profile.followingCount)} />
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <StatTile label="Tempo assistido" value={formatMinutes(profile.stats.totalMinutes)} />
            <StatTile label="Filmes" value={String(profile.stats.moviesWatched)} />
            <StatTile label="Episódios" value={String(profile.stats.episodesWatched)} />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <ThemedText variant="subheadline">Favoritos</ThemedText>
            {profile.favorites.length === 0 ? (
              <GlassCard>
                <ThemedText variant="caption" color="secondary">
                  Nenhum favorito ainda.
                </ThemedText>
              </GlassCard>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {profile.favorites.map((item) => (
                  <PosterCard
                    key={item.key}
                    posterUrl={item.posterUrl}
                    title={item.title}
                    year={item.year}
                    mediaType={item.mediaType}
                    rating={item.voteAverage}
                    onPress={() => onOpenTitle(item.key)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </>
      )}
    </View>
  );
}
