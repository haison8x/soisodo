import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock Ads
jest.mock('react-native-google-mobile-ads', () => ({
  TestIds: {
    BANNER: 'test-banner', APP_OPEN: 'test-app-open', REWARDED: 'test-rewarded',
    NATIVE: 'test-native', REWARDED_INTERSTITIAL: 'test-ri', INTERSTITIAL: 'test-interstitial',
  },
  BannerAdSize: { BANNER: 'BANNER' },
  RewardedAd: { createForAdRequest: jest.fn(() => ({
    addAdEventListener: jest.fn(() => jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  })) },
  InterstitialAd: { createForAdRequest: jest.fn(() => ({
    addAdEventListener: jest.fn(() => jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  })) },
  AdEventType: { LOADED: 'loaded', CLOSED: 'closed' },
  NativeAd: { createForAdRequest: jest.fn(() => Promise.resolve({ destroy: jest.fn() })) },
  NativeAdView: ({ children }: any) => children,
  NativeAsset: ({ children }: any) => children,
  NativeAssetType: { ICON: 'icon', HEADLINE: 'headline', ADVERTISER: 'advertiser', BODY: 'body', CALL_TO_ACTION: 'call_to_action' },
  NativeMediaView: () => null,
}));

// Mock Banner components to avoid react-native-google-mobile-ads layout issues
jest.mock('../../src/components/AdBanner', () => 'AdBanner');
jest.mock('../../src/components/NativeAdBanner', () => 'NativeAdBanner');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 0,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff', surface: '#fff', primary: '#000', primaryLight: '#eee',
      label: '#000', labelSecondary: '#666', labelTertiary: '#999',
      separator: '#ccc', danger: '#f00', fillTertiary: '#eee', success: '#0f0',
      successLight: '#efe', successDark: '#070', hintBorder: '#ddd', hintText: '#666',
    },
    typography: { title2: {}, title3: {}, subheadline: {}, headline: {}, caption1: {}, callout: {}, footnote: {} },
    spacing: { sm: 4, base: 16, lg: 24 },
    radius: { md: 8, lg: 12 },
    shadow: { sm: {} },
    fontFamily: 'System',
  }),
}));

jest.mock('../../src/utils/point', () => ({
  convertVN2000ToWGS84: jest.fn(() => ({ latitude: 10.762622, longitude: 106.660172 })),
  proj4Dict: { 'EPSG:_TP-Hồ-Chí-Minh': 'some-proj-string' },
}));

jest.mock('../../src/utils/responsive', () => ({
  fontScale: (x: number) => x,
  moderateScale: (x: number) => x,
  verticalScale: (x: number) => x,
  wp: (x: number) => x,
  hp: (x: number) => x,
}));

jest.mock('../../src/utils/haptics', () => ({
  triggerLight: jest.fn(),
  triggerMedium: jest.fn(),
  triggerSuccess: jest.fn(),
  triggerWarning: jest.fn(),
}));

const mockShowRewardedAd = jest.fn();
jest.mock('../../src/hooks/useRewardedAd', () => ({
  useRewardedAd: () => ({
    showAd: mockShowRewardedAd,
    isLoaded: true,
  }),
}));

const mockShowInterstitialAd = jest.fn((cb?: () => void) => cb?.());
jest.mock('../../src/hooks/useInterstitialAd', () => ({
  useInterstitialAd: () => ({
    showAd: mockShowInterstitialAd,
    loaded: false,
  }),
}));

jest.mock('../../src/services/AdFreeService', () => ({
  __esModule: true,
  default: {
    isPremium: jest.fn(() => false),
    isAdSuppressed: jest.fn(() => false),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import AdFreeService from '../../src/services/AdFreeService';
import VN2000Screen from '../../src/screens/VN2000Screen';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;
const mockIsPremium = AdFreeService.isPremium as jest.Mock;

describe('VN2000Screen - Map View Limit Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPremium.mockReturnValue(false);
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  it('allows Premium users to view maps directly without count checks', async () => {
    mockIsPremium.mockReturnValue(true);

    const { getByText } = render(<VN2000Screen />);
    
    // Perform conversion to show the result card
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    expect(mockNavigate).toHaveBeenCalledWith('ConvertGoogle', {
      latitude: 10.762622,
      longitude: 106.660172,
    });
    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it('increments map view count for free users and permits view if < 5', async () => {
    const today = getTodayDateString();
    // Simulate user has clicked 2 times today
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 2, unlocked: false }));

    const { getByText } = render(<VN2000Screen />);
    
    // Perform conversion
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith(
        'vn2000_map_view_usage',
        JSON.stringify({ date: today, count: 3, unlocked: false })
      );
      expect(mockNavigate).toHaveBeenCalledWith('ConvertGoogle', {
        latitude: 10.762622,
        longitude: 106.660172,
      });
    });
  });

  it('bypasses checks if user has unlocked the screen for today', async () => {
    const today = getTodayDateString();
    // Simulate user already watched rewarded ad today on this screen
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 5, unlocked: true }));

    const { getByText } = render(<VN2000Screen />);
    
    // Perform conversion
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(mockSetItem).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('ConvertGoogle', {
        latitude: 10.762622,
        longitude: 106.660172,
      });
    });
  });

  it('prompts the user on the 6th view (when count >= 5)', async () => {
    const today = getTodayDateString();
    // Simulate user has clicked 5 times already
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 5, unlocked: false }));

    const { getByText } = render(<VN2000Screen />);
    
    // Perform conversion
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Giới hạn xem bản đồ',
        expect.any(String),
        expect.any(Array)
      );
    });
  });

  it('navigates to settings upgrade flow if "Mua bản Pro" is pressed', async () => {
    const today = getTodayDateString();
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 5, unlocked: false }));

    const { getByText } = render(<VN2000Screen />);
    
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    // Extract Alert configuration
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2];
    const buyButton = buttons.find((b: any) => b.text === 'Mua bản Pro');

    buyButton.onPress();

    expect(mockNavigate).toHaveBeenCalledWith('Cài đặt');
  });

  it('saves unlocked=true in storage and navigates to map on successful ad watch', async () => {
    const today = getTodayDateString();
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 5, unlocked: false }));

    const { getByText } = render(<VN2000Screen />);
    
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2];
    const adButton = buttons.find((b: any) => b.text === 'Xem quảng cáo');

    // Mock successful showAd completion
    mockShowRewardedAd.mockImplementationOnce((onSuccess, onCancel) => {
      onSuccess(true);
    });

    adButton.onPress();

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith(
        'vn2000_map_view_usage',
        JSON.stringify({ date: today, count: 5, unlocked: true })
      );
      expect(mockNavigate).toHaveBeenCalledWith('ConvertGoogle', {
        latitude: 10.762622,
        longitude: 106.660172,
      });
    });
  });

  it('does NOT save unlocked=true but still navigates to map if ad fails to show (error)', async () => {
    const today = getTodayDateString();
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 5, unlocked: false }));

    const { getByText } = render(<VN2000Screen />);
    
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2];
    const adButton = buttons.find((b: any) => b.text === 'Xem quảng cáo');

    // Mock failed showAd completion (success = false)
    mockShowRewardedAd.mockImplementationOnce((onSuccess, onCancel) => {
      onSuccess(false);
    });

    adButton.onPress();

    await waitFor(() => {
      // Should NOT setItem (since success was false)
      expect(mockSetItem).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('ConvertGoogle', {
        latitude: 10.762622,
        longitude: 106.660172,
      });
    });
  });

  it('stays on VN2000 screen and does not navigate if user cancels the ad prompt', async () => {
    const today = getTodayDateString();
    mockGetItem.mockResolvedValue(JSON.stringify({ date: today, count: 5, unlocked: false }));

    const { getByText } = render(<VN2000Screen />);
    
    fireEvent.press(getByText('Chuyển đổi sang WGS84'));

    await waitFor(() => {
      expect(getByText('Xem trên Maps')).toBeTruthy();
    });

    fireEvent.press(getByText('Xem trên Maps'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2];
    const cancelButton = buttons.find((b: any) => b.text === 'Hủy');

    cancelButton.onPress?.();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});
