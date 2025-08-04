import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    SafeAreaView, 
    TouchableOpacity, 
    Modal, 
    TextInput, 
    Alert, 
    ScrollView, 
    TouchableWithoutFeedback, 
    Image,
    Dimensions, 
    Keyboard,
    Platform,
    ActivityIndicator
} from 'react-native';
import TailBar from '../../component/tailBar/tailBar.js';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';
import ModifyEvent from './modifyEvent';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { API_BASE_URL } from '../../../config.js';
import { getRequest } from '../../component/Auth/network.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const CITY_TYPE_MAPPING = {
    'unspecified': '未填寫縣市',
    'taipei': '臺北市',
    'new_taipei': '新北市',
    'taoyuan': '桃園市',
    'taichung': '臺中市',
    'tainan': '臺南市',
    'kaohsiung': '高雄市',
    'keelung': '基隆市',
    'hsinchu_city': '新竹市',
    'hsinchu_county': '新竹縣',
    'miaoli': '苗栗縣',
    'changhua': '彰化縣',
    'nantou': '南投縣',
    'yunlin': '雲林縣',
    'chiayi_city': '嘉義市',
    'chiayi_county': '嘉義縣',
    'pingtung': '屏東縣',
    'yilan': '宜蘭縣',
    'hualien': '花蓮縣',
    'taitung': '臺東縣',
    'penghu': '澎湖縣',
    'kinmen': '金門縣',
    'lienchiang': '連江縣',
};

/**
 * CancelEventModal Component
 * Props:
 * - isVisible: Boolean to control modal visibility
 * - onCancel: Function to handle cancellation
 * - onConfirm: Function to handle confirmation with reason
 */
const CancelEventModal = ({ isVisible, onCancel, onConfirm }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim() === '') {
            Alert.alert('請輸入取消原因', '取消原因不應為空。');
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <View style={styles.alertBox}>
                    <Text style={styles.alertTitle}>取消場次</Text>
                    <Text style={styles.alertMessage}>確定要取消這個場次嗎?</Text>
                    <Text style={styles.alertMessage}>取消後將會通知已報名的所有使用者</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="請輸入取消原因"
                        value={reason}
                        onChangeText={setReason}
                        accessibilityLabel="Cancellation Reason Input"
                        accessibilityHint="Enter the reason for cancelling the event"
                        returnKeyType="done" // Add this line
                        onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.cancelModalButton]} 
                            onPress={() => {
                                onCancel();
                                setReason('');
                            }}
                            accessibilityLabel="Cancel Button"
                            accessibilityHint="Closes the cancellation modal without cancelling"
                        >
                            <Text style={styles.buttonText}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmModalButton]}
                            onPress={handleConfirm}
                            accessibilityLabel="Confirm Cancellation Button"
                            accessibilityHint="Confirms the cancellation of the event"
                        >
                            <Text style={[styles.buttonText, { color: 'white' }]}>確定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/**
 * KickUserModal Component
 * Props:
 * - isVisible: Boolean to control modal visibility
 * - onCancel: Function to handle cancellation
 * - onConfirm: Function to handle confirmation with reason
 */
const KickUserModal = ({ isVisible, onCancel, onConfirm }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim() === '') {
            Alert.alert('請輸入踢除原因', '踢除原因不應為空。');
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <View style={styles.alertBox}>
                    <Text style={styles.alertTitle}>踢除用戶</Text>
                    <Text style={styles.alertMessage}>確定要踢除這個用戶嗎?</Text>
                    <Text style={styles.alertMessage}>踢除後將會通知該用戶</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="請輸入踢除原因"
                        value={reason}
                        onChangeText={setReason}
                        accessibilityLabel="Kick Reason Input"
                        accessibilityHint="Enter the reason for kicking the user"
                        returnKeyType="done" // Add this line
                        onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.cancelModalButton]} 
                            onPress={() => {
                                onCancel();
                                setReason('');
                            }}
                            accessibilityLabel="Cancel Button"
                            accessibilityHint="Closes the kick user modal without kicking"
                        >
                            <Text style={styles.buttonText}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmModalButton]}
                            onPress={handleConfirm}
                            accessibilityLabel="Confirm Kick Button"
                            accessibilityHint="Confirms kicking the user"
                        >
                            <Text style={[styles.buttonText, { color: 'white' }]}>確定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const RegisterSessionPage = ({ route, navigation }) => {

    const NET_TYPE_MAPPING = {
        'beach_volleyball': '沙灘排球',
        'women_net_mixed': '女網混排',
        'women_net_women': '女網女排',
        'men_net_men': '男網男排',
        'men_net_mixed': '男網混排',
        'mixed_net': '人妖網',
    };

    const STATUS_MAPPING = {
        past: '已結束',
        open: '開放報名',
        playing: '進行中',
        waitlist: '候補中',
        canceled: '已取消',
      };

    const { id, status } = route.params;
    const [inputData, setInputData] = useState({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [isChangeModalVisible, setChangeModalVisible] = useState(false);
    const [people, setPeople] = useState(0);
    const [registrationStatus, setRegistrationStatus] = useState({});
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [registrationId, setRegistrationId] = useState();
    const [isModifyEventVisible, setModifyEventVisible] = useState(false);
    const [isOptionMenuVisible, setOptionMenuVisible] = useState(false);
    const [isCancelModalVisible, setCancelModalVisible] = useState(false);
    const [isKickModalVisible, setKickModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // New State Variables for Notes
    const [registrationNotes, setRegistrationNotes] = useState('');
    const [modificationNotes, setModificationNotes] = useState('');

    useEffect(() => {
        fetchEventDetail();
        checkRegistration();
    }, [id]);

    const checkLogin = async (callback) => {
        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert(
                    "請先登入",
                    "您尚未登入，請先登入以進行操作。",
                    [
                        {
                            text: "取消",
                            style: "cancel"
                        },
                        {
                            text: "確認",
                            onPress: () => navigation.navigate("Login")
                        }
                    ],
                    { cancelable: true }
                );
                return;
            }
            // If the user is logged in, proceed with the provided callback function
            callback();
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    };

    const fetchEventDetail = async () => {
        try {
            const access = await AsyncStorage.getItem("accessToken");
            if (access) {
                const response = await makeAuthenticatedRequest(`/api/event_detail/${id}/`);
                const eventDetail = JSON.parse(response);
                console.log(eventDetail);
                setInputData(eventDetail);
                setPending(eventDetail.pending_registrations);
                setApproved(eventDetail.approved_registrations);
            }
            else {
                const response = await getRequest(`${API_BASE_URL}/api/event_detail/${id}/`, {
                    "Content-Type":"application/json",
                    "Accept": "application/json"});
                const eventDetail = JSON.parse(response);
                console.log(eventDetail);
                setInputData(eventDetail);
                setPending(eventDetail.pending_registrations);
                setApproved(eventDetail.approved_registrations);
            }
            
            
        } catch (error) {
            navigation.navigate("Login");
            console.error('Error fetching events detail:', error);
            Alert.alert('錯誤', '無法獲取場次詳細資訊，請重開App重試。');
        }
    };

    const handleCancleEvent = () => {
        setCancelModalVisible(true);
    };

    const handleConfirmCancel = async (reason) => {
        setCancelModalVisible(false);
        console.log(reason);
        try {
            const response = await makeAuthenticatedRequest(`/events/cancel/${id}/`, 'post', { cancellation_message: reason });
            console.log("Event cancelled:", response);
            Alert.alert('成功', '場次已取消。');
            fetchEventDetail();
        } catch (error) {
            console.error('Error cancelling event:', error);
            Alert.alert('錯誤', '取消場次失敗，請再試一次。');
        }
    };

    const handleKickPressed = (userId) => {
        setSelectedUserId(userId);
        setKickModalVisible(true);
    };

    const handleConfirmKick = async (reason) => {
        setKickModalVisible(false);
        console.log(reason);
        try {
            const response = await makeAuthenticatedRequest(`/events/${id}/remove_user/${selectedUserId}/`, 'post', { message: reason });
            console.log("User kicked:", response);
            Alert.alert('成功', '用戶已被踢除。');
            fetchEventDetail();
        } catch (error) {
            console.error('Error kicking user:', error);
            Alert.alert('錯誤', '踢除用戶失敗，請再試一次。');
        }
    };

    const checkRegistration = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/api/check_registration/${id}`, 'get');
            const res = JSON.parse(response);
            setRegistrationStatus(res);
            console.log(res);
        } catch (error) {
            console.error('Error fetching registration status:', error);
        }
    };

    const handleRegister = async () => {
        checkLogin(async () => {
            if (people <= 0) {
                Alert.alert('錯誤', '報名人數必須大於0。');
                return;
            }
    
            try {
                const payload = { number_of_people: people };
                if (registrationNotes.trim() !== '') {
                    payload.notes = registrationNotes.trim();
                }
    
                const response = await makeAuthenticatedRequest(`/api/register/${id}/`, 'post', payload);
                checkRegistration();
                fetchEventDetail();
                Alert.alert('成功', "您已被加入審核名單中。\n請注意您必須被創辦者審核過才算成功報名！");
            } catch (error) {
                console.error('Error during registration:', error);
                if (error.response && error.response.data && error.response.data.error) {
                    Alert.alert('錯誤', error.response.data.error);
                } else {
                    Alert.alert('錯誤', '無法報名這麼多人。');
                }
            } finally {
                setModalVisible(false);
                setPeople(0);
                setRegistrationNotes(''); // Reset notes after submission
            }
        });
    };

    const findUserRegistrationId = async (pendingList, approvedList) => {
        try {
            for (let registration of [...pendingList, ...approvedList]) {
                const response = await makeAuthenticatedRequest(`/verify_registration/${registration.id}/`, 'get');
                const res = JSON.parse(response);
                console.log(res);
                if (res.is_user_registration) {
                    console.log(registration.id);
                    setRegistrationId(registration.id);
                    setPeople(registration.number_of_people);
                    // Assuming 'notes' is part of the registration object
                    setModificationNotes(registration.notes || '');
                    break;
                }
            }
        } catch (error) {
            console.error('Error verifying registration:', error);
            Alert.alert('錯誤', '驗證報名失敗。');
        }
    };


    const handleModifyPeople = async () => {
        if (people <= 0) {
            Alert.alert('錯誤', '報名人數必須大於0。');
            return;
        }

        try {
            // Prepare the payload
            const payload = { number_of_people: people };
            if (modificationNotes.trim() !== '') {
                payload.notes = modificationNotes.trim();
            }

            const response = await makeAuthenticatedRequest(`/api/edit_registration/${registrationId}/`, 'put', payload);
            checkRegistration();
            fetchEventDetail();
            Alert.alert('成功', '報名人數已更新。');
        } catch (error) {
            console.error('Error during registration modification:', error);
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert('錯誤', error.response.data.error);
            } else {
                Alert.alert('錯誤', '報名人數過多！');
            }
        } finally {
            setChangeModalVisible(false);
            setModificationNotes(''); // Reset notes after submission
        }
    };

    const confirmUnregister = () => {
        Alert.alert(
            '確定要取消報名嗎？', // Alert title
            '', // Optional message
            [
                {
                    text: '取消',
                    style: 'cancel',
                    onPress: () => {
                        // Optional: Handle cancel action if needed
                        console.log('User canceled the unregistration.');
                    },
                },
                {
                    text: '確認',
                    style: 'destructive', // This styles the button in red
                    onPress: () => {
                        handleUnregister(); // Call the unregister function
                    },
                },
            ],
            { cancelable: true } // Allows the user to dismiss the alert by tapping outside
        );
    };

    const handleUnregister = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/api/unregister/${id}/`, 'post');
            const res = JSON.parse(response);
            setPeople(0);
            checkRegistration();
            fetchEventDetail();
            console.log("Response Data:", res);
            Alert.alert('成功', '您已取消報名。');
        } catch (error) {
            console.error('Error during unregistration:', error);
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert('錯誤', error.response.data.error);
            } else {
                Alert.alert('錯誤', '取消報名失敗，請再試一次。');
            }
        } finally {
            setModalVisible(false);
        }
    };

    const handlePeopleChange = (text) => {
        const peopleCount = parseInt(text, 10);
        console.log("People Count:", peopleCount);
        if (!isNaN(peopleCount)) {
            setPeople(peopleCount);
        } else {
            setPeople(0);
        }
    }

    const handleVerifyPendingPressed = async (userId) => {
        try {
            const response = await makeAuthenticatedRequest(`/api/approve/${userId}/`, 'post');
            fetchEventDetail();
            Alert.alert('成功', '用戶已被審核通過。');
        } catch (error) {
            console.error('Error during verification:', error);
            Alert.alert('錯誤', '報名人數已滿');
        }
    };

    const handleModifyButtonPressed = async () => {
        await findUserRegistrationId(pending, approved);
        setChangeModalVisible(true);
    };

    const chatButtonPressed = () => {
        checkLogin(() => {
            console.log(id);
            navigation.navigate("ChatRoom", { id: id, room_name: inputData.name });
        });
    };

    const handleProfilePressed = (user_id) => {
        checkLogin(() => {
            navigation.navigate('GeneralProfile', { userId: user_id });
        });
    }

    const toggleModifyEventModal = () => {
        setModifyEventVisible(!isModifyEventVisible);
    };

    const toggleOptionMenu = () => {
        setOptionMenuVisible(!isOptionMenuVisible);
    };

    const handleOptionSelect = (option) => {
        if (option === 'edit') {
            toggleModifyEventModal();
        }
        setOptionMenuVisible(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            <View style={{ zIndex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.goBackButton}
                        onPress={() => navigation.navigate("SearchSessions")}
                        accessibilityLabel="Go Back"
                        accessibilityHint="Navigates to the search sessions screen"
                    >
                        <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                    </TouchableOpacity>
                    <Text style={styles.header_text}>場次說明</Text>
                    <View style={styles.headerIcons}>
                        {inputData.is_creator ? (
                            <>
                                <TouchableOpacity 
                                    style={styles.iconButton} 
                                    onPress={chatButtonPressed}
                                    accessibilityLabel="Chat Button"
                                    accessibilityHint="Opens the chat room"
                                >
                                    <Image 
                                        source={require('../../../assets/images/chatbox_icon.png')} 
                                        style={styles.chatIcon} 
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.iconButton, { marginLeft: 10 }]} 
                                    onPress={toggleOptionMenu}
                                    accessibilityLabel="Options Button"
                                    accessibilityHint="Opens the options menu"
                                >
                                    <Image 
                                        source={require('../../../assets/images/three_dots_icon.png')} 
                                        style={styles.threeDotsIcon} 
                                    />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity 
                                style={styles.iconButton} 
                                onPress={chatButtonPressed}
                                accessibilityLabel="Chat Button"
                                accessibilityHint="Opens the chat room"
                            >
                                <Image 
                                    source={require('../../../assets/images/chatbox_icon.png')} 
                                    style={styles.chatIcon} 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {isOptionMenuVisible && (
                    <TouchableWithoutFeedback onPress={() => setOptionMenuVisible(false)}>
                        <View style={styles.optionMenuOverlay}>
                            <View style={styles.optionMenu}>
                                <TouchableOpacity 
                                    style={styles.optionItem} 
                                    onPress={() => {
                                        handleOptionSelect('edit');
                                        setTimeout(() => setOptionMenuVisible(false), 200);
                                    }}
                                    accessibilityLabel="Edit Session Option"
                                    accessibilityHint="Opens the edit session modal"
                                >
                                    <Text style={styles.optionText}>編輯場次</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.optionItem} 
                                    onPress={() => {
                                        handleCancleEvent();
                                        setTimeout(() => setOptionMenuVisible(false), 200);
                                    }}
                                    accessibilityLabel="Cancel Session Option"
                                    accessibilityHint="Opens the cancel session modal"
                                >
                                    <Text style={[styles.optionText, { color: "red" }]}>取消場次</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
            <View style={styles.socialMedialContainer}>
                <BannerAd
                    unitId={Platform.OS === 'ios' ? 'ca-app-pub-3666579337584135/2764027659' : 'ca-app-pub-3666579337584135/5972861495'}  // Replace with your actual Ad Unit ID
                    size={BannerAdSize.BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,  // Change based on your needs
                    }}
                />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{inputData.name}</Text>
                
                {Object.keys(inputData).length === 0 ? (
                    <View style={styles.infoContainer}>
                        <ActivityIndicator size="small" color="#f0f0f0" />
                    </View>
                ) 
                :
                inputData.cancellation_message !== null ? (
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>取消原因:</Text>
                        <Text style={styles.infoText}>{inputData.cancellation_message}</Text>
                    </View>
                ) 
                : 
                (status === "past" ? (
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>已結束</Text>
                    </View>
                )
                : 
                (
                    <>
                        <TouchableOpacity 
                            style={[styles.infoContainer]}
                            onPress={() => handleProfilePressed(inputData.created_by_id)}
                        >
                            <Text style={styles.infoLabel}>創辦者:</Text>
                            <Text style={[styles.infoTextName]}>{inputData.created_by_nickname}</Text>
                            <Image 
                                source={require('../../../assets/images/three_dots_icon.png')} 
                                style={[styles.threeDotsIconVertical]} 
                            />
                            
                        </TouchableOpacity>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>狀態:</Text>
                            <Text style={styles.infoText}>{STATUS_MAPPING[status]}</Text>
                        </View>
                        <View style={styles.infoContainer} selectable={true}>
                            <Text style={styles.infoLabel}>地址:</Text>
                            <Text style={styles.infoText} selectable={true} selectionColor='orange' >{CITY_TYPE_MAPPING[inputData.city] || ""} {inputData.location}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>時段:</Text>
                            <Text style={styles.infoText}>{`${inputData.date} ${inputData.start_time.slice(0, 5)}-${inputData.is_overnight ? "（隔天）": ""}${inputData.end_time.slice(0, 5)}`}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>費用:</Text>
                            <Text style={styles.infoText}>${inputData.cost.slice(0, -3)}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>開放人數:</Text>
                            <Text style={styles.infoText}>{inputData.spots_left} 人</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>審核中人數:</Text>
                            <Text style={styles.infoText}>{inputData.pending_registration_count} 人</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>網子類型:</Text>
                            <Text style={styles.infoText}>{NET_TYPE_MAPPING[inputData.net_type] || inputData.net_type}</Text>
                        </View>
                        <View style={styles.infoContainer} selectable={true}>
                            <Text style={styles.infoLabel}>備註:</Text>
                            <Text style={styles.infoText} selectable={true} selectionColor='orange'>{inputData.additional_comments}</Text>
                        </View>

                        {inputData.is_creator ? (
                            <View>
                                <View style={styles.pendingBar}>
                                    <Text style={styles.pendingLabel}>
                                        未審核報名
                                    </Text>
                                    <View style={styles.circle} />
                                    <Text style={styles.smallText}>
                                        曾經審核過的用戶
                                    </Text>
                                </View>
                                {pending.map((pendingUser, index) => (
                                    <View key={index} style={styles.pendingUserContainer}>
                                        {pendingUser.previously_approved ? <View style={styles.circle} /> : <View style={[styles.circle, { backgroundColor: "white" }]} />}
                                        <View style={styles.userInfoContainer}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{marginBottom: 7}}>
                                                        <Text style={styles.notesText}>{pendingUser.created_at}</Text>
                                                    </View>
                                                <TouchableOpacity 
                                                    onPress={() => handleProfilePressed(pendingUser.user_id)}
                                                    accessibilityLabel={`Navigate to ${pendingUser.user_nickname}'s profile`}
                                                    accessibilityHint="Opens the user's general profile"
                                                    style={{flexDirection:"row", alignItems:"center"}}
                                                >
                                                    
                                                    <Text style={[styles.pendingUserText, styles.pendingUserName]}>{pendingUser.user_nickname}</Text>
                                                    <Image 
                                                        source={require('../../../assets/images/three_dots_icon.png')} 
                                                        style={styles.threeDotsIconVertical} 
                                                    />
                                                </TouchableOpacity>
                                                {pendingUser.notes && (
                                                    <View style={styles.notesTag}>
                                                        <Text style={styles.notesText}>{pendingUser.notes}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={[styles.genderTag, pendingUser.user_gender === '男' ? styles.genderTagMale : pendingUser.user_gender === '女' ? styles.genderTagFemale : styles.genderTagUndisclosed]}>
                                                <Text style={styles.genderTagText}>{pendingUser.user_gender}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.pendingUserText, styles.pendingUserCount]}>{pendingUser.number_of_people}人</Text>
                                        <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerifyPendingPressed(pendingUser.id)}>
                                            <Text style={styles.verifyButtonText}>審核</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View>
                                <View style={styles.pendingBar}>
                                    <Text style={styles.pendingLabel}>
                                        未審核報名
                                    </Text>
                                    <View style={styles.circle} />
                                    <Text style={styles.smallText}>
                                        曾經審核過的用戶
                                    </Text>
                                </View>
                                {pending.map((pendingUser, index) => (
                                    <View key={index} style={styles.pendingUserContainer}>
                                        {pendingUser.previously_approved ? <View style={styles.circle} /> : <View style={[styles.circle, { backgroundColor: "white" }]} />}
                                        <View style={styles.userInfoContainer}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{marginBottom: 7}}>
                                                        <Text style={styles.notesText}>{pendingUser.created_at}</Text>
                                                    </View>
                                                <TouchableOpacity 
                                                    onPress={() => handleProfilePressed(pendingUser.user_id)}
                                                    accessibilityLabel={`Navigate to ${pendingUser.user_nickname}'s profile`}
                                                    accessibilityHint="Opens the user's general profile"
                                                    style={{flexDirection:"row", alignItems: "center"}}
                                                >
                                                    
                                                    <Text style={[styles.pendingUserText, styles.pendingUserName]}>{pendingUser.user_nickname}</Text>
                                                    <Image 
                                                        source={require('../../../assets/images/three_dots_icon.png')} 
                                                        style={styles.threeDotsIconVertical} 
                                                    />
                                                </TouchableOpacity>
                                                {pendingUser.notes && (
                                                    <View style={styles.notesTag}>
                                                        <Text style={styles.notesText}>{pendingUser.notes}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={[styles.genderTag, pendingUser.user_gender === '男' ? styles.genderTagMale : pendingUser.user_gender === '女' ? styles.genderTagFemale : styles.genderTagUndisclosed]}>
                                                <Text style={styles.genderTagText}>{pendingUser.user_gender}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.pendingUserText, styles.pendingUserCount]}>{pendingUser.number_of_people}人</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.pendingBar}>
                            <Text style={styles.pendingLabel}>
                                已審核報名
                            </Text>
                        </View>
                        {approved.map((approvedUser, index) => (
                            <View key={index} style={styles.pendingUserContainer}>
                                <View style={[styles.circle, { backgroundColor: "white" }]} />
                                <View style={styles.userInfoContainer}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{marginBottom: 7}}>
                                            <Text style={styles.notesText}>{approvedUser.created_at}</Text>
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => handleProfilePressed(approvedUser.user_id)}
                                            accessibilityLabel={`Navigate to ${approvedUser.user_nickname}'s profile`}
                                            accessibilityHint="Opens the user's general profile"
                                            style = {{flexDirection: "row", alignItems:"center"}}
                                        >
                                            
                                            <Text style={[styles.pendingUserText, styles.pendingUserName, {paddingLeft: 0}]}>{approvedUser.user_nickname}</Text>
                                            <Image 
                                                source={require('../../../assets/images/three_dots_icon.png')} 
                                                style={styles.threeDotsIconVertical} 
                                            />
                                        </TouchableOpacity>
                                        {approvedUser.notes && (
                                            <View style={styles.notesTag}>
                                                <Text style={styles.notesText}>{approvedUser.notes}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[styles.genderTag, approvedUser.user_gender === '男' ? styles.genderTagMale : approvedUser.user_gender === '女' ? styles.genderTagFemale : styles.genderTagUndisclosed]}>
                                        <Text style={styles.genderTagText}>{approvedUser.user_gender}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.pendingUserText, styles.pendingUserCount]}>{approvedUser.number_of_people}人</Text>
                                {inputData.is_creator && (
                                    <TouchableOpacity style={styles.kickButton} onPress={() => handleKickPressed(approvedUser.user_id)}>
                                        <Text style={styles.verifyButtonText}>踢除</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </>
                ))}
            </ScrollView>

            {inputData.cancellation_message === null && (
                <View style={styles.registerButtonContainer}>
                    {registrationStatus.registered  && status !== "past" && !inputData.is_creator ? (
                        <View style={styles.horizontalButtonContainer}>
                            <TouchableOpacity style={[styles.registerButton, styles.changeButton]} onPress={() => handleModifyButtonPressed()}>
                                <Text style={styles.registerButtonText}>更改人數</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.registerButton, styles.unregisterButton]} onPress={confirmUnregister}>
                                <Text style={styles.registerButtonText}>取消報名</Text>
                            </TouchableOpacity>
                        </View>
                    ) : 
                    (status !== "past" && !inputData.is_creator ?
                    (
                        <TouchableOpacity style={styles.registerButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.registerButtonText}>報名</Text>
                        </TouchableOpacity>
                    ):
                    <View />
                    )
                    }
                    
                </View>
            )}

            {/* Registration Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>填寫報名資料</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="報名人數"
                            placeholderTextColor={"gray"}
                            value={people.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) => handlePeopleChange(text)}
                            accessibilityLabel="Number of People Input"
                            accessibilityHint="Enter the number of people for registration"
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        {/* New Optional Notes Input Field */}
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Ex. 3男2女 (選填）"
                            placeholderTextColor={"gray"}
                            value={registrationNotes}
                            onChangeText={setRegistrationNotes}
                            accessibilityLabel="Notes Input"
                            accessibilityHint="Enter optional notes for registration"
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelModalButton]} 
                                onPress={() => {
                                    setModalVisible(false);
                                    setPeople(0);
                                    setRegistrationNotes('');
                                }}
                                accessibilityLabel="Cancel Registration Button"
                                accessibilityHint="Closes the registration modal without submitting"
                            >
                                <Text style={styles.modalButtonText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.confirmModalButton]} 
                                onPress={handleRegister}
                                accessibilityLabel="Confirm Registration Button"
                                accessibilityHint="Submits the registration"
                            >
                                <Text style={styles.modalButtonText}>提交</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modify Registration Modal */}
            <Modal
                visible={isChangeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setChangeModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, {marginBottom: 10}]}>更改報名人數</Text>
                        <Text style={{
                            fontSize:   13,
                            marginBottom: 20,
                        }}>如新人數大於原先報名人數將會被重新審核</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="報名人數"
                            value={people.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) => handlePeopleChange(text)}
                            accessibilityLabel="Modify Number of People Input"
                            accessibilityHint="Enter the new number of people for registration"
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        {/* New Optional Notes Input Field */}
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="備註 (可選)"
                            value={modificationNotes}
                            onChangeText={setModificationNotes}
                            accessibilityLabel="Modify Notes Input"
                            accessibilityHint="Enter optional notes for modification"
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelModalButton]} 
                                onPress={() => {
                                    setChangeModalVisible(false);
                                    setPeople(0);
                                    setModificationNotes('');
                                }}
                                accessibilityLabel="Cancel Modification Button"
                                accessibilityHint="Closes the modification modal without submitting"
                            >
                                <Text style={styles.modalButtonText}>取消</Text>
                            </TouchableOpacity>    
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.confirmModalButton]} 
                                onPress={handleModifyPeople}
                                accessibilityLabel="Confirm Modification Button"
                                accessibilityHint="Submits the registration modification"
                            >
                                <Text style={styles.modalButtonText}>提交</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ModifyEvent
                postVisible={isModifyEventVisible}
                handleCloseModal={toggleModifyEventModal}
                eventId={id}
                initialData={inputData}
                navigation={navigation}
            />

            {/* Use only one instance of each modal */}
            <CancelEventModal
                isVisible={isCancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                onConfirm={handleConfirmCancel}
            />

            <KickUserModal
                isVisible={isKickModalVisible}
                onCancel={() => setKickModalVisible(false)}
                onConfirm={handleConfirmKick}
            />

            {/* TailBar */}
            {!isModifyEventVisible && <TailBar navigation={navigation} />}
        </View>
    );

};

const styles = StyleSheet.create({
    icon_back: {
        height: 18,
        width: 18,
        position: "absolute",
        left: 10,
        zIndex: 1,
        top: -5
    },
    socialMedialContainer: {
        height: BannerAdSize.BANNER,
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "white"
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
        paddingRight: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,   
            
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        width: 95,
        paddingVertical: 3,
    },
    infoText: {
        fontSize: 16,
        color: "#555",
        width: 0.65 * screenWidth,
        
    },
    infoTextName: {
        fontSize: 16,
        color: "#555",
        
    },
    registerButtonContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        zIndex: 10
    },
    horizontalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    registerButton: {
        backgroundColor: "#ff7f50",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    registerButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    changeButton: {
        backgroundColor: "#f0ad4e",
    },
    unregisterButton: {
        backgroundColor: "#d9534f",
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: "#333",
        
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        backgroundColor: "#ff7f50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    cancelModalButton: {
        backgroundColor: '#ccc',
    },
    confirmModalButton: {
        backgroundColor: '#ff7f50',
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
    },
    pendingBar: {
        flexDirection: "row",
        alignItems: "center",
        height: 30,
        marginVertical: 5,
        borderBottomColor: "#f0f0f0",
        borderBottomWidth: 2
    },
    pendingLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        paddingRight: 15
    },
    pendingUserContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    pendingUserText: {
        fontSize: 16,
        color: "#333",
    },
    pendingUserName: {
        color: "#000",
    },
    pendingUserCount: {
        flex: 1,
        color: "#666",
        textAlign: 'right',
        paddingRight: 30,
    },    
    verifyButton: {
        backgroundColor: "#5cb85c",
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    kickButton: {
        backgroundColor: "red",
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    verifyButtonText: {
        color: "white",
        fontSize: 14,
    },
    circle: {
        height: 10,
        width: 10,
        borderRadius: 10,
        backgroundColor: "blue",
        marginRight: 5
    },
    smallText: {
        paddingLeft: 3,
        fontSize: 12,
    },
    header: {
        height: 40,
        backgroundColor: "#ff7f50",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    header_text: {
        fontSize: 20,
        fontWeight: "bold"
    },
    headerIcons: {
        position: "absolute",
        right: 10,
        top: 8,
        flexDirection: "row"
    },
    iconButton: {
        padding: 5,
    },
    optionMenu: {
        position: 'absolute',
        top: 45,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 20,
    },
    optionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionMenuOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    alertBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 20,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#ccc',
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#d9534f',
    },
    buttonText: {
        fontSize: 16,
    },
    chatIcon: {
        height: 30,
        width: 30,
        top: -5,
    },
    threeDotsIcon: {
        height: 20,
        width: 20,
    },
    threeDotsIconVertical: {
        height: 13,
        width: 13,
        opacity: 0.5,
        marginLeft: 10
    },
    genderTag: {
        marginLeft: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        alignSelf: 'center',
        
    },
    genderTagMale: {
        backgroundColor: '#007BFF', // Blue for 男
    },
    genderTagFemale: {
        backgroundColor: '#FF69B4', // Pink for 女
    },
    genderTagUndisclosed: {
        backgroundColor: '#808080', // Pink for 不透露
    },
    genderTagText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 3,
    },
    notesTag: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        marginTop: 4,
        alignSelf: 'flex-start',
        // width: "80%"
    },
    notesText: {
        color: '#555',
        fontSize: 12,
    },
});

export default RegisterSessionPage;
