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
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ScrollView } from 'react-native-gesture-handler';

const TestSettings = ({ route, navigation }) => {
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
    const [profileImage, setProfileImage] = useState(null); // State for profile image

    const requestPhotoLibraryPermission = async () => {
        try {
          const permission = Platform.select({
            ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          });
    
          const result = await check(permission);

          switch (result) {
            case RESULTS.GRANTED:
              return true;
            default:
                let status;
                if (Platform.OS === 'ios') {
                    status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
                } else if (Platform.OS === 'android') {
                    status = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                }
                return status;
          }
        } catch (error) {
          console.error('Error checking photo library permission:', error);
          Alert.alert('錯誤', '無法檢查相片庫權限，請檢查設置。');
          return false;
        }
      };

    const handleSelectProfileImage = async () => {
        const hasPermission = await requestPhotoLibraryPermission();
        if (!hasPermission) {
        Alert.alert('錯誤', '需要相片庫權限來選擇頭像。');
        return;
        }

        const options = {
        mediaType: 'photo',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
        };

        launchImageLibrary(options, (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.error('ImagePicker Error:', response.errorMessage);
            Alert.alert('錯誤', '選擇頭像失敗，請再試一次。');
        } else if (response.assets && response.assets.length > 0) {
            const imageUri = response.assets[0].uri;
            setProfileImage(imageUri);
        }
        });
    };

    const handleUpdateProfile = async () => {
        const wordCount = intro.trim().length;
        if (wordCount > 20) {
            Alert.alert('字數限制', '自我介紹最多20個字。');
            return;
        }

        if (nickname.trim() === '') {
            Alert.alert('請填寫所有欄位', '所有欄位都需要填寫。');
            return;
        }

        if (skillLevel.trim() === '') {
            Alert.alert('請填寫所有欄位', '所有欄位都需要填寫。');
            return;
        }

        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('nickname', nickname);
            formData.append('position', position);
            formData.append('intro', intro);
            formData.append('gender', gender);
            formData.append('skill_level', skillLevel);
            
            if (profileImage) {
                const fileName = profileImage.split('/').pop();
                const fileType = 'image/png'; // Assuming PNG as per request
                formData.append('profile_picture', {
                    uri: profileImage,
                    name: fileName || 'profile_image.png',
                    type: fileType,
                });
            }

            const response = await makeAuthenticatedRequest(`/users/update-profile/`, 'put', formData, true);
            console.log(response);
            const updatedProfile = typeof response === 'string' ? JSON.parse(response) : response;

            if (updatedProfile) {
                Alert.alert('更新成功', '您的個人資料已更新。');
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
            <ScrollView contentContainerStyles={styles.profileInfo} style={{padding: 20}}>
                <Text style={styles.title}>姓名</Text>
                <TextInput
                    style={styles.nameInput}
                    placeholder="姓名"
                    placeholderTextColor="lightgray"
                    value={nickname}
                    onChangeText={setNickname}
                    returnKeyType="next"
                    onSubmitEditing={() => { /* Focus next input if needed */ }}
                />

                <Text style={styles.title}>性別</Text>
                <View style={styles.genderContainer}>
                    <TouchableOpacity
                        style={gender !== '男' ? styles.genderButton : styles.genderSelectedButton}
                        onPress={() => setGender('男')}
                    >
                        <Text style={styles.genderText}>男</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={gender !== '女' ? styles.genderButton : styles.genderSelectedButton}
                        onPress={() => setGender('女')}
                    >
                        <Text style={styles.genderText}>女</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={gender !== '不透露' ? styles.genderButton : styles.genderSelectedButton}
                        onPress={() => setGender('不透露')}
                    >
                        <Text style={styles.genderText}>不透露</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>排球位置</Text>
                <TextInput
                    style={styles.nameInput}
                    placeholder="排球位置"
                    placeholderTextColor="lightgray"
                    value={position}
                    onChangeText={setPosition}
                    returnKeyType="next"
                    onSubmitEditing={() => { /* Focus next input if needed */ }}
                />

                <Text style={styles.title}>等級</Text>
                <View style={styles.levelRow}>
                    <TouchableOpacity
                        style={skillLevel == 'A' ? styles.levelPickedButton : styles.levelButton}
                        onPress={() => setSkillLevel('A')}
                    >
                        <Text style={styles.levelText}>A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={skillLevel == 'B' ? styles.levelPickedButton : styles.levelButton}
                        onPress={() => setSkillLevel('B')}
                    >
                        <Text style={styles.levelText}>B</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={skillLevel == 'C' ? styles.levelPickedButton : styles.levelButton}
                        onPress={() => setSkillLevel('C')}
                    >
                        <Text style={styles.levelText}>C</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={skillLevel == 'D' ? styles.levelPickedButton : styles.levelButton}
                        onPress={() => setSkillLevel('D')}
                    >
                        <Text style={styles.levelText}>D</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={skillLevel == 'E' ? styles.levelPickedButton : styles.levelButton}
                        onPress={() => setSkillLevel('E')}
                    >
                        <Text style={styles.levelText}>E</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>自介</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="自我介紹"
                    placeholderTextColor={"gray"}
                    value={intro}
                    onChangeText={setIntro}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <Text style={styles.title}>頭相</Text>
                <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={handleSelectProfileImage}
                >
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                            onError={(error) => console.error('Profile image error:', error.nativeEvent)}
                        />
                        ) : (
                        <Text style={styles.plusSign}>+</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.storeButton}
                    onPress={handleUpdateProfile}
                >
                    <Text style={styles.storeText}>儲存</Text>
                </TouchableOpacity>
            </ScrollView>
            

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

            
        </View>
    );
};

export default TestSettings;

const styles = StyleSheet.create({
    storeButton: {
        width: "100%",
        height: 50,
        borderRadius: 8,
        backgroundColor: "#4BD962",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center"
    },
    storeText: {
        fontSize: 16,
        fontWeight: "600"
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'gray',
        marginTop: 10,
        marginBottom: 20
      },
      profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
      },
      plusSign: {
        fontSize: 40,
        color: 'gray',
        fontWeight: '300',
      },
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
        flexDirection: "column",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 21,
        fontWeight: "600",
        marginBottom: 10,
    },
    multilineInput: {
        height: 100, // Increased height for multiline input
        textAlignVertical: 'top', // Align text at the top for Android
    },
    input: {
        width: '100%',
        height: 45, // Increased height for better touch area
        borderColor: '#ccc',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 20, // Increased margin
        paddingHorizontal: 10,
        borderRadius: 8, // Slightly more rounded
        backgroundColor: 'white',
    },
    genderContainer: {
        flexDirection: "row",
        alignItems:"center",
        marginBottom: 20, // Increased margin
    },
    genderButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 34,
        width: 67,
        backgroundColor: "#DFDFDF",
        borderRadius: 5,
        marginRight: 5
    },
    genderSelectedButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 34,
        width: 67,
        backgroundColor: "#C8C8C8",
        borderColor: "#7D7D7D",
        borderWidth: 1.5,
        borderRadius: 5,
        marginRight: 5
    },
    genderText: {
        fontSize: 16,
        color: "black"
    },
    levelRow: {
        height: 45,
        width: "100%",
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    levelButton: {
        height: 34,
        width: 67,
        borderRadius: 5,
        backgroundColor: "#FFEBCE",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    levelPickedButton: {
        height: 34,
        width: 67,
        borderRadius: 5,
        backgroundColor: "#FFDCA7",
        borderColor: "#E89C29",
        borderWidth: 1.5,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    levelText: {
        fontSize: 18,
        color: "black"
    },
    nameInput: {
        width: '100%',
        marginBottom: 20, // Increased margin
        paddingVertical: 5,
        backgroundColor: 'white',
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
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
