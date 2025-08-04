import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Alert 
} from 'react-native';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';

const BlockList = ({ navigation }) => {
    const [blockedUsers, setBlockedUsers] = useState([]);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const response = await makeAuthenticatedRequest("/users/blocked-list/", "GET");
            console.log(response);
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            setBlockedUsers(Array.isArray(data) ? data : data.blocked_users || []);
        } catch (error) {
            console.error("Error fetching blocked users:", error);
        }
    };

    const handleUnblockPress = (userId) => {
        Alert.alert(
            "確定要解除封鎖此用戶？",
            "",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "確認",
                    onPress: async () => {
                        try {
                            await makeAuthenticatedRequest(`/users/unblock/${userId}/`, "POST");
                            setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
                            Alert.alert("用戶已解除封鎖");
                        } catch (error) {
                            console.error("Error unblocking user:", error);
                            Alert.alert("解除封鎖失敗", "請再試一次。");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View>
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                </TouchableOpacity>
                <Text style={styles.header_text}>封鎖用戶</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {blockedUsers.map((user) => (
                    <View key={user.id} style={styles.userItem}>
                        <Text style={styles.userName}>{user.nickname}</Text>
                        <TouchableOpacity 
                            style={styles.unblockButton} 
                            onPress={() => handleUnblockPress(user.id)}
                        >
                            <Text style={styles.unblockButtonText}>解封</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
        
    );
};

export default BlockList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height: 50,
        backgroundColor: '#ff7f50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    header_text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 1,
    },
    icon_back: {
        height: 18,
        width: 18,
    },
    scrollContent: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userName: {
        fontSize: 16,
        color: '#333',
    },
    unblockButton: {
        backgroundColor: '#ff7f50',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    unblockButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
