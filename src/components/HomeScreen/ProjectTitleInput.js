import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProjectTitleInput = ({ value, onChangeText }) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.projectTitle}
                value={value}
                onChangeText={onChangeText}
                placeholder="Nhập tên dự án..."
                placeholderTextColor="#94A3B8"
            />
            <Ionicons name="pencil" size={16} color="#007AFF" style={styles.editIcon} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
        marginVertical: 15,
        paddingBottom: 5,
    },
    projectTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
        padding: 0, // Remove default padding to align with icon
    },
    editIcon: {
        marginLeft: 10,
        opacity: 0.7,
    }
});

export default ProjectTitleInput;
