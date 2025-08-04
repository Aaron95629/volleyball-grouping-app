import React, { useState } from 'react';
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
    Image,
    Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth.js';

const Settings = ({ route, navigation }) => {
    const { profileInfo } = route.params;
    const [isNicknameModalVisible, setIsNicknameModalVisible] = useState(false);
    const [isPositionModalVisible, setIsPositionModalVisible] = useState(false);
    const [isIntroModalVisible, setIsIntroModalVisible] = useState(false);
    const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
    const [isSkillModalVisible, setIsSkillModalVisible] = useState(false);
    const [nickname, setNickname] = useState(profileInfo.nickname || '');
    const [position, setPosition] = useState(profileInfo.position || '');
    const [intro, setIntro] = useState(profileInfo.intro || '');
    const [gender, setGender] = useState(profileInfo.gender || '');
    const [skillLevel, setSkillLevel] = useState(profileInfo.skill_level || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateProfile = async (field) => {
        if (field === 'intro') {
            const wordCount = intro.trim().length;
            if (wordCount > 20) {
                Alert.alert('字數限制', '自我介紹最多20個字。');
                return;
            }
        }

        if (field === 'nickname' && nickname.trim() === '') {
            Alert.alert('請填寫所有欄位', '所有欄位都需要填寫。');
            return;
        }

        if (field === "skill_level" && skillLevel.trim() === '') {
            Alert.alert('請填寫所有欄位', '所有欄位都需要填寫。');
            return;
        }

        setIsUpdating(true);
        try {
            const payload = {
                'nickname': nickname,
                'position': position,
                'intro': intro,
                'gender': gender,
                'skill_level': skillLevel
            };

            const response = await makeAuthenticatedRequest(`/users/update-profile/`, 'put', payload);
            const updatedProfile = typeof response === 'string' ? JSON.parse(response) : response;

            if (updatedProfile) {
                Alert.alert('更新成功', '您的個人資料已更新。');
                if (field === 'nickname') setIsNicknameModalVisible(false);
                if (field === 'position') setIsPositionModalVisible(false);
                if (field === 'intro') setIsIntroModalVisible(false);
                if (field === 'gender') setIsGenderModalVisible(false);
                if (field === 'skill_level') setIsSkillModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('更新失敗', '請再試一次。');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.main_container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                </TouchableOpacity>
                <Text style={styles.header_text}>編輯資訊</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
                <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>暱稱</Text>
                    <Text style={styles.profileValue}>{nickname}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsNicknameModalVisible(true)}>
                    <Image source={require('../../../assets/images/pencil_icon.png')} style={{height:30, width:30}} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>排球位置</Text>
                    <Text style={styles.profileValue}>{position}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsPositionModalVisible(true)}>
                    <Image source={require('../../../assets/images/pencil_icon.png')} style={{height:30, width:30}} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>自我介紹</Text>
                    <Text style={styles.profileValue}>{intro}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsIntroModalVisible(true)}>
                    <Image source={require('../../../assets/images/pencil_icon.png')} style={{height:30, width:30}} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>性別</Text>
                    <Text style={styles.profileValue}>{gender}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsGenderModalVisible(true)}>
                    <Image source={require('../../../assets/images/pencil_icon.png')} style={{height:30, width:30}} />
                    </TouchableOpacity>
                </View>

                
                <View style={styles.profileItem}>
                    <Text style={styles.profileLabel}>排球程度</Text>
                    <Text style={styles.profileValue}>{skillLevel}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsSkillModalVisible(true)}>
                    <Image source={require('../../../assets/images/pencil_icon.png')} style={{height:30, width:30}} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                            onPress={() => {
                                const url = 'https://docs.google.com/document/d/1OF0ds431CEw2_HVr6zgxZG0FfvgFy6WS/edit?usp=sharing&ouid=114805241625279062309&rtpof=true&sd=true';
                                Linking.canOpenURL(url)
                                    .then((supported) => {
                                        if (supported) {
                                            Linking.openURL(url);
                                        } else {
                                            Alert.alert(`無法打開此連結: ${url}`);
                                        }
                                    })
                                    .catch((err) => console.error('An error occurred', err));
                            }}
                            style = {{alignSelf: "flex-start", }}
                        >
                            <Text style = {{color: 'blue', textDecorationLine: 'underline', fontSize: 14, marginTop: 15}}>
                                什麼是排球分級？
                            </Text>
                        </TouchableOpacity>
            </View>
            

            {/* Modal for Editing Nickname */}
            <Modal
                visible={isNicknameModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsNicknameModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>編輯暱稱</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="暱稱"
                            value={nickname}
                            onChangeText={setNickname}
                        />
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => handleUpdateProfile('nickname')}
                            disabled={isUpdating}
                        >
                            <Text style={styles.modalButtonText}>
                                {isUpdating ? '更新中...' : '提交'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Editing Position */}
            <Modal
                visible={isPositionModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsPositionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>編輯位置</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="位置"
                            value={position}
                            onChangeText={setPosition}
                        />
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => handleUpdateProfile('position')}
                            disabled={isUpdating}
                        >
                            <Text style={styles.modalButtonText}>
                                {isUpdating ? '更新中...' : '提交'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Editing Intro */}
            <Modal
                visible={isIntroModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsIntroModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>編輯自我介紹</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="自我介紹"
                            value={intro}
                            onChangeText={setIntro}
                            multiline={true}
                            numberOfLines={4}
                        />
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => handleUpdateProfile('intro')}
                            disabled={isUpdating}
                        >
                            <Text style={styles.modalButtonText}>
                                {isUpdating ? '更新中...' : '提交'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isSkillModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsSkillModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>編輯程度</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="程度"
                            value={skillLevel}
                            onChangeText={setSkillLevel}
                        />
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => handleUpdateProfile('skill_level')}
                            disabled={isUpdating}
                        >
                            <Text style={styles.modalButtonText}>
                                {isUpdating ? '更新中...' : '提交'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Editing Gender */}
            <Modal
                visible={isGenderModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsGenderModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>編輯性別</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity 
                                style={[styles.genderButton, gender === '男' && styles.selectedGenderButtonMale]}
                                onPress={() => setGender('男')}
                            >
                                <Text style={[styles.genderButtonText, gender !== '男' && styles.genderButtonTextUnselected]}>男</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.genderButton, gender === '女' && styles.selectedGenderButtonFemale]}
                                onPress={() => setGender('女')}
                            >
                                <Text style={[styles.genderButtonText, gender !== '女' && styles.genderButtonTextUnselected]}>女</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity 
                                style={[styles.genderButton, {width: '100%'}, gender === '不透露' && styles.selectedGenderButtonUndisclosed]}
                                onPress={() => setGender('不透露')}
                            >
                                <Text style={[styles.genderButtonText, gender !== '不透露' && styles.genderButtonTextUnselected]}>不便透露</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => handleUpdateProfile('gender')}
                            disabled={isUpdating}
                        >
                            <Text style={styles.modalButtonText}>
                                {isUpdating ? '更新中...' : '提交'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Settings;

const styles = StyleSheet.create({
    icon_back: {
        height: 18,
        width: 18,
    },
    main_container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        height: 50,
        backgroundColor: "#ff7f50",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    goBackButton: {
        position: "absolute",
        left: 10,
        top: 15,
        zIndex: 1,
    },
    header_text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333"
    },
    profileInfo: {
        padding: 20,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    profileLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    profileValue: {
        fontSize: 16,
        color: '#555',
        flex: 1,
        marginLeft: 20,
    },
    editButton: {
        padding: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalInput: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    modalButton: {
        width: '100%',
        height: 40,
        backgroundColor: '#ff7f50',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    genderButton: {
        width: '45%',
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 10,
    },
    selectedGenderButtonMale: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
    },
    selectedGenderButtonFemale: {
        backgroundColor: '#FF69B4',
        borderColor: '#FF69B4',
    },
    selectedGenderButtonUndisclosed: {
        backgroundColor: '#6c757d',
        borderColor: '#6c757d',
    },
    genderButtonText: {
        fontWeight: 'bold',
        color: 'white',
    },
    genderButtonTextUnselected: {
        color: 'black',
    },
});
