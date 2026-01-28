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
            const extension = selectedImage.uri.split('.').pop();
            const fileName = `working.${extension}`;
            const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.copyAsync({
                from: selectedImage.uri,
                to: destinationUri,
            });

            console.log('Image saved to:', destinationUri);
            return destinationUri;
        }
        return null;
    } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Lỗi', 'Không thể xử lý hình ảnh');
        return null;
    }
};

export const exrtactTextFromImage = async () => {
    try {
        console.log('Starting OCR process...');

        // 1. Kiểm tra sự tồn tại của thư viện
        if (!TextRecognition) {
            throw new Error('Thư viện @react-native-ml-kit/text-recognition chưa được cài đặt hoặc chưa được link native.');
        }

        // 2. Load file từ assets
        const asset = Asset.fromModule(require('../../assets/SoDo.jpg'));
        if (!asset) {
            throw new Error('Không tìm thấy file SoDo.jpg trong thư mục assets.');
        }

        await asset.downloadAsync();
        const imageUri = asset.localUri || asset.uri;
        console.log('Loading image from URI:', imageUri);

        // 3. Thực hiện OCR
        const result = await TextRecognition.recognize(imageUri);

        console.log('OCR Success!');
        if (result && result.text) {
            Alert.alert('Kết quả OCR', result.text.substring(0, 500));
            return result.text;
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