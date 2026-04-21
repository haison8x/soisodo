import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';

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

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} color={Colors.textOnPrimary} />,
  error: <AlertCircle size={20} color={Colors.textOnPrimary} />,
  info: <Info size={20} color={Colors.textOnPrimary} />,
};

const BG_MAP: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.danger,
  info: Colors.primary,
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);

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
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: BG_MAP[toast.type], opacity: fadeAnim },
          ]}
          pointerEvents="none"
        >
          {ICON_MAP[toast.type]}
          <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    zIndex: 9999,
    ...Shadows.md,
  },
  message: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textOnPrimary,
  },
});
