import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { NotificationItem } from '@cena/shared';
import { AvatarWithFrame, ThemedText } from '@/design-system';
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
    if (item.activity?.title) router.push(`/title/${item.activity.title.key}`);
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
      <AvatarWithFrame avatarUrl={item.actor.avatarUrl} name={item.actor.name} size={40} />
      <View style={{ flex: 1 }}>
        <ThemedText variant="callout">{textFor(item)}</ThemedText>
        <ThemedText variant="micro" color="tertiary">
          @{item.actor.username}
        </ThemedText>
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
