import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme';
import { GlassSurface } from './GlassSurface';
import { ThemedText } from './ThemedText';

interface GlassTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function GlassTextField({ label, error, style, onFocus, onBlur, ...rest }: GlassTextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText variant="caption" color="secondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <GlassSurface
        intensity="subtle"
        radius={theme.radii.md}
        bordered={false}
        style={[
          styles.field,
          {
            borderWidth: 1,
            borderColor: error
              ? theme.colors.status.danger
              : focused
                ? theme.colors.accent.onSurface
                : theme.colors.glass.border,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={theme.colors.text.tertiary}
          selectionColor={theme.colors.accent.onSurface}
          style={[
            styles.input,
            theme.typography.body,
            { color: theme.colors.text.primary },
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </GlassSurface>
      {error ? (
        <ThemedText variant="caption" color="danger" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { marginLeft: 4 },
  field: { justifyContent: 'center' },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 50,
  },
  error: { marginLeft: 4 },
});
