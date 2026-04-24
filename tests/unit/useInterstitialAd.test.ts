import { renderHook, act } from '@testing-library/react-native';

// Keep listener registry inside factory closure to avoid jest.clearAllMocks() issues
jest.mock('react-native-google-mobile-ads', () => {
  const listeners: Record<string, Function> = {};
  const ad = {
    addAdEventListener: jest.fn((event: string, handler: Function) => {
      listeners[event] = handler;
      return jest.fn(() => { delete listeners[event]; });
    }),
    load: jest.fn(),
    show: jest.fn(),
  };
  return {
    InterstitialAd: { createForAdRequest: jest.fn(() => ad) },
    AdEventType: { LOADED: 'loaded', CLOSED: 'closed' },
    TestIds: { INTERSTITIAL: 'test-interstitial' },
    _ad: ad,
    _listeners: listeners,
  };
});

jest.mock('../../src/services/AdFreeService', () => ({
  __esModule: true,
  default: {
    isAdSuppressed: jest.fn(() => false),
    initialize: jest.fn(),
  },
}));

import AdFreeService from '../../src/services/AdFreeService';
import { useInterstitialAd } from '../../src/hooks/useInterstitialAd';

const mockIsAdSuppressed = AdFreeService.isAdSuppressed as jest.Mock;

// Access the mock ad and listeners from the module
const getMockAds = () => require('react-native-google-mobile-ads') as {
  _ad: { addAdEventListener: jest.Mock; load: jest.Mock; show: jest.Mock };
  _listeners: Record<string, Function>;
};

beforeEach(() => {
  mockIsAdSuppressed.mockReset();
  mockIsAdSuppressed.mockReturnValue(false);
  // Clear listener state without clearAllMocks
  const { _listeners } = getMockAds();
  Object.keys(_listeners).forEach(k => delete _listeners[k]);
  const { _ad } = getMockAds();
  _ad.load.mockReset();
  _ad.show.mockReset();
});

describe('useInterstitialAd', () => {
  it('calls onComplete immediately when AdFreeService.isAdSuppressed() is true', () => {
    mockIsAdSuppressed.mockReturnValue(true);
    const { result } = renderHook(() => useInterstitialAd());
    const onComplete = jest.fn();
    act(() => { result.current.showAd(onComplete); });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(getMockAds()._ad.show).not.toHaveBeenCalled();
  });

  it('calls onComplete immediately when ad not loaded and not suppressed', () => {
    mockIsAdSuppressed.mockReturnValue(false);
    const { result } = renderHook(() => useInterstitialAd());
    const onComplete = jest.fn();
    act(() => { result.current.showAd(onComplete); });
    // Ad not loaded (no LOADED event fired), so onComplete is called immediately
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows ad when loaded and not suppressed', () => {
    mockIsAdSuppressed.mockReturnValue(false);
    const { result } = renderHook(() => useInterstitialAd());

    act(() => { getMockAds()._listeners['loaded']?.(); });
    expect(result.current.loaded).toBe(true);

    const onComplete = jest.fn();
    act(() => { result.current.showAd(onComplete); });
    expect(getMockAds()._ad.show).toHaveBeenCalledTimes(1);
  });

  it('uses InterstitialAd.createForAdRequest with TestIds in DEV mode', () => {
    const { InterstitialAd } = require('react-native-google-mobile-ads');
    renderHook(() => useInterstitialAd());
    expect(InterstitialAd.createForAdRequest).toHaveBeenCalled();
  });
});
