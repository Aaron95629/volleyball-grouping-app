import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Modal, 
    ScrollView, 
    Alert, 
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView,
    Switch,
    ActivityIndicator,
    Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownComponent from '../dropDown/DropdownComponent';
import { makeAuthenticatedRequest } from '../Auth/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const PostModal = ({ postVisible, handleCloseModal }) => {
    const CITY_TYPE_CHOICES = [
        { key: '臺北市', value: '臺北市' },
        { key: '新北市', value: '新北市' },
        { key: '桃園市', value: '桃園市' },
        { key: '臺中市', value: '臺中市' },
        { key: '臺南市', value: '臺南市' },
        { key: '高雄市', value: '高雄市' },
        { key: '基隆市', value: '基隆市' },
        { key: '新竹市', value: '新竹市' },
        { key: '新竹縣', value: '新竹縣' },
        { key: '苗栗縣', value: '苗栗縣' },
        { key: '彰化縣', value: '彰化縣' },
        { key: '南投縣', value: '南投縣' },
        { key: '雲林縣', value: '雲林縣' },
        { key: '嘉義市', value: '嘉義市' },
        { key: '嘉義縣', value: '嘉義縣' },
        { key: '屏東縣', value: '屏東縣' },
        { key: '宜蘭縣', value: '宜蘭縣' },
        { key: '花蓮縣', value: '花蓮縣' },
        { key: '臺東縣', value: '臺東縣' },
        { key: '澎湖縣', value: '澎湖縣' },
        { key: '金門縣', value: '金門縣' },
        { key: '連江縣', value: '連江縣' },
    ];
    
    const CITY_TYPE_MAPPING = {
        '臺北市': 'taipei',
        '新北市': 'new_taipei',
        '桃園市': 'taoyuan',
        '臺中市': 'taichung',
        '臺南市': 'tainan',
        '高雄市': 'kaohsiung',
        '基隆市': 'keelung',
        '新竹市': 'hsinchu_city',
        '新竹縣': 'hsinchu_county',
        '苗栗縣': 'miaoli',
        '彰化縣': 'changhua',
        '南投縣': 'nantou',
        '雲林縣': 'yunlin',
        '嘉義市': 'chiayi_city',
        '嘉義縣': 'chiayi_county',
        '屏東縣': 'pingtung',
        '宜蘭縣': 'yilan',
        '花蓮縣': 'hualien',
        '臺東縣': 'taitung',
        '澎湖縣': 'penghu',
        '金門縣': 'kinmen',
        '連江縣': 'lienchiang',
    };

    const NET_TYPE_CHOICES = [
        { key: '沙灘排球', value: '沙灘排球' },
        { key: '女網混排', value: '女網混排' },
        { key: '女網女排', value: '女網女排' },
        { key: '男網男排', value: '男網男排' },
        { key: '男網混排', value: '男網混排' },
        { key: '人妖網', value: '人妖網' },
    ];

    const NET_TYPE_MAPPING = {
        '沙灘排球': 'beach_volleyball',
        '女網混排': 'women_net_mixed',
        '女網女排': 'women_net_women',
        '男網男排': 'men_net_men',
        '男網混排': 'men_net_mixed',
        '人妖網': 'mixed_net',
    };

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [cost, setCost] = useState('');
    const [spotsLeft, setSpotsLeft] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [net, setNet] = useState('');
    const [isLateNight, setIsLateNight] = useState(false);
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState('');
    const [level, setLevel] = useState('');
    const [image, setImage] = useState(null); // State for profile image

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

    const handleSelectImage = async () => {
        const hasPermission = await requestPhotoLibraryPermission();
        if (!hasPermission) {
        Alert.alert('錯誤', '需要相片庫權限來選擇頭像。');
        return;
        }

        const options = {
        mediaType: 'photo',
        maxWidth: 1000,
        maxHeight: 1000,
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
            setImage(imageUri);
        }
        });
    };

    // Use effect to print the current timezone
    useEffect(() => {
        const timezoneOffset = new Date().getTimezoneOffset() / -60; // Offset in hours
        console.log(`Current Timezone: UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`);
    }, []);

    
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate); // Do not convert to UTC+8 here
        setShowDatePicker(false);
        setPickerVisible(false);
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            setPickerVisible(false);
        }
    };

    const handleStartTimeChange = (event, selectedDate) => {
        const currentTime = selectedDate || startTime;
        setStartTime(currentTime); // Do not convert to UTC+8 here]
        setShowStartTimePicker(false);
        setPickerVisible(false);
        if (Platform.OS === 'android') {
            setShowStartTimePicker(false);
            setPickerVisible(false);
        }
    };

    const handleEndTimeChange = (event, selectedDate) => {
        const currentTime = selectedDate || endTime;
        setEndTime(currentTime); // Do not convert to UTC+8 here
        setShowEndTimePicker(false);
        setPickerVisible(false);
        if (Platform.OS === 'android') {
            setShowEndTimePicker(false);
            setPickerVisible(false);
        }
    };

    // Convert the selected date/time to UTC+8 just before sending the data to the API
    const toUTC8IfNeeded = (date) => {
        const currentOffsetInMinutes = new Date().getTimezoneOffset(); // in minutes
        const currentOffset = -currentOffsetInMinutes / 60; // Convert to hours and invert the sign (e.g., UTC-5 -> -5)
        const targetOffset = 8; // Target is UTC+8
        const offsetDifference = targetOffset - currentOffset; // Difference in hours

        console.log("Current Offset:", currentOffset);
        console.log("Target Offset: 8 (UTC+8)");
        console.log("Offset Difference:", offsetDifference);

        // Adjusting hours directly to ensure proper conversion
        const newDate = new Date(date);
        newDate.setHours(date.getHours() + offsetDifference);

        return newDate;
    };

    const formatDate = (date) => {
        const utc8Date = toUTC8IfNeeded(date);
        console.log("Formatted Date: ", utc8Date);
        return utc8Date.toISOString().split('T')[0]; // Return only the date part
    };
    
    const formatTime = (time) => {
        const utc8Time = toUTC8IfNeeded(time);
        console.log("utc8Time: ", utc8Time);
        const hours = utc8Time.getHours().toString().padStart(2, '0');
        const minutes = utc8Time.getMinutes().toString().padStart(2, '0');
        console.log("Formatted Time: ", `${hours}:${minutes}:00`);
        return `${hours}:${minutes}:00`; // Keep the time format consistent
    };

    const handlePostPressed = async () => {
        // Input validation can be added here
        const now = toUTC8IfNeeded(new Date());

        // Convert input date and time to UTC+8
        const eventDate = toUTC8IfNeeded(date);
        const eventStartTime = toUTC8IfNeeded(startTime);
    
        if (eventDate < now.setHours(0, 0, 0, 0) || eventStartTime < now) {
            Alert.alert('錯誤', '日期和時間必須大於或等於當前時間！');
            return;
        }    
        if (!city.trim()) {
            Alert.alert('錯誤', '請選擇縣市。');
            return;
        }
        if (!name.trim()) {
            Alert.alert('錯誤', '請輸入標題。');
            return;
        }
        if (!location.trim()) {
            Alert.alert('錯誤', '請輸入地址。');
            return;
        }
        if (!net.trim()) {
            Alert.alert('錯誤', '請選擇網子類型。');
            return;
        }
        if (!cost.trim() || isNaN(parseFloat(cost))) {
            Alert.alert('錯誤', '請輸入有效的費用。');
            return;
        }
        if (!spotsLeft.trim() || isNaN(parseInt(spotsLeft, 10))) {
            Alert.alert('錯誤', '請輸入有效的人數。');
            return;
        }

        try {
            setLoading(true)
            console.log(net);
            const netEnglish = NET_TYPE_MAPPING[net] || net;
            const cityEnglish = CITY_TYPE_MAPPING[city] || city;
            const formData = new FormData();
            formData.append('name', name);
            formData.append('location', location);
            formData.append('date', formatDate(date));
            formData.append('start_time', formatTime(startTime));
            formData.append('end_time', formatTime(endTime));
            formData.append('cost', parseFloat(cost));
            formData.append('additional_comments', additionalComments);
            formData.append('net_type', netEnglish);
            formData.append('spots_left', parseInt(spotsLeft, 10));
            formData.append('is_overnight', isLateNight);
            formData.append('level', level);
            formData.append('city', cityEnglish);


            if (image) {
                const fileName = image.split('/').pop();
                const fileType = 'image/png'; // Assuming PNG as per request
                formData.append('photo', {
                    uri: image,
                    name: fileName || 'photo.png',
                    type: fileType,
                });
            }

            const response = await makeAuthenticatedRequest(`/api/events/add/`, 'post', formData, true);

            console.log("Response Data:", response.data);
            Alert.alert('成功', '發布成功！請刷新主頁面！');
        } catch (error) {
            console.error('Error during posting:', error);
            if (error.response) {
                Alert.alert('錯誤', error.response.data.error || '發布失敗');
            } else {
                Alert.alert('錯誤', '發布失敗。請重開應用程式再試一次。');
            }
        } finally {
            setLoading(false);
            handleCloseModal();
        }
    };

    const handlePeopleChange = (text) => {
        const peopleCount = parseInt(text, 10);
        setSpotsLeft(!isNaN(peopleCount) ? text : '');
    }

    const handleCostChange = (text) => {
        // Allow only numbers and decimal point
        const regex = /^\d*\.?\d*$/;
        if (regex.test(text)) {
            setCost(text);
        }
    }

    const closePicker = () => {
        setShowDatePicker(false);
        setShowStartTimePicker(false);
        setShowEndTimePicker(false);
        setPickerVisible(false);
    }

    return (
            <Modal
                visible={postVisible}
                transparent={false}
                animationType="slide"
                onRequestClose={handleCloseModal}
                presentationStyle="formSheet"
            >
                <SafeAreaView style={styles.modalContainer} />
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                        <View style={styles.modalContent}>
                            {loading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#ffffff" />
                                </View>
                            )}
                            <ScrollView 
                                contentContainerStyle={styles.scrollContainer}
                                keyboardShouldPersistTaps='always'
                                nestedScrollEnabled={true}
                                style={{ flex: 1 }}
                            >
                                <View style={styles.header}>
                                    <TouchableOpacity onPress={handleCloseModal}>
                                        <Text style={styles.cancelButton}>取消</Text>
                                    </TouchableOpacity>
                                </View>
        
                                <TextInput
                                    style={styles.titleInput}
                                    placeholder="標題"
                                    placeholderTextColor="lightgray"
                                    value={name}
                                    onChangeText={setName}
                                    returnKeyType="next"
                                    onSubmitEditing={() => { /* Focus next input if needed */ }}
                                />
        
                                <View style={styles.dateTimeContainer}>
                                    <Text style={styles.label}>日期</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => { setShowDatePicker(true); setPickerVisible(true); }}
                                    >
                                        <Text style={styles.dateTimeButtonText}>
                                            {date.toLocaleDateString()}
                                        </Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={handleDateChange}
                                        />
                                    )}
        
                                    <Text style={styles.label}>開始時間</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => { setShowStartTimePicker(true); setPickerVisible(true); }}
                                    >
                                        <Text style={styles.dateTimeButtonText}>
                                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                    {showStartTimePicker && (
                                        <DateTimePicker
                                            value={startTime}
                                            mode="time"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={handleStartTimeChange}
                                        />
                                    )}
        
                                    <Text style={styles.label}>結束時間</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => { setShowEndTimePicker(true); setPickerVisible(true); }}
                                    >
                                        <Text style={styles.dateTimeButtonText}>
                                            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                    {showEndTimePicker && (
                                        <DateTimePicker
                                            value={endTime}
                                            mode="time"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={handleEndTimeChange}
                                        />
                                    )}
                                </View>

                                <View style={styles.switchContainer}>
                                    <Text style={styles.label}>如結束時間超過凌晨12點到隔天請勾選</Text>
                                    <Switch
                                        trackColor={{ false: "#767577", true: "#4cd137" }} // Updated to green
                                        thumbColor={isLateNight ? "#ffffff" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={setIsLateNight}
                                        value={isLateNight}
                                    />
                                </View>
        
                                <Text style={styles.label}>網子類型</Text>
                                <DropdownComponent 
                                    styles={dropdown_styles}
                                    placeholderName={"輸入網子類型"}
                                    dropdownData={NET_TYPE_CHOICES}
                                    setValue={setNet}
                                />

                                <Text style={styles.label}>縣市</Text>
                                <DropdownComponent
                                    styles={dropdown_styles}
                                    placeholderName={"選擇縣市"}
                                    dropdownData={CITY_TYPE_CHOICES}
                                    setValue={setCity}
                                />
        
                                <Text style={styles.label}>地址</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="輸入地址"
                                    placeholderTextColor={"gray"}
                                    value={location}
                                    onChangeText={setLocation}
                                    returnKeyType="next"
                                    onSubmitEditing={() => { /* Focus next input if needed */ }}
                                />

                                <Text style={styles.label}>等級</Text>
                                <View style={styles.levelRow}>
                                    <TouchableOpacity
                                        style={level == 'A' ? styles.levelPickedButton : styles.levelButton}
                                        onPress={() => setLevel('A')}
                                    >
                                        <Text style={styles.levelText}>A</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={level == 'B' ? styles.levelPickedButton : styles.levelButton}
                                        onPress={() => setLevel('B')}
                                    >
                                        <Text style={styles.levelText}>B</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={level == 'C' ? styles.levelPickedButton : styles.levelButton}
                                        onPress={() => setLevel('C')}
                                    >
                                        <Text style={styles.levelText}>C</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={level == 'D' ? styles.levelPickedButton : styles.levelButton}
                                        onPress={() => setLevel('D')}
                                    >
                                        <Text style={styles.levelText}>D</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={level == 'E' ? styles.levelPickedButton : styles.levelButton}
                                        onPress={() => setLevel('E')}
                                    >
                                        <Text style={styles.levelText}>E</Text>
                                    </TouchableOpacity>
                                </View>
        
                                <Text style={styles.label}>費用</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="輸入費用"
                                    placeholderTextColor={"gray"}
                                    value={cost}
                                    onChangeText={handleCostChange}
                                    keyboardType="decimal-pad"
                                />
        
                                <Text style={styles.label}>開放報名人數</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="輸入人數"
                                    placeholderTextColor={"gray"}
                                    value={spotsLeft}
                                    onChangeText={handlePeopleChange}
                                    keyboardType="number-pad"
                                />

                                <Text style={styles.label}>照片</Text>
                                <TouchableOpacity
                                    style={styles.imageContainer}
                                    onPress={handleSelectImage}
                                >
                                    {image ? (
                                        <Image
                                            source={{ uri: image }}
                                            style={styles.image}
                                            onError={(error) => console.error('Profile image error:', error.nativeEvent)}
                                        />
                                        ) : (
                                        <Text style={styles.plusSign}>+</Text>
                                    )}
                                </TouchableOpacity>
        
                                <Text style={styles.label}>備註</Text>
                                <TextInput
                                    style={[styles.input, styles.multilineInput]}
                                    placeholder="輸入備註（選填）"
                                    placeholderTextColor={"gray"}
                                    value={additionalComments}
                                    onChangeText={setAdditionalComments}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
        
                                <View style={{ height: 20 }} />
                            </ScrollView>
        
                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                style={styles.footer}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                            >
                                <TouchableOpacity style={styles.postButton} onPress={handlePostPressed}>
                                    <Text style={styles.postButtonText}>發布</Text>
                                </TouchableOpacity>
                            </KeyboardAvoidingView>
                        </View>
                    {/* </TouchableWithoutFeedback> */}
            </Modal>
    );

};

export default PostModal;

const styles = StyleSheet.create({
    imageContainer: {
        width: 350,
        height: 200,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'gray',
        marginTop: 10,
        marginBottom: 20
      },
      image: {
        width: 350,
        height: 200,
        borderRadius: 5
      },
      plusSign: {
        fontSize: 40,
        color: 'gray',
        fontWeight: '300',
      },
    keyboardAvoidingView: {
        flex: 1,
        
    },
    modalContainer: {
        flex: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
        
    },
    modalContent: {
        width: '100%',
        height: Platform.OS === "ios" ? '95%' : '100%', // Adjust height as needed
        backgroundColor: 'white',
        justifyContent: 'space-between', // Space between ScrollView and Footer
        overflow: 'hidden'
    },
    scrollContainer: {
        padding: 20, // Increased padding for better spacing
        paddingBottom: 0, // Remove bottom padding to allow footer to sit at the very bottom
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',  
        paddingBottom: 10,
    },
    cancelButton: {
        color: 'red', // Changed to red for emphasis
        fontSize: 20,
    },
    titleInput: {
        width: '100%',
        marginTop: 30,
        height: 50,
        marginBottom: 25, // Increased margin
        paddingHorizontal: 10,
        backgroundColor: 'white',
        fontSize: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderRadius: 8,
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 16,
        marginBottom: 8, // Increased margin
        marginTop: 12, // Increased top margin
        color: '#333',
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
    multilineInput: {
        height: 100, // Increased height for multiline input
        textAlignVertical: 'top', // Align text at the top for Android
    },
    dateTimeContainer: {
        width: '100%',
        marginBottom: 20, // Increased margin
    },
    dateTimeButton: {
        width: '100%',
        height: 45, // Increased height for better touch area
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, // Increased margin
        borderRadius: 8, // Slightly more rounded
        backgroundColor: 'white',
    },
    dateTimeButtonText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownPlaceholder: {
        width: '100%',
        height: 45, // Increased height for better touch area
        borderRadius: 8, // Slightly more rounded
        borderColor: '#ccc',
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    footer: {
        padding: 10, // Reduced padding to minimize gap
        backgroundColor: 'white',
        alignItems: "center"
    },
    postButton: {
        backgroundColor: '#ff7f50', // Primary color
        paddingVertical: 15,
        width: '80%',
        borderRadius: 8,
        alignItems: 'center',
    },
    postButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20, // Adjust spacing as needed
        marginTop: 10,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure it overlays other components
    },
});

const dropdown_styles = StyleSheet.create({
    box_style: {
        width: '100%',
        height: 45, // Increased height for better touch area
        borderRadius: 8, // Slightly more rounded
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        placeholderTextColor: "gray"
    }
});
