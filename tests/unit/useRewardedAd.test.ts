import { renderHook, act } from '@testing-library/react-native';

// Variables starting with 'mock' can be referenced inside jest.mock factory
const mockRewardedListeners: Record<string, Function> = {};
const mockRewardedAd = {
  addAdEventListener: jest.fn((event: string, handler: Function) => {
    mockRewardedListeners[event] = handler;
    return jest.fn(() => { delete mockRewardedListeners[event]; });
  }),
  load: jest.fn(),
  show: jest.fn(),
};

jest.mock('react-native-google-mobile-ads', () => ({
  RewardedAd: {
    createForAdRequest: jest.fn(() => mockRewardedAd),
  },
  RewardedAdEventType: { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' },
  AdEventType: { CLOSED: 'closed' },
  TestIds: { REWARDED: 'test-rewarded' },
}));

import { useRewardedAd } from '../../src/hooks/useRewardedAd';

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockRewardedListeners).forEach(k => delete mockRewardedListeners[k]);
  mockRewardedAd.addAdEventListener.mockImplementation((event: string, handler: Function) => {
    mockRewardedListeners[event] = handler;
    return jest.fn(() => { delete mockRewardedListeners[event]; });
  });
});

describe('useRewardedAd', () => {
  it('calls onDismissed immediately when ad is not loaded', () => {
    const { result } = renderHook(() => useRewardedAd('test-unit'));
    const onRewarded = jest.fn();
    const onDismissed = jest.fn();

    act(() => { result.current.showAd(onRewarded, onDismissed); });

    expect(onDismissed).toHaveBeenCalledTimes(1);
    expect(onRewarded).not.toHaveBeenCalled();
  });

  it('calls onRewarded when EARNED_REWARD fires before CLOSED', async () => {
    const { result } = renderHook(() => useRewardedAd('test-unit'));

    // Simulate ad loaded
    act(() => { mockRewardedListeners['loaded']?.(); });
    expect(result.current.isLoaded).toBe(true);

    const onRewarded = jest.fn();
    const onDismissed = jest.fn();
    act(() => { result.current.showAd(onRewarded, onDismissed); });

    // Simulate user earning reward then closing
    act(() => { mockRewardedListeners['earned_reward']?.({ type: 'coins', amount: 1 }); });
    act(() => { mockRewardedListeners['closed']?.(); });

    expect(onRewarded).toHaveBeenCalledTimes(1);
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('calls onDismissed when CLOSED fires without EARNED_REWARD', async () => {
    const { result } = renderHook(() => useRewardedAd('test-unit'));

    act(() => { mockRewardedListeners['loaded']?.(); });

    const onRewarded = jest.fn();
    const onDismissed = jest.fn();
    act(() => { result.current.showAd(onRewarded, onDismissed); });

    // Only CLOSED, no EARNED_REWARD
    act(() => { mockRewardedListeners['closed']?.(); });

    expect(onDismissed).toHaveBeenCalledTimes(1);
    expect(onRewarded).not.toHaveBeenCalled();
  });

  it('preloads next ad after close', async () => {
    renderHook(() => useRewardedAd('test-unit'));

    act(() => { mockRewardedListeners['loaded']?.(); });
    act(() => { mockRewardedListeners['closed']?.(); });

    // load() should have been called: once on init, once after close
    expect(mockRewardedAd.load).toHaveBeenCalledTimes(2);
  });

  it('isLoaded is false initially', () => {
    const { result } = renderHook(() => useRewardedAd('test-unit'));
    expect(result.current.isLoaded).toBe(false);
  });

  it('isLoaded becomes true after LOADED event', () => {
    const { result } = renderHook(() => useRewardedAd('test-unit'));
    act(() => { mockRewardedListeners['loaded']?.(); });
    expect(result.current.isLoaded).toBe(true);
  });
});
