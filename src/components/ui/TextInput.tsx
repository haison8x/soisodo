import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet, Platform } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
};

export function TextInput({ label, error, helper, style, ...rest }: Props) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? t.colors.danger
    : focused
    ? t.colors.primary
    : t.colors.border;

  return (
    <View style={{ gap: t.spacing.xs }}>
      {label && (
        <Text
          style={[
            t.typography.subheadline,
            { color: t.colors.labelSecondary, fontFamily: t.fontFamily ?? undefined },
          ]}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        {...rest}
        onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={e  => { setFocused(false); rest.onBlur?.(e); }}
        placeholderTextColor={t.colors.placeholder}
        style={[
          {
            minHeight: 48,
            paddingHorizontal: t.spacing.base,
            borderRadius: t.radius.md,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor,
            backgroundColor: t.colors.surface,
            color: t.colors.label,
            fontFamily: t.fontFamily ?? undefined,
            ...t.typography.body,
          },
          Platform.OS === 'android' && { paddingVertical: t.spacing.sm },
          style,
        ]}
      />
      {(error || helper) && (
        <Text
          style={[
            t.typography.footnote,
            {
              color: error ? t.colors.danger : t.colors.labelSecondary,
              fontFamily: t.fontFamily ?? undefined,
            },
          ]}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}
