import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { ActivityItem } from '@cena/shared';
import { AvatarWithFrame, GlassCard, GlassTextField, Icon, PremiumBadge, PrimaryButton, ThemedText } from '@/design-system';
import { VersusCard } from '@/features/versus/VersusCard';
import { useTheme } from '@/theme';
import { useAddComment, useComments, useToggleLike } from './hooks';

function verbFor(item: ActivityItem): string {
  switch (item.type) {
    case 'watched':
      return 'assistiu';
    case 'want_to_watch':
      return 'quer assistir';
    case 'rating':
      return `avaliou com nota ${item.rating?.toFixed(1)}`;
    case 'versus_created':
      return 'criou um Filme Versus';
    case 'versus_voted':
      return 'votou em um Filme Versus';
    default:
      return 'interagiu com';
  }
}

export function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const theme = useTheme();
  const router = useRouter();
  const toggleLike = useToggleLike();
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike.mutate({ activityId: item.id, liked: item.likedByMe });
  };

  return (
    <GlassCard>
      <Pressable
        style={styles.header}
        onPress={() => router.push(`/user/${item.user.username}`)}
        hitSlop={4}
      >
        <AvatarWithFrame avatarUrl={item.user.avatarUrl} name={item.user.name} size={36} frame={item.user.activeFrame} />
        <View style={{ flex: 1 }}>
          <ThemedText variant="callout">
            <ThemedText variant="subheadline">{item.user.name}</ThemedText> {verbFor(item)}
            {item.title ? (
              <ThemedText variant="subheadline"> {item.title.title}</ThemedText>
            ) : null}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ThemedText variant="micro" color="tertiary">
              @{item.user.username}
            </ThemedText>
            {item.user.isPremium ? <PremiumBadge size={12} /> : null}
          </View>
        </View>
      </Pressable>

      {item.versus ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <VersusCard versus={item.versus} />
        </View>
      ) : item.title ? (
        <Pressable
          onPress={() => router.push(`/title/${item.title!.key}`)}
          style={[styles.posterRow, { marginTop: theme.spacing.md }]}
        >
          <View
            style={[styles.poster, { backgroundColor: theme.colors.bg.layer2, borderRadius: 8 }]}
          >
            {item.title.posterUrl ? (
              <Image
                source={{ uri: item.title.posterUrl }}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="caption" color="secondary" numberOfLines={2}>
              {item.title.overview}
            </ThemedText>
          </View>
        </Pressable>
      ) : null}

      <View style={[styles.actions, { marginTop: theme.spacing.md }]}>
        <Pressable style={styles.actionBtn} onPress={handleLike} hitSlop={8}>
          <Icon
            name={item.likedByMe ? 'heart-fill' : 'heart'}
            size={20}
            color={item.likedByMe ? theme.colors.status.danger : theme.colors.text.secondary}
          />
          <ThemedText variant="caption" color="secondary">
            {item.likeCount}
          </ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => setShowComments((v) => !v)}
          hitSlop={8}
        >
          <Icon name="comment" size={20} color={theme.colors.text.secondary} />
          <ThemedText variant="caption" color="secondary">
            {item.commentCount}
          </ThemedText>
        </Pressable>
      </View>

      {showComments ? <CommentsSection activityId={item.id} /> : null}
    </GlassCard>
  );
}

function CommentsSection({ activityId }: { activityId: string }) {
  const theme = useTheme();
  const comments = useComments(activityId, true);
  const addComment = useAddComment(activityId);
  const [body, setBody] = useState('');

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    addComment.mutate({ body: trimmed }, { onSuccess: () => setBody('') });
  };

  return (
    <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
      {comments.isLoading ? (
        <ActivityIndicator color={theme.colors.accent.onSurface} />
      ) : (
        comments.data?.map((c) => (
          <View key={c.id}>
            <ThemedText variant="caption">
              <ThemedText variant="caption" color="accent">
                @{c.user.username}
              </ThemedText>{' '}
              {c.body}
            </ThemedText>
          </View>
        ))
      )}

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <GlassTextField
            placeholder="Adicionar comentário…"
            value={body}
            onChangeText={setBody}
            onSubmitEditing={submit}
          />
        </View>
        <PrimaryButton
          label="Enviar"
          onPress={submit}
          loading={addComment.isPending}
          fullWidth={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  posterRow: { flexDirection: 'row', gap: 10 },
  poster: { width: 48, height: 72, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
