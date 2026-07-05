import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { NotificationItem } from '@cena/shared';
import { AvatarWithFrame, PremiumBadge, ThemedText } from '@/design-system';
import { useTheme } from '@/theme';
import { useMarkRead } from './hooks';

function textFor(item: NotificationItem): string {
  switch (item.type) {
    case 'new_follower':
      return `${item.actor.name} começou a seguir você`;
    case 'follow_request':
      return `${item.actor.name} quer seguir você`;
    case 'follow_accepted':
      return `${item.actor.name} aceitou sua solicitação para seguir`;
    case 'like':
      return `${item.actor.name} curtiu sua atividade`;
    case 'comment':
      return item.commentPreview
        ? `${item.actor.name} comentou: "${item.commentPreview}"`
        : `${item.actor.name} comentou na sua atividade`;
    case 'frame_gift':
      return `${item.actor.name} te presenteou com a moldura "${item.frame?.name}" 🎁`;
    case 'versus_vote':
      return `${item.actor.name} votou no seu Filme Versus 🎬`;
    default:
      return `${item.actor.name} interagiu com você`;
  }
}

export function NotificationRow({ item }: { item: NotificationItem }) {
  const theme = useTheme();
  const router = useRouter();
  const markRead = useMarkRead();

  const handlePress = () => {
    if (!item.read) markRead.mutate(item.id);
    if (item.type === 'frame_gift') router.push('/molduras');
    else if (item.type === 'versus_vote' && item.versus) router.push(`/versus/${item.versus.id}`);
    else if (item.activity?.title) router.push(`/title/${item.activity.title.key}`);
    else router.push(`/user/${item.actor.username}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        gap: theme.spacing.md,
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: item.read ? 'transparent' : theme.colors.glass.overlay,
      }}
    >
      <AvatarWithFrame avatarUrl={item.actor.avatarUrl} name={item.actor.name} size={40} frame={item.actor.activeFrame} />
      <View style={{ flex: 1 }}>
        <ThemedText variant="callout">{textFor(item)}</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ThemedText variant="micro" color="tertiary">
            @{item.actor.username}
          </ThemedText>
          {item.actor.isPremium ? <PremiumBadge size={12} /> : null}
        </View>
      </View>
      {!item.read ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.status.danger,
          }}
        />
      ) : null}
    </Pressable>
  );
}
