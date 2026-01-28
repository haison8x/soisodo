import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, User, ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../utils/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';

const STORAGE_KEY = '@user_nickname';

const NAMES = ['Sói', 'Phượng Hoàng', 'Đại Bàng', 'Sư Tử', 'Gấu', 'Báo', 'Hổ', 'Rồng', 'Cá Voi', 'Đại Hải Âu'];
const ADJECTIVES = ['Ẩn Danh', 'Thông Thái', 'Nhanh Nhẹn', 'Dũng Cảm', 'Bí Ẩn', 'Hào Hiệp', 'Khám Phá', 'Kiên Cường'];

const generateNickname = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const rand = Math.floor(100 + Math.random() * 900);
    return `${adj} ${name} ${rand}`;
};

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        const initUser = async () => {
            try {
                let savedNickname = await AsyncStorage.getItem(STORAGE_KEY);
                if (!savedNickname) {
                    savedNickname = generateNickname();
                    await AsyncStorage.setItem(STORAGE_KEY, savedNickname);
                }
                setNickname(savedNickname);
            } catch (error) {
                console.error('Error loading nickname:', error);
                setNickname(generateNickname());
            }
        };

        initUser();
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'chat-messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            // Reverse to show latest at bottom
            setMessages(msgs.reverse());
            setLoading(false);
        }, (error) => {
            console.error('Snapshot error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (inputText.trim().length === 0) return;
        if (inputText.length > 200) {
            Alert.alert('Thông báo', 'Tin nhắn không được quá 200 ký tự');
            return;
        }

        setSending(true);
        try {
            await addDoc(collection(db, 'chat-messages'), {
                text: inputText.trim(),
                nickname: nickname,
                createdAt: serverTimestamp(),
            });
            setInputText('');
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMe = item.nickname === nickname;
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
                {!isMe && <Text style={styles.nicknameText}>{item.nickname}</Text>}
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                        {item.text}
                    </Text>
                </View>
                {item.createdAt && (
                    <Text style={styles.timeText}>
                        {new Date(item.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        <User size={20} color="#0084FF" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Phòng Chat Chung</Text>
                        <Text style={styles.headerSubtitle}>Bạn: {nickname}</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0084FF" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChangeText={setInputText}
                        maxLength={200}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E7F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1E21',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#65676B',
    },
    messageList: {
        padding: 15,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 15,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    nicknameText: {
        fontSize: 12,
        color: '#65676B',
        marginBottom: 4,
        marginLeft: 4,
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: '#0084FF',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#E4E6EB',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#FFF',
    },
    otherMessageText: {
        color: '#1C1E21',
    },
    timeText: {
        fontSize: 10,
        color: '#8E8E8E',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFF',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        marginBottom: 80,
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1C1E21',
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0084FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#B0D5FF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;

