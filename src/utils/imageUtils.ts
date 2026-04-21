import { nanoid } from 'nanoid/non-secure';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import type { Coordinate } from '../types';

type ImageSource = 'camera' | 'library';

export const pickImageAndSave = async (): Promise<string | null> => {
  try {
    const showSourcePicker = (): Promise<ImageSource | null> =>
      new Promise(resolve => {
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Hủy', 'Chụp ảnh', 'Chọn từ thư viện'], cancelButtonIndex: 0 },
            buttonIndex => {
              if (buttonIndex === 1) resolve('camera');
              else if (buttonIndex === 2) resolve('library');
              else resolve(null);
            },
          );
        } else {
          Alert.alert('Chọn nguồn ảnh', '', [
            { text: 'Hủy', style: 'cancel', onPress: () => resolve(null) },
            { text: 'Chụp ảnh', onPress: () => resolve('camera') },
            { text: 'Thư viện', onPress: () => resolve('library') },
          ]);
        }
      });

    const source = await showSourcePicker();
    if (!source) return null;

    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Lỗi', 'Cần quyền truy cập máy ảnh để chụp hình');
        return null;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện để chọn hình');
        return null;
      }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Lỗi', 'Không thể xử lý hình ảnh');
    return null;
  }
};

export const exrtactTextFromImage = async (imageUri: string): Promise<string | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (TextRecognition as any).recognize(imageUri);

    if (result?.text) {
      const filteredLines = (result.text as string)
        .split(/\s+/)
        .map((line: string) => {
          const matches = line.match(/[\d.,]+/g);
          if (!matches) return null;
          const validMatches = matches.filter(m => (m.match(/\d/g) ?? []).length >= 6);
          return validMatches.length > 0 ? validMatches.join(' ') : null;
        })
        .filter((line): line is string => line !== null);

      return filteredLines.join('\n');
    }

    Alert.alert('Thông báo', 'Không tìm thấy chữ nào trong hình.');
    return '';
  } catch (error) {
    console.error('OCR Error Detail:', error);
    let errorMsg = (error as Error).message;
    if (errorMsg.includes('undefined')) {
      errorMsg =
        'Native Module chưa sẵn sàng. Bạn hãy chắc chắn đã build app bằng lệnh "npx expo run:android" và KHÔNG dùng Expo Go.';
    }
    Alert.alert('Lỗi OCR', errorMsg);
    return null;
  }
};

export const extractCoordinatesFromText = (text: string): Coordinate[] => {
  if (!text) return [];

  return text
    .split('\n')
    .map(line => {
      const matches = line.match(/\d+(\.\d+)?/g);
      if (matches && matches.length === 2) {
        return { id: nanoid(), x: matches[0], y: matches[1] };
      }
      return null;
    })
    .filter((coord): coord is Coordinate => coord !== null);
};

export const extractCoordinatesFromImage = async (imageUri: string): Promise<Coordinate[]> => {
  const text = await exrtactTextFromImage(imageUri);
  return extractCoordinatesFromText(text ?? '');
};
