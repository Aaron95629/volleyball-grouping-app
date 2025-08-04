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
    Switch
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownComponent from '../../component/dropDown/DropdownComponent';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';

const ModifyEvent = ({ postVisible, handleCloseModal, eventId, initialData, navigation }) => {
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

    // Mapping from Chinese to English
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
    const [cost, setCost] = useState(0.0);
    const [spotsLeft, setSpotsLeft] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');
    const [net, setNet] = useState([]);
    const [isLateNight, setIsLateNight] = useState(false);
    const [city, setCity] = useState('');
    const [level, setLevel] = useState('');



    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Parse date and time from UTC+8
    const parseDateTimeFromUTC8 = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) {
            console.error('parseDateTimeFromUTC8 received invalid input:', { dateStr, timeStr });
            return new Date(); // Fallback to current date
        }

        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);

        if (
            isNaN(year) || isNaN(month) || isNaN(day) ||
            isNaN(hours) || isNaN(minutes) || isNaN(seconds)
        ) {
            console.error('parseDateTimeFromUTC8 failed to parse date/time components:', {
                dateStr, timeStr
            });
            return new Date();
        }

        // Create a Date object in UTC and adjust to local time by subtracting 8 hours
        const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
        date.setUTCHours(date.getUTCHours() - 8);
        return date;
    };

    // Format date and time to UTC+8 before sending to API
    const formatDateTimeToUTC8 = (dateObj) => {
        const utc8Date = new Date(dateObj.getTime());
        utc8Date.setUTCHours(utc8Date.getUTCHours() + 8);
        const formattedDate = utc8Date.toISOString().split('T')[0];
        const formattedTime = utc8Date.toISOString().split('T')[1].split('.')[0];
        return { date: formattedDate, time: formattedTime };
    };

    useEffect(() => {
        if (initialData) {
            console.log('Initial Data:', initialData);

            const dateStr = initialData.date;
            const startTimeStr = initialData.start_time;
            const endTimeStr = initialData.end_time;

            if (!dateStr || !startTimeStr || !endTimeStr) {
                console.error('Missing date or time in initialData:', { dateStr, startTimeStr, endTimeStr });
                return;
            }

            setName(initialData.name || '');
            setLocation(initialData.location || '');

            const initialDate = parseDateTimeFromUTC8(dateStr, '00:00:00'); // Assuming dateStr has date only
            const initialStartTime = parseDateTimeFromUTC8(dateStr, startTimeStr);
            const initialEndTime = parseDateTimeFromUTC8(dateStr, endTimeStr);

            setDate(initialDate);
            setStartTime(initialStartTime);
            setEndTime(initialEndTime);

            setCost(initialData.cost || 0.0);
            setSpotsLeft(initialData.spots_left?.toString() || '');
            setAdditionalComments(initialData.additional_comments || '');
            setNet(initialData.net_type ? [initialData.net_type] : []);
            setIsLateNight(initialData.is_overnight || false);
            setCity(initialData.city || '');

        }
    }, [initialData]);

    const handleModifyPressed = async () => {
        // Input validation
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
        if (net.length === 0 || !net[0].trim()) {
            Alert.alert('錯誤', '請選擇網子類型。');
            return;
        }
        if (isNaN(parseFloat(cost))) {
            Alert.alert('錯誤', '請輸入有效的費用。');
            return;
        }
        if (!spotsLeft.trim() || isNaN(parseInt(spotsLeft, 10))) {
            Alert.alert('錯誤', '請輸入有效的人數。');
            return;
        }

        try {
            const { date: formattedDate } = formatDateTimeToUTC8(date);
            const { time: formattedStartTime } = formatDateTimeToUTC8(startTime);
            const { time: formattedEndTime } = formatDateTimeToUTC8(endTime);
            const netEnglish = NET_TYPE_MAPPING[net] || net[0];
            const cityEnglish = CITY_TYPE_MAPPING[city] || city;

            const putData = {
                name: name,
                location: location,
                date: formattedDate,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                cost: parseFloat(cost),
                additional_comments: additionalComments,
                net_type: netEnglish,
                spots_left: parseInt(spotsLeft, 10),
                is_overnight: isLateNight,
                city: cityEnglish,
            };

            console.log('Final Put Data:', putData);
            // Alert.alert('title', putData);

            const response = await makeAuthenticatedRequest(
                `/events/update/${eventId}/`,
                'put',
                putData
            );

            console.log('Response Data:', response.data);
            Alert.alert('成功', '更新成功！');
            navigation.navigate("SearchSessions");
            
        } catch (error) {
            console.error('Error during updating:', error);
            if (error.response) {
                Alert.alert('錯誤', error.response.data.error || '更新失敗');
            } else {
                Alert.alert('錯誤', '更新失敗。請再試一次。');
            }
        } finally {
            handleCloseModal();
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            console.log('Selected Date:', selectedDate);
        }
    };

    const handleStartTimeChange = (event, selectedTime) => {
        setShowStartTimePicker(false);
        if (selectedTime) {
            setStartTime(selectedTime);
            console.log('Selected Start Time:', selectedTime);
        }
    };

    const handleEndTimeChange = (event, selectedTime) => {
        setShowEndTimePicker(false);
        if (selectedTime) {
            setEndTime(selectedTime);
            console.log('Selected End Time:', selectedTime);
        }
    };

    return (
        <Modal
            visible={postVisible}
            transparent={false}
            animationType="slide"
            onRequestClose={handleCloseModal}
            presentationStyle="fullScreen"
        >
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <SafeAreaView style={styles.modalContainer} />
                        <View style={styles.modalContent}>
                            <ScrollView
                                contentContainerStyle={styles.scrollContainer}
                                keyboardShouldPersistTaps='handled' // Ensure taps are handled correctly
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
                                />

                                <View style={styles.dateTimeContainer}>
                                    <Text style={styles.label}>日期</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => {
                                            setShowDatePicker(true);
                                        }}
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
                                        onPress={() => {
                                            setShowStartTimePicker(true);
                                        }}
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
                                        onPress={() => {
                                            setShowEndTimePicker(true);
                                        }}
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
                                    placeholderName={'輸入網子類型'}
                                    dropdownData={NET_TYPE_CHOICES}
                                    setValue={setNet}
                                    value={net}
                                />

                                <Text style={styles.label}>縣市</Text>
                                <DropdownComponent
                                    styles={dropdown_styles}
                                    placeholderName={'選擇縣市'}
                                    dropdownData={CITY_TYPE_CHOICES}
                                    setValue={setCity}
                                    value={city}
                                />

                                <Text style={styles.label}>地址</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="輸入地址"
                                    value={location}
                                    onChangeText={setLocation}
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
                                    value={cost.toString()}
                                    onChangeText={(text) => setCost(Number(text))}
                                    keyboardType="numeric"
                                />

                                <Text style={styles.label}>人數</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="輸入人數"
                                    value={spotsLeft.toString()}
                                    onChangeText={(text) => setSpotsLeft(text)}
                                    keyboardType="number-pad"
                                />

                                <Text style={styles.label}>備註</Text>
                                <TextInput
                                    style={[styles.input, styles.multilineInput]}
                                    placeholder="輸入備註（選填）"
                                    value={additionalComments}
                                    onChangeText={setAdditionalComments}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top" // Ensure text starts at the top for Android
                                />
                            </ScrollView>

                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                style={styles.footer}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                            >
                                <TouchableOpacity style={styles.postButton} onPress={handleModifyPressed}>
                                    <Text style={styles.postButtonText}>更新</Text>
                                </TouchableOpacity>
                            </KeyboardAvoidingView>
                        </View>
                {/* </TouchableWithoutFeedback> */}
        </Modal>
    );

};

export default ModifyEvent;

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    modalContainer: {
        flex: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    },
    modalContent: {
        width: '100%',
        flex: 1,
        backgroundColor: '#f7f7f7',
        justifyContent: 'space-between', // Space between ScrollView and Footer
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 0, // Additional padding to ensure content is not hidden by the footer
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        paddingBottom: 10,
    },
    cancelButton: {
        color: 'red', // Changed to red for emphasis
        fontSize: 22,
    },
    titleInput: {
        width: '100%',
        marginHeight: 30,
        height: 50,
        marginBottom: 20,
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
        marginBottom: 8,
        marginTop: 12,
        color: '#333',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20, // Adjust spacing as needed
        marginTop: 10,
    },
    input: {
        width: '100%',
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top', // Align text at the top for Android
    },
    dateTimeContainer: {
        width: '100%',
        marginBottom: 20,
    },
    dateTimeButton: {
        width: '100%',
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    dateTimeButtonText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        padding: 20,
        backgroundColor: '#f7f7f7',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginBottom: 30
    },
    postButton: {
        backgroundColor: '#ff7f50', // Primary color matching PostModal
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    postButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
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
});

const dropdown_styles = StyleSheet.create({
    box_style: {
        width: '100%',
        height: 45,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
});
