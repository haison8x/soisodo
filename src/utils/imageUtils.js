import { nanoid } from 'nanoid';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Asset } from 'expo-asset';

export const pickImageAndSave = async () => {
    try {
        const showSourcePicker = () => {
            return new Promise((resolve) => {
                if (Platform.OS === 'ios') {
                    ActionSheetIOS.showActionSheetWithOptions(
                        {
                            options: ['Hủy', 'Chụp ảnh', 'Chọn từ thư viện'],
                            cancelButtonIndex: 0,
                        },
                        (buttonIndex) => {
                            if (buttonIndex === 1) resolve('camera');
                            if (buttonIndex === 2) resolve('library');
                            resolve(null);
                        }
                    );
                } else {
                    Alert.alert(
                        'Chọn nguồn ảnh',
                        '',
                        [
                            { text: 'Hủy', style: 'cancel', onPress: () => resolve(null) },
                            { text: 'Chụp ảnh', onPress: () => resolve('camera') },
                            { text: 'Thư viện', onPress: () => resolve('library') },
                        ]
                    );
                }
            });
        };

        const source = await showSourcePicker();
        if (!source) return null;

        let result;
        if (source === 'camera') {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Lỗi', 'Cần quyền truy cập máy ảnh để chụp hình');
                return null;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });
        } else {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Lỗi', 'Cần quyền truy cập thư viện để chọn hình');
                return null;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 1,
            });
        }

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedImage = result.assets[0];
            return selectedImage.uri;
        }
        return null;
    } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Lỗi', 'Không thể xử lý hình ảnh');
        return null;
    }
};

export const exrtactTextFromImage = async (imageUri) => {
    try {
        console.log('Loading image from URI:', imageUri);

        const result = await TextRecognition.recognize(imageUri);

        if (result && result.text) {
            const filteredLines = result.text.split('\n').map(line => {
                const matches = line.match(/[\d.,]+/g);
                if (!matches) return null;

                const validMatches = matches.filter(m => (m.match(/\d/g) || []).length >= 6);
                return validMatches.length > 0 ? validMatches.join(' ') : null;
            }).filter(line => line !== null);

            const filteredText = filteredLines.join('\n');
            return filteredText;
        } else {
            Alert.alert('Thông báo', 'Không tìm thấy chữ nào trong hình.');
            return '';
        }

    } catch (error) {
        console.error('OCR Error Detail:', error);

        let errorMsg = error.message;
        if (errorMsg.includes('undefined')) {
            errorMsg = 'Native Module chưa sẵn sàng. Bạn hãy chắc chắn đã build app bằng lệnh "npx expo run:android" và KHÔNG dùng Expo Go.';
        }

        Alert.alert('Lỗi OCR', errorMsg);
        return null;
    }
};

export const extractCoordinatesFromText = (text) => {
    if (!text) return [];

    return text.split('\n').map(line => {
        // Match numbers that can include a decimal point
        // This regex handles: 1234.56, 1234, .56 (optional)
        const matches = line.match(/\d+(\.\d+)?/g);

        if (matches && matches.length === 2) {
            return {
                id: nanoid(),
                x: matches[0],
                y: matches[1]
            };
        }
        return null;
    }).filter(coord => coord !== null);
};

export const extractCoordinatesFromImage = async (imageUri) => {
    const text = await exrtactTextFromImage(imageUri);
    return extractCoordinatesFromText(text);
};