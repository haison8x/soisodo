import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
  padding?: number;
};

export function Card({ children, style, elevation = 'sm', padding }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.surfaceElevated,
          borderRadius: t.radius.lg,
          padding: padding ?? t.spacing.base,
        },
        t.shadow[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}
