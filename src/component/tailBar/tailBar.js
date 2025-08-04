import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert} from 'react-native';
import PostModal from './postModal.js'
import AsyncStorage from '@react-native-async-storage/async-storage';

const TailBar = ({ navigation }) => {
    const [postVisible, setPostVisible] = useState(false);

    const checkLoginStatus = async (callback) => {
        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert(
                    "請先登入",
                    "您尚未登入，請先登入以進行操作。",
                    [
                        {
                            text: "取消",
                            style: "cancel",
                        },
                        {
                            text: "確認",
                            onPress: () => navigation.navigate("Login"),
                        },
                    ],
                    { cancelable: true }
                );
                return false; // User is not logged in
            }
            callback(); // User is logged in, execute the callback
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    };

    const handleHomeButtonClick = () => {
        console.log("Home button clicked!");
        navigation.navigate('SearchSessions');
    };

    const handleCreateButtonClick = () => {
        console.log("創建 button clicked!");
        checkLoginStatus(() => setPostVisible(true));
    };

    const handleNotificationButtonClick = () => {
        console.log("Notification button clicked!");
        checkLoginStatus(() => navigation.navigate('Notification'));
    };

    const handleProfileButtonClick = () => {
        console.log("Profile button clicked!");
        checkLoginStatus(() => navigation.navigate('Profile'));
    };

    const handleCloseModal = () => {
        setPostVisible(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.tailBar}>
                {/* Home Button */}
                <TouchableOpacity style={styles.button} onPress={handleHomeButtonClick}>
                    <Image source={require('../../../assets/images/home-icon.png')} style={styles.icon} />
                    <Text style={styles.buttonText}>首頁</Text>
                </TouchableOpacity>

                {/* 創建 (Create) Button */}
                <TouchableOpacity style={styles.button} onPress={handleCreateButtonClick}>
                    <Image source={require('../../../assets/images/file_icon.png')} style={[styles.file_icon]} />
                    <Text style={[styles.buttonText, {marginTop: -15}]}>紀錄</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.centerButton} onPress={handleCreateButtonClick}>
                    <Text style={[styles.plustText]}>+</Text>
                </TouchableOpacity>

                {/* Notification Button */}
                <TouchableOpacity style={styles.button} onPress={handleNotificationButtonClick}>
                    <Image source={require('../../../assets/images/bell-icon.png')} style={[styles.icon, { opacity: 0.7 }]} />
                    <Text style={styles.buttonText}>通知</Text>
                </TouchableOpacity>

                {/* Profile Button */}
                <TouchableOpacity style={styles.button} onPress={handleProfileButtonClick}>
                    <Image source={require('../../../assets/images/user-icon.png')} style={styles.userIcon} />
                    <Text style={styles.buttonText}>我的</Text>
                </TouchableOpacity>
            </View>

            {/* ModifyEvent Modal */}
            <PostModal
                postVisible={postVisible}
                handleCloseModal={handleCloseModal}
                eventId={null} // Pass the event ID if editing an existing event
                initialData={null} // Pass initial data if editing, else keep as null for creating
            />
        </View>
    );
};

export default TailBar;

const styles = StyleSheet.create({
    tailBar: {
        height: 70,
        backgroundColor: "#ff7f50",
        borderTopWidth: 1,
        borderColor: "#f0f0f0",
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 40
    },
    button: {
        flex: 1,
        alignItems: 'center',
    },
    centerButton: {
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor: "#FFEED5",
        borderRadius: 10,
        height: 55,
        width: 55,
        marginBottom: 5,
        shadowRadius: 2,
        shadowColor: "black",
        shadowOpacity: 0.2,
        shadowOffset: 2,
        marginHorizontal: 10
    },
    plustText: {
        fontSize: 30,
        fontWeight: "bold"
    },
    buttonText: {
        color: 'black',
        fontSize: 10,
    },
    icon: {
        height: 30,
        width: 30,
    },
    file_icon: {
        height: 60,
        width: 60,
        marginTop: -15
    },
    centerIcon: {
        height: 40,
        width: 40,
    },
    userIcon: {
        opacity: 0.5,
        height: 25,
        width: 25,
        marginBottom: 5
    },
});
