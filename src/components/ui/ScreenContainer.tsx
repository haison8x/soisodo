import React from 'react';
import { View, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  grouped?: boolean;
  keyboardAvoiding?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function ScreenContainer({
  children,
  style,
  grouped,
  keyboardAvoiding,
  edges = ['top', 'left', 'right'],
}: Props) {
  const t = useTheme();
  const bg = grouped ? t.colors.backgroundGrouped : t.colors.background;

  const inner = (
    <View style={[{ flex: 1, backgroundColor: bg }, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      <StatusBar
        barStyle={t.scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}
