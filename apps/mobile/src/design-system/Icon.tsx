import { Platform } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

/**
 * Cross-platform icon. iOS renders authentic SF Symbols; Android renders a
 * weight-matched Ionicons equivalent so the two platforms feel like one brand
 * rather than two icon libraries (brief §2/§4.3).
 *
 * Add new glyphs here as one entry so call sites stay platform-agnostic.
 */
export type IconName =
  | 'feed'
  | 'search'
  | 'log'
  | 'ranking'
  | 'profile'
  | 'heart'
  | 'heart-fill'
  | 'comment'
  | 'bell'
  | 'settings'
  | 'check'
  | 'star'
  | 'star-half'
  | 'star-fill'
  | 'chevron-left'
  | 'play'
  | 'close';

const MAP: Record<IconName, { sf: SymbolViewProps['name']; ion: keyof typeof Ionicons.glyphMap }> = {
  feed: { sf: 'house', ion: 'home-outline' },
  search: { sf: 'magnifyingglass', ion: 'search-outline' },
  log: { sf: 'plus', ion: 'add' },
  ranking: { sf: 'trophy', ion: 'trophy-outline' },
  profile: { sf: 'person', ion: 'person-outline' },
  heart: { sf: 'heart', ion: 'heart-outline' },
  'heart-fill': { sf: 'heart.fill', ion: 'heart' },
  comment: { sf: 'bubble.right', ion: 'chatbubble-outline' },
  bell: { sf: 'bell', ion: 'notifications-outline' },
  settings: { sf: 'gearshape', ion: 'settings-outline' },
  check: { sf: 'checkmark', ion: 'checkmark' },
  star: { sf: 'star', ion: 'star-outline' },
  'star-half': { sf: 'star.leadinghalf.filled', ion: 'star-half' },
  'star-fill': { sf: 'star.fill', ion: 'star' },
  'chevron-left': { sf: 'chevron.left', ion: 'chevron-back' },
  play: { sf: 'play.fill', ion: 'play' },
  close: { sf: 'xmark', ion: 'close' },
};

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  weight?: SymbolViewProps['weight'];
}

export function Icon({ name, size = 24, color, weight = 'regular' }: IconProps) {
  const entry = MAP[name];
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={entry.sf}
        size={size}
        tintColor={color}
        weight={weight}
        resizeMode="scaleAspectFit"
      />
    );
  }
  return <Ionicons name={entry.ion} size={size} color={color} />;
}
