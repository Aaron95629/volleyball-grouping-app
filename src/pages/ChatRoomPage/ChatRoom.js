import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    SafeAreaView, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    KeyboardAvoidingView,
    Platform, 
    Image,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatRoom = ({ route, navigation }) => {
    const { id, room_name } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [creatorId, setCreatorId] = useState();
    const [socket, setSocket] = useState(null);  // WebSocket instance stored in state
    const scrollViewRef = useRef();

    useEffect(() => {
        fetchCreator();
        openWebSocket();

        // Cleanup WebSocket on component unmount
        return () => {
            if (socket) {
                socket.send('closing due to unmount');
                socket.close();
            }
        };
    }, [id]);

    const openWebSocket = () => {
        const ws = new WebSocket(`wss://volleyball-app-aefac3e08718.herokuapp.com/ws/events/${id}/chat/`);
        setSocket(ws);  // Set the WebSocket in state

        console.log("WebSocket state (initial):", ws.readyState);

        // WebSocket event listeners
        ws.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });

        ws.addEventListener('message', (e) => {
            console.log('Message received:', e.data);
            const data = JSON.parse(e.data);
            const newMessage = {
                message: data.message,   // Extract the actual message content
                user_first_name: data.user_first_name,
                user_last_name: data.user_last_name,
                user_nickname: data.user_nickname,
                id: data.id,   // Extract the user ID of the message sender
                timestamp: data.timestamp,  // Extract the timestamp of the message
                user_id: data.user_id,
                user: data.user
            };

            // Update the messages state to add the new message
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            // Scroll to the bottom when a new message is received
            scrollViewRef.current?.scrollToEnd({ animated: true });
        });

        ws.addEventListener('close', (e) => {
            console.log('WebSocket connection closed', e);
        });

        ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    };

    const fetchCreator = async () => {
        try {
            const response_event = await makeAuthenticatedRequest(`/api/event_detail/${id}/`, 'get');
            const eventDetail = JSON.parse(response_event);
            console.log("User id", eventDetail.created_by_id);
            setCreatorId(eventDetail.created_by_id);
        } catch (error) {
            console.error('Error fetching creator:', error);
        }
    };

    const sendMessage = () => {
        if (inputMessage.trim() === '') return;

        console.log(socket.readyState);
        // Send the message over the WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messageData = {
                message: inputMessage
            };
            socket.send(JSON.stringify(messageData));
            setInputMessage('');  // Clear the input field after sending
        } else {
            console.error('WebSocket connection is not open');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        return `${hours}:${minutes} ${ampm}`;
    };

    // Handle navigation to user profile
    const handleUserPress = (userId) => {
        navigation.navigate('GeneralProfile', { userId });
    };

    return (
        <View style={styles.container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.navigate("RegisterSession", { id: id })}
                >
                    <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                </TouchableOpacity>
                <Text style={styles.header_text}>{`聊天室`}</Text>
            </View>
            
            {/* Main Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust based on your layout
            >
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <View style={styles.chatContainer}>
                        {/* Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={styles.messagesContainer}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                            keyboardShouldPersistTaps='handled'
                        >
                            {messages.map((message, index) => (
                                <View key={index} style={styles.messageWrapper}>
                                    <TouchableOpacity onPress={() => handleUserPress(message.user_id)}>
                                        {(creatorId === message.user_id) ? 
                                            (<Text style={styles.host}>{`${message.user_nickname} (創辦者)`}</Text>)
                                            :
                                            (<Text style={styles.username}>{`${message.user_nickname}`}</Text>)
                                        }
                                    </TouchableOpacity>
                                    <View style={[
                                        styles.messageContainer,
                                        message.user === 'user' ? styles.userMessage : styles.otherMessage
                                    ]}>
                                        <Text style={styles.messageText}>{message.message}</Text>
                                        
                                    </View>
                                    <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        
                        {/* Input Field */}
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Type a message..."
                                    value={inputMessage}
                                    onChangeText={setInputMessage}
                                    onSubmitEditing={sendMessage}
                                    returnKeyType="send"
                                />
                                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                                    <Image source={require('../../../assets/images/send_arrow.png')} style={{height: 20, width: 20}} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                {/* </TouchableWithoutFeedback> */}
            </KeyboardAvoidingView>
        </View>
    );

};

export default ChatRoom;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    icon_back: {
        height: 18,
        width: 18,
        position: "absolute",
        left: 10,
        zIndex: 1,
        top: -5
    },
    header: {
        height: 50,
        backgroundColor: "#ff7f50",
        flexDirection: "row",   
        alignItems: "center",
        justifyContent: "center",
        position: 'relative',
        paddingHorizontal: 10,
    },
    header_text: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: 'center',
        flex: 1,
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 20, // Ensure the button is above other elements
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        padding: 10,
        // Removed paddingBottom to eliminate potential gaps
        // paddingBottom: 60,
    },
    messageWrapper: {
        marginBottom: 15,
    },
    username: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007aff',
        marginBottom: 2,
    },
    host: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 2,
    },
    messageContainer: {
        maxWidth: '85%',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    userMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#ECECEC',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        color: '#888',
        marginTop: -10, // Ensure the timestamp has some space from the message
        // textAlign: 'right', // Align timestamp on the right for better visibility
        justifyContent: "flex-end",
        alignSelf: "flex-end"
    },
    inputWrapper: {
        // Removed paddingVertical to eliminate the gap
        paddingHorizontal: 10,
        paddingVertical: 0, // Changed from 10 to 0
        borderTopWidth:1,
        paddingBottom: 40,
        borderColor: '#ECECEC',
        backgroundColor: 'white',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex:1,
        padding: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#ff7f50',
        padding: 10,
        borderRadius: 20,
    },
});
