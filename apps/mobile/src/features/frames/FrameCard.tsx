import { View } from 'react-native';
import type { FrameCatalogItem } from '@cena/shared';
import { AvatarWithFrame, GlassCard, Icon, PrimaryButton, ThemedText } from '@/design-system';
import { useTheme } from '@/theme';

const RARITY_LABELS: Record<FrameCatalogItem['rarity'], string> = {
  comum: 'Comum',
  especial: 'Especial',
  lendario: 'Lendário',
  staff: 'Exclusivo',
  premium: 'Premium',
};

const SOURCE_LABELS: Record<NonNullable<FrameCatalogItem['source']>, string> = {
  starter: 'De boas-vindas',
  rank_unlock: 'Desbloqueada por rank',
  founder_gift: 'Presente do fundador',
};

interface FrameCardProps {
  frame: FrameCatalogItem;
  onEquip: () => void;
  equipping: boolean;
  onGift?: () => void;
  onUpgrade?: () => void;
}

export function FrameCard({ frame, onEquip, equipping, onGift, onUpgrade }: FrameCardProps) {
  const theme = useTheme();

  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}>
        <AvatarWithFrame
          avatarUrl={null}
          name={frame.name}
          size={56}
          frame={frame.owned ? { effect: frame.effect, colors: frame.colors } : { effect: 'none', colors: [] }}
        />
        <View style={{ flex: 1 }}>
          <ThemedText variant="callout">{frame.name}</ThemedText>
          <ThemedText variant="micro" color="tertiary">
            {RARITY_LABELS[frame.rarity]}
            {frame.source ? ` · ${SOURCE_LABELS[frame.source]}` : ''}
          </ThemedText>
          <ThemedText variant="caption" color="secondary" style={{ marginTop: 4 }}>
            {frame.description}
          </ThemedText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
        {frame.owned ? (
          <PrimaryButton
            label={frame.active ? 'Em uso' : 'Usar'}
            variant={frame.active ? 'ghost' : 'primary'}
            onPress={onEquip}
            loading={equipping}
            disabled={frame.active}
            style={{ flex: 1 }}
          />
        ) : frame.unlockEntitlement === 'premium' && onUpgrade ? (
          <PrimaryButton label="Assinar Premium" variant="glass" onPress={onUpgrade} style={{ flex: 1 }} />
        ) : (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="lock" size={14} color={theme.colors.text.tertiary} />
            <ThemedText variant="caption" color="tertiary">
              Bloqueada
            </ThemedText>
          </View>
        )}
        {onGift ? (
          <PrimaryButton label="Presentear" variant="glass" onPress={onGift} style={{ flex: 1 }} />
        ) : null}
      </View>
    </GlassCard>
  );
}
