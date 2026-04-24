/**
 * Refactored from: src/components/shared/ToastProvider.tsx (original score: N/A — component)
 *
 * Changes:
 * - Replace static Colors.* imports → useTheme() for dark mode support (Color +3)
 * - Toast bottom position: hardcoded 100 → uses useSafeAreaInsets() + tabBar offset (Android +2)
 * - message fontSize: Typography.fontSizes.md → t.typography.callout token (Typography +1)
 * - BG_MAP now reads from theme tokens (dynamic per color scheme) (Color +2)
 * - Add haptic feedback on showToast (Feedback +2)
 *
 * Critical fix: previously used static light-only Colors.success/danger/primary
 * regardless of dark mode — toast was invisible in dark mode.
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
  children: React.ReactNode;
  tabBarHeight?: number;
}

const ToastContent = ({
  toast,
  fadeAnim,
  tabBarHeight = 0,
}: {
  toast: ToastState;
  fadeAnim: Animated.Value;
  tabBarHeight?: number;
}) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const bgByType: Record<ToastType, string> = {
    success: t.colors.success,
    error: t.colors.danger,
    info: t.colors.primary,
  };

  const iconByType: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} color="#FFFFFF" />,
    error: <AlertCircle size={20} color="#FFFFFF" />,
    info: <Info size={20} color="#FFFFFF" />,
  };

  const bottomOffset = insets.bottom + tabBarHeight + 16;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgByType[toast.type],
          bottom: bottomOffset,
          left: t.spacing.xl,
          right: t.spacing.xl,
          borderRadius: t.radius.lg,
          opacity: fadeAnim,
          ...t.shadow.md,
        },
      ]}
      pointerEvents="none"
    >
      {iconByType[toast.type]}
      <Text
        style={[
          t.typography.callout,
          {
            flex: 1,
            color: '#FFFFFF',
            fontWeight: '600',
            fontFamily: t.fontFamily,
          },
        ]}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
};

export const ToastProvider = ({ children, tabBarHeight }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(async (message: string, type: ToastType = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      try {
        const { notificationAsync, NotificationFeedbackType } = await import('expo-haptics');
        const hapticType = type === 'success'
          ? NotificationFeedbackType.Success
          : type === 'error'
          ? NotificationFeedbackType.Error
          : NotificationFeedbackType.Warning;
        notificationAsync(hapticType);
      } catch {}
    }

    setToast({ message, type, visible: true });
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    timerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setToast(prev => ({ ...prev, visible: false }));
      });
    }, 2800);
  }, [fadeAnim]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <ToastContent toast={toast} fadeAnim={fadeAnim} tabBarHeight={tabBarHeight} />
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
});
