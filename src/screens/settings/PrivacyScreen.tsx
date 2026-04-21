import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../../theme';
import ScreenHeader from '../../components/shared/ScreenHeader';

const PrivacyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Chính sách bảo mật" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.text}>
          <Text style={styles.bold}>1. Thu thập thông tin</Text>{'\n'}
          Chúng tôi cam kết không thu thập bất kỳ thông tin cá nhân hay dữ liệu người dùng nào khi
          bạn sử dụng ứng dụng.{'\n\n'}
          <Text style={styles.bold}>2. Sử dụng thông tin</Text>{'\n'}
          Vì không thu thập dữ liệu, chúng tôi cũng không sử dụng bất kỳ thông tin nào của bạn cho
          mục đích bên ngoài ứng dụng.{'\n\n'}
          <Text style={styles.bold}>3. Chia sẻ thông tin</Text>{'\n'}
          Chúng tôi không chia sẻ bất kỳ dữ liệu nào với bên thứ ba.{'\n\n'}
          <Text style={styles.bold}>4. Bảo mật dữ liệu</Text>{'\n'}
          Mọi thao tác tính toán tọa độ được thực hiện trực tiếp trên thiết bị của bạn.{'\n\n'}
          <Text style={styles.bold}>5. Quyền của người dùng</Text>{'\n'}
          Quyền riêng tư của bạn được bảo mật tuyệt đối vì ứng dụng hoạt động hoàn toàn ngoại
          tuyến với dữ liệu người dùng.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl },
  text: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  bold: { fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
});

export default PrivacyScreen;
