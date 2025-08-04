import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import TailBar from '../../component/tailBar/tailBar.js';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postRequest } from '../../component/Auth/network';
import { API_BASE_URL } from '../../../config.js';
import {jwtDecode} from 'jwt-decode';
import { Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ImageBackground } from 'react-native';


const Profile = ({navigation}) => {

    const userData = {
        username: "W. Aaron"
    };

    const [userInfo, setUserInfo] = useState({});

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const handleButtonPress = async () => {
        console.log("pressed");
    }

    const handleContactUsPress = async () => {
        const url = 'https://forms.gle/x7dw1SadSiuP8QTD8';
        
        // Check if the URL can be opened
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
            // Open the URL in the default browser
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    };

    const handleHostedHistoryPress = async () => {
        const hostedHistory = userInfo.hosted_events;
        navigation.navigate("HostedHistory", { hostedHistory: hostedHistory });
    }

    const handleSettingPress = async () => {
        const profile = userInfo;
        navigation.navigate("TestSetting", { profileInfo: userInfo });
    }

    const handleRegisteredHistoryPress = async () => {
        const registeredHistory = userInfo.registered_events;
        navigation.navigate("RegisterHistory", { registeredHistory: registeredHistory });
    }

    const handleBlockListPress = async () => {
        navigation.navigate("BlockList");
    }

    const handleVerifyingRegisterPress = async () => {
        const username = userInfo.username;
        const registeredHistory = userInfo.registered_events;
        const filtered = registeredHistory.filter((session) => {
            // Filter sessions where pending_registrations include the username
            const matchesPendingUser = session.pending_registrations.some(reg => reg.user === username);
    
            return matchesPendingUser;
        });
        console.log(filtered);
        navigation.navigate("VerifyingRegister", { filteredRegister: filtered });
    }

    const fetchProfile = async () => {
        try {
            setUserInfo(userData);
            // console.log(userData);
            const accessToken = await AsyncStorage.getItem('accessToken');
            const decodedToken = jwtDecode(accessToken);
            const userId = decodedToken.user_id;
            const response = await makeAuthenticatedRequest(`/users/api/profile/${userId}/`, 'get');
            const res = JSON.parse(response);
            console.log(res);
            setUserInfo(res);
        } catch (error) {
            navigation.navigate("Login");
            console.error('Error fetching registration status:', error);
        }
    }

    const handleLogoutPress = async () => {
        try {
            // Get the access and refresh tokens from AsyncStorage
            const accessToken = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', '您尚未登入');
                return;
            }
    
            // Send the tokens to the logout API
            const response = await postRequest(`${API_BASE_URL}/users/logout/`, {
                refresh: refreshToken,
            }, {'Content-Type': 'application/json'});
            
            const responseData = JSON.parse(response);
            
            if (responseData) {
                // Clear the tokens from AsyncStorage
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                
                Alert.alert('成功', '您已被登出');
                navigation.navigate('Login');  // Navigate to login or any other page
            }
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Logout Error', error.message);
        }
    };

    const handleDeleteAccountPress = () => {
        Alert.alert(
            '確認刪除',
            '一旦刪除帳號所有資料都會被刪除，確定要刪除嗎？',
            [
                {
                    text: '取消',
                    onPress: () => console.log('Delete Account Cancelled'),
                    style: 'cancel',
                },
                {
                    text: '確定',
                    onPress: () => deleteAccount(),
                    style: 'destructive', // Makes the button text red on iOS
                },
            ],
            { cancelable: false }
        );
    };

    const deleteAccount = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                Alert.alert('錯誤', '您尚未登入。');
                return;
            }

            // Make the DELETE request to delete the account
            const response = await makeAuthenticatedRequest(`/users/delete-account/`, 'delete');

            console.log('Delete Account Response:', response);

            // Assuming a successful deletion returns a success message
            Alert.alert('成功', '您的帳號已成功刪除。', [
                {
                    text: '確定',
                    onPress: async () => {
                        // Clear tokens and navigate to login
                        await AsyncStorage.removeItem('accessToken');
                        await AsyncStorage.removeItem('refreshToken');
                        navigation.navigate('Login');
                    }
                }
            ]);

        } catch (error) {
            console.error('Delete Account Error:', error);
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert('刪除失敗', error.response.data.error);
            } else {
                Alert.alert('刪除失敗', '帳號刪除失敗。請再試一次。');
            }
        }
    };
    

    return (
        <View style = {styles.main_container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            <ImageBackground source={require('../../../assets/images/default_profile_background.png')}style={styles.imageHolder}>
                <View style={styles.profileSquare}>
                    <Image style={styles.headshotImage} source={{uri: userInfo.profile_picture}}/>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleSettingPress}
                    >
                        <Image source={require('../../../assets/images/pen_icon.png')} style={styles.penIcon} />
                    </TouchableOpacity>
                    <Text style={styles.userNameText}>{userInfo.nickname || userData.nickname}</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.infoColumn}> 
                            <Text style={styles.featureTitle}>位置</Text>
                            <Text style={styles.featureText}>{userInfo.position || userData.position}</Text>
                        </View>
                        <View style={styles.infoColumn}> 
                            <Text style={styles.featureTitle}>等級</Text>
                            <Text style={styles.featureText}>{userInfo.skill_level || userData.skill_level}</Text>
                        </View>
                        <View style={styles.infoColumn}> 
                            <Text style={styles.featureTitle}>性別</Text>
                            <Text style={styles.featureText}>{userInfo.gender || userData.gender}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.contactContainer}>
                    <View style={styles.contactBox}>
                        <Text style={styles.contact}>Line ID</Text>
                    </View>
                    <View style={[styles.contactBox,  {backgroundColor: "gray", marginLeft: 15}]}>
                        <Text style={styles.contact}>Phone</Text>
                    </View>
                </View>
                {/* <Text style={styles.userNameText}>{userInfo.nickname || userData.nickname}</Text>
                    
                <View style={styles.infoRow}>
                    <Text style={styles.label}>排球位置: </Text>
                    <Text style={styles.userPositionText}>{userInfo.position || userData.position}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Text style={styles.label}>程度: </Text>
                    <Text style={styles.userIntroText}>{userInfo.skill_level || userData.skill_level}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>自介: </Text>
                    <Text style={styles.userIntroText}>{userInfo.intro || userData.intro}</Text>
                </View> */}
            </ImageBackground>
            <View style={styles.socialMedialContainer}>
                <BannerAd
                    unitId={Platform.OS === 'ios' ? 'ca-app-pub-3666579337584135/2764027659' : 'ca-app-pub-3666579337584135/5972861495'}  // Use TestIds.BANNER for testing purposes
                    size={BannerAdSize.BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,  // You can change this based on your needs
                    }}
                />
            </View>
            <ScrollView style={{marginBottom: 60}}>
                <View style = {styles.seperationBar}></View>
                <TouchableOpacity style = {styles.generalButton} onPress={handleRegisteredHistoryPress}>
                    <Text style={styles.buttonText}>報名紀錄</Text>
                    <Image source={require('../../../assets/images/arrow_pointing_right_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.generalButton} onPress={handleHostedHistoryPress}>
                    <Text style={styles.buttonText}>發起紀錄</Text>
                    <Image source={require('../../../assets/images/arrow_pointing_right_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.generalButton} onPress={handleVerifyingRegisterPress}>
                    <Text style={styles.buttonText}>審核中報名</Text>
                    <Image source={require('../../../assets/images/arrow_pointing_right_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.generalButton} onPress={handleBlockListPress}>
                    <Text style={styles.buttonText}>封鎖用戶</Text>
                    <Image source={require('../../../assets/images/arrow_pointing_right_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <View style = {styles.seperationBar}></View>
                <TouchableOpacity style = {styles.generalButton} onPress={() => navigation.navigate('NotificationSettings')}>
                    <Text style={styles.buttonText}>通知設定</Text>
                    <Image source={require('../../../assets/images/arrow_pointing_right_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.generalButton} 
                    onPress={handleContactUsPress}
                    accessibilityLabel="聯絡我們 Button"
                    accessibilityHint="Opens the contact us form"
                >
                    <Text style={styles.buttonText}>聯絡我們</Text>
                    <Image source={require('../../../assets/images/arrow_pointing_right_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <View style = {styles.seperationBar}></View>
                <TouchableOpacity style = {styles.signOutButton} onPress={handleLogoutPress}>
                    <Text style={styles.signOutText}>登出</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccountPress}>
                    <Text style={styles.deleteAccountText}>刪除帳號</Text>
                </TouchableOpacity>
            </ScrollView>
            
            <TailBar navigation={navigation}/>
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        backgroundColor: "white",
    },
    imageHolder: {
        backgroundColor: "#f0f0f0",
        height: 250,  // Adjust the height to move the profile picture up
        alignItems: "center", // Align items to the start (left)
        justifyContent: "center", // Justify content to the top
        paddingTop: 30,  // Adjust padding as needed
        paddingHorizontal: 20, // Add horizontal padding
    },
    profilePic: {
        height: 100,
        width: 100,
        borderRadius: 50,
        backgroundColor: "#cccccc",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#ff7f50",
    },
    profileSquare: {
        height: 120,
        width: 205,
        backgroundColor: "#FFBD5C",
        marginTop: 50,
        flexDirection: "column",
        alignItems: "center",
    },
    headshotImage: {
        height: 70,
        width: 70,
        borderRadius: 100,
        marginTop: -35
    },
    userNameText: {
        color: "black",
        fontWeight: "700",
        fontSize: 22,
        marginTop: 5
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        justifyContent: "space-between"
    },
    infoColumn: {
        flexDirection: "column",
        alignItems: "center",
        flex: 1
    },
    featureTitle: {
        fontSize: 10,
        color: "black",
        fontWeight: "600"
    },
    featureText: {
        fontSize: 13,
        color: "black",
        fontWeight: "600",
        marginTop: 5
    },
    contactContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },
    contactBox: {
        paddingVertical: 2,
        paddingHorizontal: 7,
        borderRadius: 5,
        backgroundColor: "#4bab74",
        marginLeft: 5 
    },
    contact: {
        fontSize: 14,
        color: "black",
    },
    editButton: {
        height: 14,
        width: 14,
        borderRadius: 100,
        backgroundColor: "#D9D9D9",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: -7,
        right: -7
    },
    penIcon: {
        height: 15,
        width: 15
    },

    label: {
        color: "#333333",
        fontWeight: "600",
        fontSize: 18,
        textAlignVertical: "center",
    },
    userPositionText: {
        color: "#666666",
        fontSize: 18,
        flexShrink: 1, // Allow text to wrap if necessary
        textAlignVertical: "center",
    },
    userIntroText: {
        color: "#555555",
        fontSize: 18,
        textAlignVertical: "center",
        flexShrink: 1, // Allow text to wrap
    },
    socialMedialContainer: {
        height: BannerAdSize.BANNER,
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "white"
    },
    seperationBar: {
        height: 15,
        backgroundColor: "lightgray"
    },
    generalButton: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 25
    },
    buttonText: {
        fontSize: 17,
        color: "#333",
    },
    icon: {
        height: 18,
        width: 18,
        position: "absolute",
        right: 20,
        zIndex: 1,
        opacity: 0.5
    },
    logo: {
        height: 100,
        width: 100,
        position: "absolute",
        right: 10,
        top: 0,
        zIndex: 1,
        opacity: 1
    },
    signOutText: {
        fontSize: 17,
        color: "red"
    },
    signOutButton: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    deleteAccountButton: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffe6e6", // Light red background for emphasis
    },
    deleteAccountText: {
        fontSize: 17,
        color: "red",
        fontWeight: "600",
    },
});