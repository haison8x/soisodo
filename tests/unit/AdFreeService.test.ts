import AsyncStorage from '@react-native-async-storage/async-storage';
import AdFreeService from '../../src/services/AdFreeService';
import { AD_FREE_DURATION_MS } from '../../src/constants/adUnits';

jest.mock('react-native-google-mobile-ads', () => ({
  TestIds: {
    BANNER: 'test-banner', APP_OPEN: 'test-app-open', REWARDED: 'test-rewarded',
    NATIVE: 'test-native', REWARDED_INTERSTITIAL: 'test-ri', INTERSTITIAL: 'test-interstitial',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
});

describe('AdFreeService.initialize()', () => {
  it('defaults to not premium and no ad-free period when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);
    await AdFreeService.initialize();
    expect(AdFreeService.isPremium()).toBe(false);
    expect(AdFreeService.isAdFreePeriodActive()).toBe(false);
    expect(AdFreeService.isAdSuppressed()).toBe(false);
  });

  it('sets isPremium = true when is_premium is "true" in storage', async () => {
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'is_premium' ? 'true' : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.isPremium()).toBe(true);
    expect(AdFreeService.isAdSuppressed()).toBe(true);
  });

  it('does not throw when AsyncStorage throws', async () => {
    mockGetItem.mockRejectedValue(new Error('storage error'));
    await expect(AdFreeService.initialize()).resolves.not.toThrow();
    expect(AdFreeService.isPremium()).toBe(false);
    expect(AdFreeService.isAdSuppressed()).toBe(false);
  });

  it('handles NaN ad_free_until gracefully', async () => {
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'ad_free_until' ? 'not-a-number' : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.isAdFreePeriodActive()).toBe(false);
  });
});

describe('AdFreeService.isAdFreePeriodActive()', () => {
  it('returns true when adFreeUntil is in the future', async () => {
    const future = Date.now() + 60_000;
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'ad_free_until' ? String(future) : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.isAdFreePeriodActive()).toBe(true);
  });

  it('returns false when adFreeUntil is in the past', async () => {
    const past = Date.now() - 60_000;
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'ad_free_until' ? String(past) : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.isAdFreePeriodActive()).toBe(false);
  });

  it('returns false when isPremium (premium overrides, period irrelevant)', async () => {
    const future = Date.now() + 60_000;
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'is_premium') return Promise.resolve('true');
      if (key === 'ad_free_until') return Promise.resolve(String(future));
      return Promise.resolve(null);
    });
    await AdFreeService.initialize();
    expect(AdFreeService.isAdFreePeriodActive()).toBe(false);
  });
});

describe('AdFreeService.isAdSuppressed()', () => {
  it('returns true when premium', async () => {
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'is_premium' ? 'true' : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.isAdSuppressed()).toBe(true);
  });

  it('returns true when ad-free period is active', async () => {
    const future = Date.now() + 60_000;
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'ad_free_until' ? String(future) : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.isAdSuppressed()).toBe(true);
  });

  it('returns false when neither premium nor active period', async () => {
    mockGetItem.mockResolvedValue(null);
    await AdFreeService.initialize();
    expect(AdFreeService.isAdSuppressed()).toBe(false);
  });
});

describe('AdFreeService.grantAdFree()', () => {
  it('sets adFreeUntil ~72h in the future and saves to AsyncStorage', async () => {
    mockGetItem.mockResolvedValue(null);
    await AdFreeService.initialize();

    const before = Date.now();
    await AdFreeService.grantAdFree();
    const after = Date.now();

    expect(mockSetItem).toHaveBeenCalledWith('ad_free_until', expect.any(String));
    const saved = Number(mockSetItem.mock.calls[0][1]);
    expect(saved).toBeGreaterThanOrEqual(before + AD_FREE_DURATION_MS);
    expect(saved).toBeLessThanOrEqual(after + AD_FREE_DURATION_MS);
    expect(AdFreeService.isAdFreePeriodActive()).toBe(true);
  });

  it('does NOT write to AsyncStorage when isPremium', async () => {
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'is_premium' ? 'true' : null),
    );
    await AdFreeService.initialize();
    await AdFreeService.grantAdFree();
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});

describe('AdFreeService.getAdFreeRemainingMs()', () => {
  it('returns positive ms when period active', async () => {
    const future = Date.now() + 60_000;
    mockGetItem.mockImplementation((key: string) =>
      Promise.resolve(key === 'ad_free_until' ? String(future) : null),
    );
    await AdFreeService.initialize();
    expect(AdFreeService.getAdFreeRemainingMs()).toBeGreaterThan(0);
  });

  it('returns 0 when no active period', async () => {
    mockGetItem.mockResolvedValue(null);
    await AdFreeService.initialize();
    expect(AdFreeService.getAdFreeRemainingMs()).toBe(0);
  });

  it('returns 0 when isPremium even if period would be active', async () => {
    const future = Date.now() + 60_000;
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'is_premium') return Promise.resolve('true');
      if (key === 'ad_free_until') return Promise.resolve(String(future));
      return Promise.resolve(null);
    });
    await AdFreeService.initialize();
    expect(AdFreeService.getAdFreeRemainingMs()).toBe(0);
  });
});

describe('AdFreeService.getSodoLastPromptMs() / saveSodoLastPromptMs()', () => {
  it('returns 0 when no record in storage', async () => {
    mockGetItem.mockResolvedValue(null);
    const result = await AdFreeService.getSodoLastPromptMs();
    expect(result).toBe(0);
  });

  it('returns stored timestamp', async () => {
    const ts = 1714000000000;
    mockGetItem.mockResolvedValue(String(ts));
    const result = await AdFreeService.getSodoLastPromptMs();
    expect(result).toBe(ts);
  });

  it('saves current timestamp to AsyncStorage', async () => {
    const before = Date.now();
    await AdFreeService.saveSodoLastPromptMs();
    const after = Date.now();
    expect(mockSetItem).toHaveBeenCalledWith('sodo_rewarded_last_prompt', expect.any(String));
    const saved = Number(mockSetItem.mock.calls[0][1]);
    expect(saved).toBeGreaterThanOrEqual(before);
    expect(saved).toBeLessThanOrEqual(after);
  });
});
