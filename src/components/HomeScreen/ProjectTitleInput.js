import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const ProjectTitleInput = ({ value, onChangeText }) => {
    return (
        <TextInput
            style={styles.projectTitle}
            value={value}
            onChangeText={onChangeText}
        />
    );
};

const styles = StyleSheet.create({
    projectTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 15,
        color: '#1A1A1A',
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
        paddingBottom: 5,
    },
});

export default ProjectTitleInput;
