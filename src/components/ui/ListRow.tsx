import React from 'react';
import { Pressable, Text, View, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
};

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  destructive,
  showChevron = true,
}: Props) {
  const t = useTheme();
  const titleColor = destructive ? t.colors.danger : t.colors.label;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{ color: t.colors.fillTertiary }}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: t.spacing.base,
          paddingVertical: t.spacing.md,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: t.spacing.md,
          backgroundColor: t.colors.surface,
        },
        pressed && Platform.OS === 'ios' && { backgroundColor: t.colors.fillTertiary },
      ]}
    >
      {leading && <View style={{ width: 30, alignItems: 'center' }}>{leading}</View>}
      <View style={{ flex: 1 }}>
        <Text style={[t.typography.callout, { color: titleColor, fontFamily: t.fontFamily ?? undefined }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, fontFamily: t.fontFamily ?? undefined }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {showChevron && onPress && !trailing && (
        <Text style={{ color: t.colors.labelTertiary, fontSize: 18 }}>›</Text>
      )}
    </Pressable>
  );
}
