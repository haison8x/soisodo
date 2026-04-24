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
  InterstitialAd: { createForAdRequest: jest.fn(() => ({
    addAdEventListener: jest.fn(() => jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  })) },
  AdEventType: { LOADED: 'loaded', CLOSED: 'closed' },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({ navigate: jest.fn() }),
    useFocusEffect: (cb: () => (() => void) | void) => {
      // Simulate focus: run once on mount, like a real screen focus
      React.useEffect(cb, []);
    },
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
      separator: '#ccc', danger: '#f00', fillTertiary: '#eee',
    },
    typography: { title2: {}, subheadline: {}, headline: {}, caption1: {}, callout: {} },
    spacing: { sm: 4, base: 16 },
    radius: { md: 8, lg: 12 },
    shadow: { sm: {} },
    fontFamily: 'System',
  }),
}));

jest.mock('../../src/utils/point', () => ({
  toMapPoints: jest.fn(() => ({})),
}));

const mockShowRewardedAd = jest.fn();
jest.mock('../../src/hooks/useRewardedAd', () => ({
  useRewardedAd: () => ({
    showAd: mockShowRewardedAd,
    isLoaded: true,
  }),
}));

jest.mock('../../src/hooks/useInterstitialAd', () => ({
  useInterstitialAd: () => ({
    showAd: jest.fn((cb?: () => void) => cb?.()),
    loaded: false,
  }),
}));

jest.mock('../../src/services/AdFreeService', () => ({
  __esModule: true,
  default: {
    isAdSuppressed: jest.fn(() => false),
    getSodoLastPromptMs: jest.fn(() => Promise.resolve(0)),
    saveSodoLastPromptMs: jest.fn(() => Promise.resolve()),
    grantAdFree: jest.fn(() => Promise.resolve()),
    initialize: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import AdFreeService from '../../src/services/AdFreeService';
import SoDoScreen from '../../src/screens/SoDoScreen';
import { SODO_REWARDED_MIN_COUNT, SODO_REWARDED_THROTTLE_MS } from '../../src/constants/adUnits';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockIsAdSuppressed = AdFreeService.isAdSuppressed as jest.Mock;
const mockGetSodoLastPromptMs = AdFreeService.getSodoLastPromptMs as jest.Mock;
const mockSaveSodoLastPromptMs = AdFreeService.saveSodoLastPromptMs as jest.Mock;

const makeProjects = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    title: `Sổ đỏ ${i + 1}`,
    address: 'Hà Nội',
    city: 'Hà Nội',
    cityValue: 'hanoi',
    coordinates: [],
    createdAt: new Date().toISOString(),
  }));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAdSuppressed.mockReturnValue(false);
  mockGetSodoLastPromptMs.mockResolvedValue(0);
  mockSaveSodoLastPromptMs.mockResolvedValue(undefined);
  mockShowRewardedAd.mockReset();
});

describe('SoDoScreen — rewarded ad prompt', () => {
  it('does NOT show rewarded prompt when projects.length <= SODO_REWARDED_MIN_COUNT', async () => {
    const projects = makeProjects(SODO_REWARDED_MIN_COUNT); // exactly 10
    mockGetItem.mockResolvedValue(JSON.stringify(projects));

    render(<SoDoScreen />);

    // Wait for async operations
    await new Promise(r => setTimeout(r, 50));

    expect(mockShowRewardedAd).not.toHaveBeenCalled();
  });

  it('does NOT show rewarded prompt when AdFreeService.isAdSuppressed() is true', async () => {
    const projects = makeProjects(SODO_REWARDED_MIN_COUNT + 1); // 11
    mockGetItem.mockResolvedValue(JSON.stringify(projects));
    mockIsAdSuppressed.mockReturnValue(true);

    render(<SoDoScreen />);
    await new Promise(r => setTimeout(r, 50));

    expect(mockShowRewardedAd).not.toHaveBeenCalled();
  });

  it('does NOT show rewarded prompt when last prompt was within throttle window', async () => {
    const projects = makeProjects(SODO_REWARDED_MIN_COUNT + 1);
    mockGetItem.mockResolvedValue(JSON.stringify(projects));
    // Last prompt was 5 minutes ago (< 10 min throttle)
    mockGetSodoLastPromptMs.mockResolvedValue(Date.now() - SODO_REWARDED_THROTTLE_MS / 2);

    render(<SoDoScreen />);
    await new Promise(r => setTimeout(r, 50));

    expect(mockShowRewardedAd).not.toHaveBeenCalled();
  });

  it('shows rewarded prompt when > 10 sổ, not suppressed, and throttle expired', async () => {
    const projects = makeProjects(SODO_REWARDED_MIN_COUNT + 1); // 11
    mockGetItem.mockResolvedValue(JSON.stringify(projects));
    mockGetSodoLastPromptMs.mockResolvedValue(0); // never shown before

    render(<SoDoScreen />);
    await new Promise(r => setTimeout(r, 50));

    expect(mockSaveSodoLastPromptMs).toHaveBeenCalledTimes(1);
    expect(mockShowRewardedAd).toHaveBeenCalledTimes(1);
  });

  it('saves last prompt timestamp before showing ad', async () => {
    const projects = makeProjects(SODO_REWARDED_MIN_COUNT + 1);
    mockGetItem.mockResolvedValue(JSON.stringify(projects));

    render(<SoDoScreen />);
    await new Promise(r => setTimeout(r, 50));

    const saveCallOrder = mockSaveSodoLastPromptMs.mock.invocationCallOrder[0];
    const showCallOrder = mockShowRewardedAd.mock.invocationCallOrder[0];
    expect(saveCallOrder).toBeLessThan(showCallOrder);
  });
});
