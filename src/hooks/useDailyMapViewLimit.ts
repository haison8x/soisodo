import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRewardedAd } from './useRewardedAd';
import { AD_UNITS } from '../constants/adUnits';
import AdFreeService from '../services/AdFreeService';

const STORAGE_KEY = 'map_view_usage';
const FREE_LIMIT = 5;

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useDailyMapViewLimit = () => {
  const navigation = useNavigation();
  const { showAd: showRewardedAd } = useRewardedAd(AD_UNITS.rewarded);

  const runWithLimit = async (onAllowed: () => void) => {
    if (AdFreeService.isPremium()) { onAllowed(); return; }

    try {
      const today = getTodayDateString();
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let usage = { date: today, count: 0 };

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.date === today) {
            usage = { date: today, count: typeof parsed.count === 'number' ? parsed.count : 0 };
          }
        } catch (e) {
          console.error('Error parsing map_view_usage', e);
        }
      }

      if (usage.count < FREE_LIMIT) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: usage.count + 1 }));
        onAllowed();
      } else {
        Alert.alert(
          'Giới hạn xem bản đồ',
          `Bạn đã dùng hết ${FREE_LIMIT} lượt xem bản đồ miễn phí hôm nay. Hãy nâng cấp Pro để xem không giới hạn hoặc xem quảng cáo ngắn để tiếp tục.`,
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mua bản Pro', onPress: () => navigation.navigate('Cài đặt' as never) },
            {
              text: 'Xem quảng cáo',
              onPress: () => showRewardedAd(
                () => onAllowed(),
                () => Alert.alert(
                  'Không thể xem quảng cáo',
                  'Bạn đã hết lượt xem quảng cáo hôm nay. Hãy thử lại vào ngày mai hoặc nâng cấp Pro để xem không giới hạn.',
                  [
                    { text: 'Đóng', style: 'cancel' },
                    { text: 'Mua bản Pro', onPress: () => navigation.navigate('Cài đặt' as never) },
                  ],
                ),
              ),
            },
          ],
        );
      }
    } catch (err) {
      console.error('Error checking map view limit:', err);
      onAllowed();
    }
  };

  return { runWithLimit };
};
