import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    TextInput, 
    SafeAreaView, 
    Image, 
    ScrollView, 
    RefreshControl, 
    Modal, 
    TouchableOpacity, 
    Alert ,
    Linking,
    Keyboard,
    Platform
} from 'react-native';
import MutiSelectComponent from '../../component/MutiSelect/MutiSelectComponent.js';
import SessionBox from './SessionBox.js';
import TailBar from '../../component/tailBar/tailBar.js';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getRequest } from '../../component/Auth/network.js';
import { API_BASE_URL } from '../../../config.js';
import CheckBox from '@react-native-community/checkbox';
import eulaContent from './EULA.js';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { NativeModules } from 'react-native';
import GroupBox from './GroupBox.js';




const TestSearchSessionsPage = ({ navigation, route }) => {

    const netFilterData = [
        { key: 'beach_volleyball', value: '沙灘排球' },
        { key: 'women_net_mixed', value: '女網混排' },
        { key: 'men_net_men', value: '男網男排' },
        { key: 'women_net_women', value: '女網女排' },
        { key: 'men_net_mixed', value: '男網混排' },
        { key: 'mixed_net', value: '人妖網'}
    ];
    
    const statusFilterData = [
        { key: 'past', value:  "結束/取消" },
        { key: 'open', value: "報名中/進行中/候補中" },
    ];

    const cityFilterData = [
        { key: 'taipei', value: '臺北市' },
        { key: 'new_taipei', value: '新北市' },
        { key: 'taoyuan', value: '桃園市' },
        { key: 'taichung', value: '臺中市' },
        { key: 'tainan', value: '臺南市' },
        { key: 'kaohsiung', value: '高雄市' },
        { key: 'keelung', value: '基隆市' },
        { key: 'hsinchu_city', value: '新竹市' },
        { key: 'hsinchu_county', value: '新竹縣' },
        { key: 'miaoli', value: '苗栗縣' },
        { key: 'changhua', value: '彰化縣' },
        { key: 'nantou', value: '南投縣' },
        { key: 'yunlin', value: '雲林縣' },
        { key: 'chiayi_city', value: '嘉義市' },
        { key: 'chiayi_county', value: '嘉義縣' },
        { key: 'pingtung', value: '屏東縣' },
        { key: 'yilan', value: '宜蘭縣' },
        { key: 'hualien', value: '花蓮縣' },
        { key: 'taitung', value: '臺東縣' },
        { key: 'penghu', value: '澎湖縣' },
        { key: 'kinmen', value: '金門縣' },
        { key: 'lienchiang', value: '連江縣' },
    ];
    const { userId: propUserId } = route.params || {};

    const [filteredSessions, setFilteredSessions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [net, setNet] = useState([]);
    const [city, setCity] = useState([]);
    const [status, setStatus] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isEulaModalVisible, setIsEulaModalVisible] = useState(false);
    const [eulaAccepted, setEulaAccepted] = useState(false);
    const [isSkillLevelModalVisible, setIsSkillLevelModalVisible] = useState(false);


    const [personalInfo, setPersonalInfo] = useState(null);
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [nickname, setNickname] = useState('');
    const [contact, setContact] = useState('');
    const [position, setPosition] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [intro, setIntro] = useState('');
    const [gender, setGender] = useState(''); // New state variable for gender
    const [isUpdating, setIsUpdating] = useState(false);
    const [selector, setSelector] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            // navigation.navigate('Login');
            fetchUserProfile();
            fetchEvents();
        }, [])
    );

    useEffect(() => {
        fetchEvents();
    }, [status]); // Dependency array ensures this runs every time `status` changes

    
    const fetchEvents = async () => {
        try {
            let fetchedEvents = [];

            // If status includes "past", fetch inactive events
            if (status.includes('past')) {
                const inactiveResponse = await getRequest(`${API_BASE_URL}/events/inactive/`, {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                });
                const inactiveEvents = typeof inactiveResponse === 'string' ? JSON.parse(inactiveResponse) : inactiveResponse;
                fetchedEvents = [...fetchedEvents, ...inactiveEvents];
            }

            // If status includes "open" or is empty, fetch active events
            if (status.includes('open') || status.length === 0) {
                const activeResponse = await getRequest(`${API_BASE_URL}/events/active/`, {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                });
                const activeEvents = typeof activeResponse === 'string' ? JSON.parse(activeResponse) : activeResponse;
                fetchedEvents = [...fetchedEvents, ...activeEvents];
            }

            // Remove duplicates if events from both APIs are fetched
            const uniqueEvents = fetchedEvents.reduce((acc, event) => {
                if (!acc.find(item => item.id === event.id)) {
                    acc.push(event);
                }
                return acc;
            }, []);

            setSessions(uniqueEvents); // Update state with the combined list of unique events
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');

            const decodedToken = jwtDecode(accessToken);
            const userIdFromToken = decodedToken.user_id;
            const userIdToUse = propUserId || userIdFromToken;


            const response = await makeAuthenticatedRequest(`/users/api/profile/${userIdToUse}/`, 'get');
            const profileData = typeof response === 'string' ? JSON.parse(response) : response;
            const personalInfoData = profileData;


            setPersonalInfo(personalInfoData);

            if (!personalInfoData.gender || personalInfoData.skill_level === '') {
                setIsEulaModalVisible(true);
                const firstName = await AsyncStorage.getItem("firstName");
                const lastName = await AsyncStorage.getItem("lastName");
                if (firstName) {
                    setNickname(lastName + firstName);
                }
                if (personalInfoData.nickname && personalInfoData.nickname !== '') {
                    setNickname(personalInfoData.nickname);
                }
                setPosition(personalInfoData.position || '');
                setIntro(personalInfoData.intro || '');
                setGender(personalInfoData.gender || '');
                setSkillLevel(personalInfoData.skill_level || '');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleAcceptEula = () => {
        if (eulaAccepted) {
            setIsEulaModalVisible(false);
            setIsProfileModalVisible(true); // Show profile update modal after EULA is accepted
        } else {
            Alert.alert("請先勾選同意條款");
        }
    };

    const handleSearchTextChange = (text) => {
        setSearchTerm(text);
    };

    const handleSessionPress = (id, status) => {
        navigation.navigate("Test", { id: id, status: status });
    };

    const handleGroupPressed = () => {
        navigation.navigate("GroupDetailPage");
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Promise.all([fetchEvents(), fetchUserProfile()]).then(() => setRefreshing(false));
    }, [status]);

    useEffect(() => {
        const filtered = sessions.filter((session) => {
            // 1. Filter by Search Term
            const matchesSearchTerm = searchTerm === "" ? true : (
                session['name'].toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                session['location'].toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        
            // 2. Filter by Net Type
            const matchesNetType = net.length === 0 ? true : net.includes(session['net_type']);
        
            // // 3. Filter by Status
            // const matchesStatus = status.length === 0 
            //     ? (session['status'] !== 'past' && session['status'] !== 'canceled') 
            //     : status.includes(session['status']);
        
            // 4. Filter by Date and Time
            let matchesDateAndTime = true; // Default to true
            console.log(startDate);
            console.log(endDate);
            if (startDate !== '' && endDate !== '') { // If date is specified
                const sessionDate = new Date(session.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                console.log(start);
                console.log(end);
    
                // Adjust end date to include the entire day
                end.setHours(23, 59, 59, 999); // Set to end of the day
    
                matchesDateAndTime = start <= sessionDate  && sessionDate <= end;

            }

            const matchesCity = city.length === 0 ? true : city.includes(session['city']);
        
            return matchesSearchTerm && matchesNetType && matchesDateAndTime && matchesCity;
        });
        
        // 5. Sort the filtered sessions by date from newest to oldest
        const sortedFiltered = filtered.sort((a, b) => {
            // Convert date strings to Date objects for comparison
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Sort in descending order (newest first)
            return dateA - dateB;
        });
        
        // 6. Update the state with the sorted and filtered sessions
        setFilteredSessions(sortedFiltered);
        
        }, [sessions, searchTerm, net, status, startDate, endDate, city]);
        

    const handleUpdateProfile = async () => {
        const wordCount = intro.trim().length;
        if (wordCount > 20) {
            Alert.alert('字數限制', '自我介紹最多20個字。');
            return;
        }

        if ((nickname.trim() === '') || position.trim() === '' || intro.trim() === '' || gender === '' || skillLevel.trim() === '') {
            Alert.alert('請填寫所有欄位', '暱稱、排球位置、自我介紹和性別都需要填寫。');
            return;
        }

        setIsUpdating(true);
        try {
            const payload = {
                'username': personalInfo.username,
                'contact': contact.trim(),
                'nickname': nickname.trim(),
                'position': position.trim(),
                'skill_level': skillLevel.trim(),
                'intro': intro.trim(),
                'gender': gender === '男' ? '男' : gender === '女' ? '女' : '不透露', // Post "Male" or "Female"
            };

            const response = await makeAuthenticatedRequest(`/users/update-profile/`, 'put', payload);
            const updatedProfile = typeof response === 'string' ? JSON.parse(response) : response;
            const updatedPersonalInfo = updatedProfile.personal_info || updatedProfile.user?.personal_info;

            setPersonalInfo(updatedPersonalInfo);
            setIsProfileModalVisible(false);
            Alert.alert('更新成功', '您的個人資料已更新。');
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

            <Modal
                visible={isEulaModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => { }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.eulaModalContainer}>
                        <Text style={styles.modalTitle}>使用者條款</Text>
                        <ScrollView style={styles.eulaContent}>
                            <Text>
                                {/* Sample EULA text; replace with actual content or load from EULA.txt */}
                                {eulaContent}
                            </Text>
                        </ScrollView>
                        <View style={styles.eulaFooter}>
                            <CheckBox
                                value={eulaAccepted}
                                onValueChange={setEulaAccepted}
                                style={styles.checkbox}
                            />
                            <Text style={styles.checkboxLabel}>我已閱讀並同意 使用者條款</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.modalButton, !eulaAccepted && { opacity: 0.5 }]} 
                            onPress={handleAcceptEula}
                        >
                            <Text style={styles.modalButtonText}>同意</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.searchBarContainer}>
                <Image source={require('../../../assets/images/magnifier.png')} style={styles.icon} />
                <TextInput 
                    style={styles.searchBar} 
                    placeholder="輸入標題或地址"
                    placeholderTextColor="#aaa"
                    value={searchTerm}
                    onChangeText={text => handleSearchTextChange(text)}
                    returnKeyType="done" // Add this line
                    onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                />
            </View>

            <View style={styles.filterContainer}>
                <MutiSelectComponent 
                    placeholderName={"網子"}
                    setValue={setNet}
                    inputData={netFilterData}
                />
                <MutiSelectComponent 
                    placeholderName={"狀態"}
                    setValue={setStatus}
                    inputData={statusFilterData}
                />
                <MutiSelectComponent 
                    placeholderName={"縣市"}
                    setValue={setCity}
                    inputData={cityFilterData}
                />
                <MutiSelectComponent 
                    placeholderName={"時段"}
                    date={true}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
            </View>

            <View style={styles.divisionBox}></View>

            <View style={styles.selectorContainer}>
                <View style={styles.selectorBoxContainer}>
                    <TouchableOpacity
                        style={selector ? styles.selectedSelectorBox : styles.selectorBox}
                        onPress={() => setSelector(true)}
                    >
                        <Text style={selector ? styles.selectedSelectorText : styles.selectorText}>臨打報名</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={!selector ? styles.selectedSelectorBox : styles.selectorBox}
                        onPress={() => setSelector(false)}
                    >
                        <Text style={!selector ? styles.selectedSelectorText : styles.selectorText}>球館專區</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {selector && (
                <View style={styles.scrollHeader}>
                    <View style={styles.headerColorBar}></View>
                    <Text style={styles.headerText}>全部場次</Text>
                    <View style={styles.headerRightColorBar}></View>
                    <Text style={styles.headerRightText}>缺少</Text>
                </View>
            )}
            
            {selector ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {filteredSessions.map((session, index) => (
                        <View key={session.id}>
                            {/* Render BannerAd every 7 events */}
                            {(index) % 4 === 0 && (
                                <View style={styles.socialMedialContainer}>
                                    <BannerAd
                                        unitId={Platform.OS === 'ios' ? 'ca-app-pub-3666579337584135/2764027659' : 'ca-app-pub-3666579337584135/5972861495'}  // Use TestIds.BANNER for testing purposes
                                        size={BannerAdSize.BANNER}
                                        requestOptions={{
                                            requestNonPersonalizedAdsOnly: true,
                                        }}
                                        style={{width: "100%"}}
                                    />
                                </View>
                            )}
                            
                            <SessionBox
                                sessionId={session.id}
                                name={session.name}
                                location={session.location}
                                time={`${session.date} ${session.start_time.slice(0, 5)}-${session.is_overnight ? "（隔天）": ""}${session.end_time.slice(0, 5)}`}
                                spots_left={session.spots_left}
                                net={session.net_type}
                                status={session.status}
                                city={session.city}
                                handleSessionPress={() => handleSessionPress(session.id, session.status)}
                            />

                        </View>
                    ))}
                    <View style={{ height: 70 }} />
                </ScrollView>
            ) : (
                <ScrollView contentContainerStyle={styles.groupContainer} style={{padding: 20}}>
                    
                    <GroupBox 
                        groupId={1}
                        name={"藍鵲排球-板橋館"}
                        image={"https://lh3.googleusercontent.com/p/AF1QipMUXLPTJ7zPTsxfqNTf-jbY1hq8iwAj2rpIp4Aq=s1360-w1360-h1020-rw"}
                        handleGroupPressed={() => handleGroupPressed()}
                    />
                    <GroupBox 
                        groupId={1}
                        name={"藍鵲排球-板橋館"}
                        image={"https://lh3.googleusercontent.com/p/AF1QipMUXLPTJ7zPTsxfqNTf-jbY1hq8iwAj2rpIp4Aq=s1360-w1360-h1020-rw"}
                        handleGroupPressed={() => handleGroupPressed()}
                    />
                    <GroupBox 
                        groupId={1}
                        name={"藍鵲排球-板橋館"}
                        image={"https://lh3.googleusercontent.com/p/AF1QipMUXLPTJ7zPTsxfqNTf-jbY1hq8iwAj2rpIp4Aq=s1360-w1360-h1020-rw"}
                        handleGroupPressed={() => handleGroupPressed()}
                    />
                </ScrollView>
            )}
            

            <TailBar navigation={navigation} />

            <Modal
                visible={isProfileModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => { }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>更新個人資料</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="暱稱"
                            value={nickname}
                            onChangeText={setNickname}
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="電話號碼或Line ID"
                            value={contact}
                            onChangeText={setContact}
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="排球位置"
                            value={position}
                            onChangeText={setPosition}
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="排球程度分級"
                            value={skillLevel}
                            onChangeText={setSkillLevel}
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />
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
                            style = {{alignSelf: "flex-end", }}
                        >
                            <Text style = {{color: 'blue', textDecorationLine: 'underline', fontSize: 12, marginTop: -20, marginLeft: 0,}}>
                                什麼是排球分級？
                            </Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="自我介紹"
                            value={intro}
                            onChangeText={setIntro}
                            returnKeyType="done" // Add this line
                            onSubmitEditing={Keyboard.dismiss} // Dismiss keyboard when "Done" is pressed
                        />

                        {/* Gender Selection Buttons */}
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
                                style={[styles.genderButton, {width: '100%',}, gender === '不透露' && styles.selectedGenderButtonUndisclosed]}
                                onPress={() => setGender('不透露')}
                            >
                                <Text style={[styles.genderButtonText, gender !== '不透露' && styles.genderButtonTextUnselected]}>不便透露</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={handleUpdateProfile}
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

export default TestSearchSessionsPage;

const styles = StyleSheet.create({
    groupContainer: {
        flexWrap: "wrap",
        flexDirection: 'row',
        justifyContent: "space-between",
        width: "100%",
        gap: 11
    },
    selectorContainer: {
        flexDirection: "column",
        alignItems: "center",
        marginTop: 10
    },
    selectorBoxContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        borderRadius: 5,
        backgroundColor: "#FFDCA7",
        padding: 5
    },
    selectedSelectorBox: {
        width: 138,
        height: 30,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 5
    },
    selectorBox: {
        width: 138,
        height: 30,
        backgroundColor: "#FFDCA7",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 5
    },
    selectedSelectorText: {
        fontSize: 17,
        fontWeight: "700"
    },
    selectorText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#6F6F6F"
    },
    main_container: {
        backgroundColor: "white",
        flex: 1,
    },
    searchBarContainer: {
        height: 60,
        backgroundColor: "#ff7f50",
        alignItems: "center",
        paddingTop: 10,
        flexDirection: "row",
        paddingRight: 20,
        paddingLeft: 20,
        position: 'relative',
    },
    searchBar: {
        width: '100%',
        height: 35,
        borderRadius: 7,
        backgroundColor: "white",
        paddingLeft: 40,
        flex: 1,
    },
    icon: {
        height: 20,
        width: 20,
        position: "absolute",
        top: 25,
        left: 30,
        zIndex: 1,
        opacity: 0.5
    },
    filterContainer: {
        height: 40,
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingLeft: 20,
        zIndex: 5
    },
    divisionBox: {
        height: 10,
        backgroundColor: "#f0f0f0"
    },
    scrollHeader: {
        height: 50,
        backgroundColor: "white",
        alignItems: 'center',
        flexDirection: "row",
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    headerColorBar: {
        height: 20,
        width: 5,
        backgroundColor: "#ff7f50",
    },
    headerText: {
        paddingLeft: 8,
        fontWeight: "bold",
        color: "#333"
    },
    headerRightText: {
        fontWeight: "bold",
        position: "absolute",
        color: "#333",
        right: 30
    },
    headerRightColorBar: {
        height: 20,
        width: 5,
        backgroundColor: "#ff7f50",
        position: "absolute",
        right: 65
    },
    socialMedialContainer: {
        // height: BannerAdSize.BANNER,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ddd',
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    eulaModalContainer: {
        width: '90%', // Adjust width to fit nicely on screen
        maxHeight: '80%', // Limit height to avoid overflow
        backgroundColor: 'white', // White background for the modal
        borderRadius: 10, // Rounded corners
        padding: 20, // Inner padding for content spacing
        alignItems: 'center', // Center align content horizontally
        shadowColor: '#000', // Shadow color for a subtle 3D effect
        shadowOffset: { width: 0, height: 2 }, // Offset for shadow
        shadowOpacity: 0.3, // Shadow opacity
        shadowRadius: 4, // Blur radius for shadow
        elevation: 5, // Elevation for Android shadow effect
    },
    
    modalInput: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 25,
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    genderButton: {
        width: '45%',
        height: 40,
        borderRadius: 20, // Making the button elliptical
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 10, // Adding gap between buttons
    },
    selectedGenderButtonMale: {
        backgroundColor: '#007BFF', // Blue color for male
        borderColor: '#007BFF',
    },
    selectedGenderButtonFemale: {
        backgroundColor: '#FF69B4', // Pink color for female
        borderColor: '#FF69B4',
    },
    genderButtonText: {
        fontWeight: 'bold',
        color: 'white',
    },
    genderButtonTextUnselected: {
        color: 'black', // Set initial color to black for unselected buttons
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
    selectedGenderButtonUndisclosed: {
        backgroundColor: '#808080', // Gray color for undisclosed
        borderColor: '#808080',
    },
    eulaContent: {
        paddingBottom: 20, // Add space between content and checkbox
    },
    eulaFooter: {
        flexDirection: 'row', // Arrange items in a row
        alignItems: 'center', // Center align vertically
        marginTop: 20, // Add some spacing between content and checkbox
        marginBottom: 20
    },
    checkbox: {
        marginRight: 8, // Space between checkbox and text
    },
    disabledInput: {
        backgroundColor: '#f0f0f0', // Light gray to indicate disabled state
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxLabel: {
        fontSize: 16,
    },
    
    // Container for the modal content
    skillLevelModalContainer: { 
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    
    // Style for the image within the modal
    skillLevelImage: { 
        width: '100%',
        height: 200, // Adjust as needed
    },
    
    // Style for the close button
    closeButton: { 
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#2196F3',
        borderRadius: 5,
    },
    
    // Style for the close button text
    closeText: { 
        color: 'white',
        fontWeight: 'bold',
    },
});
