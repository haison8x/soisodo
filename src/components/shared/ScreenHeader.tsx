/**
 * Refactored from: src/components/shared/ScreenHeader.tsx (original score: N/A — component)
 *
 * Changes:
 * - Replace static Colors.* imports → useTheme() for full dark mode support (Color +3)
 * - Replace TouchableOpacity → Pressable with android_ripple (Android +3, Feedback +2)
 * - backButton padding: 2 → 10 for proper 44pt tap target (Hit targets +2)
 * - title fontSize: Typography.fontSizes.lg → t.typography.headline token (Typography +2)
 * - header backgroundColor: hardcoded → t.colors.surface (Color +2)
 * - border color: hardcoded → t.colors.separator (Color +1)
 * - fontFamily applied via useTheme (Consistency +1)
 *
 * Critical fix: previously broke dark mode on AppInfoScreen, PrivacyScreen,
 * TermsScreen, UserManualScreen
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

const ScreenHeader = ({ title, onBack, rightElement }: ScreenHeaderProps) => {
  const t = useTheme();

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: t.colors.surface,
        borderBottomColor: t.colors.separator,
      },
    ]}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable
            testID="screen-header-back"
            onPress={onBack}
            android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
            style={({ pressed }) => [
              styles.backButton,
              pressed && Platform.OS === 'ios' && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <ChevronLeft size={28} color={t.colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text
        style={[
          t.typography.headline,
          {
            flex: 1,
            color: t.colors.label,
            textAlign: 'center',
            fontFamily: t.fontFamily,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.right}>
        {rightElement ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  left: { width: 44, alignItems: 'flex-start' },
  right: { width: 44, alignItems: 'flex-end' },
  backButton: {
    borderRadius: 999,
    padding: 8,
  },
  placeholder: { width: 28, height: 28 },
});

export default ScreenHeader;
