import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-google-mobile-ads', () => ({
  TestIds: {
    BANNER: 'test-banner', APP_OPEN: 'test-app-open', REWARDED: 'test-rewarded',
    NATIVE: 'test-native', REWARDED_INTERSTITIAL: 'test-ri', INTERSTITIAL: 'test-interstitial',
  },
  RewardedAd: { createForAdRequest: jest.fn(() => ({
    addAdEventListener: jest.fn(() => jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  })) },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(() => Promise.resolve(true)),
  endConnection: jest.fn(),
  getAvailablePurchases: jest.fn(() => Promise.resolve([])),
  fetchProducts: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(),
  finishTransaction: jest.fn(),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  getInfoAsync: jest.fn(() => Promise.resolve({ isDirectory: false, size: 0 })),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useBottomTabBarHeight: () => 0,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 0,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff', surface: '#fff', primary: '#000', primaryLight: '#eee',
      label: '#000', labelSecondary: '#666', labelTertiary: '#999',
      separator: '#ccc', danger: '#f00', success: '#0a0', successLight: '#efe',
      successDark: '#060', fillTertiary: '#eee',
    },
    typography: {
      title2: {}, title3: {}, callout: {}, footnote: {}, caption1: {}, subheadline: {},
    },
    spacing: { sm: 4, base: 16, lg: 24 },
    radius: { md: 8, lg: 12 },
    shadow: { sm: {} },
    fontFamily: 'System',
  }),
}));

jest.mock('../../src/components/shared/ToastProvider', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('../../src/services/AdFreeService', () => ({
  __esModule: true,
  default: {
    isAdSuppressed: jest.fn(() => false),
    isAdFreePeriodActive: jest.fn(() => false),
    getAdFreeRemainingMs: jest.fn(() => 0),
    grantAdFree: jest.fn(() => Promise.resolve()),
    initialize: jest.fn(),
    refreshFromStorage: jest.fn(),
    isPremium: jest.fn(() => false),
  },
}));

jest.mock('../../src/hooks/useRewardedAd', () => ({
  useRewardedAd: () => ({
    showAd: jest.fn(),
    isLoaded: false,
  }),
}));

import AdFreeService from '../../src/services/AdFreeService';
import SettingsScreen from '../../src/screens/SettingsScreen';

const mockIsAdSuppressed = AdFreeService.isAdSuppressed as jest.Mock;
const mockIsAdFreePeriodActive = AdFreeService.isAdFreePeriodActive as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SettingsScreen — rewarded ad section', () => {
  it('shows rewarded ad row when user is free tier and no active ad-free period', () => {
    mockIsAdSuppressed.mockReturnValue(false);
    mockIsAdFreePeriodActive.mockReturnValue(false);
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/xem quảng cáo/i)).toBeTruthy();
  });

  it('does NOT show rewarded ad row when user is premium (isAdSuppressed = true)', () => {
    mockIsAdSuppressed.mockReturnValue(true);
    mockIsAdFreePeriodActive.mockReturnValue(false);
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText(/xem quảng cáo để miễn/i)).toBeNull();
  });

  it('shows remaining time when ad-free period is active', () => {
    mockIsAdSuppressed.mockReturnValue(true);
    mockIsAdFreePeriodActive.mockReturnValue(true);
    (AdFreeService.getAdFreeRemainingMs as jest.Mock).mockReturnValue(2 * 60 * 60 * 1000); // 2h
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/miễn quảng cáo/i)).toBeTruthy();
  });
});
