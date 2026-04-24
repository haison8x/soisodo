/**
 * AppText — wrapper loại bỏ boilerplate `fontFamily: t.fontFamily ?? undefined`
 *
 * Vấn đề: 80+ lần lặp `fontFamily: t.fontFamily ?? undefined` trên Text elements.
 * Solution: AppText tự inject fontFamily từ theme, expose tất cả Text props.
 *
 * Usage:
 *   <AppText style={t.typography.body}>Nội dung</AppText>
 *   <AppText variant="headline" color={t.colors.label}>Tiêu đề</AppText>
 */
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { typography } from '../../theme/tokens';

type TypographyVariant = keyof typeof typography;

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

export function AppText({ variant, color, style, ...rest }: Props) {
  const t = useTheme();

  const variantStyle: TextStyle = variant ? t.typography[variant] : {};
  const colorStyle: TextStyle = color ? { color } : {};

  return (
    <Text
      {...rest}
      style={[
        { fontFamily: t.fontFamily ?? undefined },
        variantStyle,
        colorStyle,
        style,
      ]}
    />
  );
}
