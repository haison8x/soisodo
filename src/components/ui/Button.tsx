import React from 'react';
import { Pressable, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'success' | 'warning';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  accessibilityLabel,
  fullWidth = true,
}: Props) {
  const t = useTheme();

  const bgByVariant: Record<Variant, string> = {
    primary:     t.colors.primary,
    secondary:   t.colors.fillSecondary,
    destructive: t.colors.danger,
    ghost:       'transparent',
    success:     t.colors.success,
    warning:     t.colors.warning,
  };
  const fgByVariant: Record<Variant, string> = {
    primary:     '#FFFFFF',
    secondary:   t.colors.label,
    destructive: '#FFFFFF',
    ghost:       t.colors.primary,
    success:     '#FFFFFF',
    warning:     '#FFFFFF',
  };
  const rippleByVariant: Record<Variant, string> = {
    primary:     'rgba(255,255,255,0.25)',
    secondary:   t.colors.fillTertiary,
    destructive: 'rgba(255,255,255,0.25)',
    ghost:       t.colors.fillTertiary,
    success:     'rgba(255,255,255,0.25)',
    warning:     'rgba(255,255,255,0.25)',
  };

  const handlePress = async () => {
    if (Platform.OS === 'ios') {
      try {
        const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      android_ripple={{ color: rippleByVariant[variant], borderless: false }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bgByVariant[variant],
          borderRadius: t.radius.md,
          width: fullWidth ? '100%' : undefined,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: variant === 'ghost' ? t.colors.primary : 'transparent',
        },
        pressed && Platform.OS === 'ios' && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fgByVariant[variant]} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: fgByVariant[variant], fontFamily: t.fontFamily ?? undefined },
            t.typography.headline,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {},
  pressed:  { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
