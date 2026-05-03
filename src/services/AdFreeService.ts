import AsyncStorage from '@react-native-async-storage/async-storage';
import { AD_FREE_DURATION_MS } from '../constants/adUnits';

const PREMIUM_KEY = 'is_premium';
const AD_FREE_UNTIL_KEY = 'ad_free_until';
const SODO_LAST_PROMPT_KEY = 'sodo_rewarded_last_prompt';

let _isPremium = false;
let _adFreeUntil = 0;

const AdFreeService = {
  async initialize(): Promise<void> {
    try {
      const [premiumRaw, adFreeRaw] = await Promise.all([
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(AD_FREE_UNTIL_KEY),
      ]);
      _isPremium = premiumRaw === 'true';
      const parsed = Number(adFreeRaw);
      _adFreeUntil = isNaN(parsed) ? 0 : parsed;
    } catch {
      _isPremium = false;
      _adFreeUntil = 0;
    }
  },

  isPremium(): boolean {
    return true; // Hardcoded for testing
  },

  isAdFreePeriodActive(): boolean {
    return false;
  },

  isAdSuppressed(): boolean {
    return true; // Hardcoded for testing
  },

  getAdFreeRemainingMs(): number {
    if (_isPremium) return 0;
    const remaining = _adFreeUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  async grantAdFree(durationMs: number = AD_FREE_DURATION_MS): Promise<void> {
    if (_isPremium) return;
    const until = Date.now() + durationMs;
    _adFreeUntil = until;
    await AsyncStorage.setItem(AD_FREE_UNTIL_KEY, String(until));
  },

  async refreshFromStorage(): Promise<void> {
    await AdFreeService.initialize();
  },

  async getSodoLastPromptMs(): Promise<number> {
    try {
      const raw = await AsyncStorage.getItem(SODO_LAST_PROMPT_KEY);
      if (!raw) return 0;
      const parsed = Number(raw);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  },

  async saveSodoLastPromptMs(): Promise<void> {
    await AsyncStorage.setItem(SODO_LAST_PROMPT_KEY, String(Date.now()));
  },
};

export default AdFreeService;
