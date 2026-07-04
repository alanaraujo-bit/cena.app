import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import type { TypographyVariant } from '@/theme';

type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'onAccent' | 'danger';

interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorKey;
  align?: TextStyle['textAlign'];
}

export function ThemedText({
  variant = 'body',
  color = 'primary',
  align,
  style,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  const colorValue: string = {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    tertiary: theme.colors.text.tertiary,
    accent: theme.colors.accent.onSurface,
    onAccent: theme.colors.text.onAccent,
    danger: theme.colors.status.danger,
  }[color];

  return (
    <Text
      style={[theme.typography[variant], { color: colorValue, textAlign: align }, style]}
      {...rest}
    />
  );
}
