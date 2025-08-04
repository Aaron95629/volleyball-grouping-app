import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    SafeAreaView, 
    ScrollView, 
    ActivityIndicator, 
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert
} from 'react-native';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';
import TailBar from '../../component/tailBar/tailBar.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Keyboard } from 'react-native';

const GeneralProfile = ({ route, navigation }) => {
    const { userId } = route.params;
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportTitle, setReportTitle] = useState(''); // New state for report title
    const [loggedInUserId, setLoggedInUserId] = useState(null); // State for logged-in user ID

    useEffect(() => {
        fetchLoggedInUserId();
        fetchUserProfile();
    }, [userId]);

    const fetchLoggedInUserId = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const decodedToken = jwtDecode(accessToken);
            setLoggedInUserId(decodedToken.user_id);
        } catch (error) {
            console.error('Error fetching logged-in user ID:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/users/api/profile/${userId}/`, 'get');
            const profileData = typeof response === 'string' ? JSON.parse(response) : response;
            setUserInfo(profileData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setLoading(false);
        }
    };

    const handleReportPress = () => {
        setReportModalVisible(true);
    };

    const handleBlockPress = () => {
        Alert.alert(
            "確定要封鎖此用戶？",
            "",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "確定",
                    onPress: async () => {
                        try {
                            await makeAuthenticatedRequest(`/users/block/${userId}/`, 'POST');
                            Alert.alert("用戶已封鎖");
                        } catch (error) {
                            console.error("Error blocking user:", error);
                            Alert.alert("封鎖失敗", "請再試一次。");
                        }
                    },
                },
            ]
        );
    };

    const handleSubmitReport = async () => {
        if (reportTitle.trim() === '' || reportReason.trim() === '') {
            Alert.alert("請填寫標題和舉報原因", "舉報標題和原因不應為空。");
            return;
        }
        try {
            await makeAuthenticatedRequest(`/users/report/${userId}/`, 'POST', {
                title: reportTitle,
                content: reportReason,
            });
            Alert.alert("舉報已提交", "感謝您的回饋！");
            setReportModalVisible(false);
            setReportTitle('');
            setReportReason('');
        } catch (error) {
            console.error("Error submitting report:", error);
            Alert.alert("舉報失敗", "請再試一次。");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff7f50" />
            </View>
        );
    }

    return (
        <View style={styles.main_container}>
            <StatusBar />
            <SafeAreaView style={styles.safeArea}></SafeAreaView>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                </TouchableOpacity>
                <Text style={styles.header_text}>用戶資料</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {userInfo && (
                    <View style={styles.profileContainer}>
                        <Text style={styles.userNameText}>{`${userInfo.nickname}`}</Text>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>位置:</Text>
                            <Text style={styles.infoText}>{userInfo.position || "N/A"}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>自我介紹:</Text>
                            <Text style={styles.infoText}>{userInfo.intro || "N/A"}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>程度:</Text>
                            <Text style={styles.infoText}>{userInfo.skill_level || "N/A"}</Text>
                        </View>
                    </View>
                )}

                {loggedInUserId !== userId && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.reportButton} onPress={handleReportPress}>
                            <Text style={styles.buttonText}>舉報</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.blockButton} onPress={handleBlockPress}>
                            <Text style={styles.buttonText}>封鎖</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Report Modal */}
            <Modal
                visible={reportModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setReportModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>舉報</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="標題"
                            value={reportTitle}
                            onChangeText={setReportTitle}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="請輸入舉報原因"
                            value={reportReason}
                            onChangeText={setReportReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Enter') {
                                    Keyboard.dismiss();
                                }
                            }}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setReportModalVisible(false)}>
                                <Text style={styles.buttonText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleSubmitReport}>
                                <Text style={styles.buttonText}>送出</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TailBar navigation={navigation} />
        </View>
    );
};

export default GeneralProfile;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        backgroundColor: "white",
    },
    safeArea: {
        flex: 0,
        backgroundColor: "#ff7f50",
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
        color: 'black',
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 20,
    },
    icon_back: {
        height: 18,
        width: 18,
        position: "absolute",
        left: 10,
        zIndex: 1,
        top: -5
    },
    scrollContent: {
        padding: 20,
        alignItems: "center",
    },
    profileContainer: {
        width: '100%',
        alignItems: 'center',
    },
    userNameText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 25,
        marginBottom: 20,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        width: '100%',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
        width: 120,
        color: '#333',
    },
    infoText: {
        fontSize: 16,
        color: "#555",
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    reportButton: {
        backgroundColor: '#ff7f50',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    blockButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    textArea: {
        height: 100,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    submitButton: {
        backgroundColor: '#ff7f50',
    },
});
