import { useTheme } from '@/theme';
import { Icon } from './Icon';

interface PremiumBadgeProps {
  size?: number;
}

/** Small gold marker shown next to a Premium subscriber's name anywhere identity renders. */
export function PremiumBadge({ size = 14 }: PremiumBadgeProps) {
  const theme = useTheme();
  return <Icon name="diamond" size={size} color={theme.colors.status.warning} />;
}
