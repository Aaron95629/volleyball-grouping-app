import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView, StatusBar, Image, Platform, Switch } from 'react-native';
import TailBar from '../../component/tailBar/tailBar.js';

const NotificationSettings = ({ navigation }) => {
    const [isActivityNotificationEnabled, setIsActivityNotificationEnabled] = useState(false);
    
    const toggleActivityNotification = () => setIsActivityNotificationEnabled(previousState => !previousState);
    
    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:')
                .catch(() => Alert.alert('Error', 'Unable to open settings.'));
        } else {
            Linking.openSettings()
                .catch(() => Alert.alert('Error', 'Unable to open settings.'));
        }
    };

    return (
        <View style={styles.container}>
            {/* Safe Area and Status Bar */}
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                </TouchableOpacity>
                <Text style={styles.header_text}>通知設定</Text>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>全部通知設定：</Text>
                    <TouchableOpacity style={styles.generalButton} onPress={openSettings}>
                        <Text style={styles.buttonText}>
                            {Platform.OS === 'ios' ? '前往 iOS 設定' : '前往 Android 設定'}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>新活動通知：</Text>
                    <Switch
                        value={isActivityNotificationEnabled}
                        onValueChange={toggleActivityNotification}
                    />
                </View>
            </View>

            {/* TailBar */}
            <TailBar navigation={navigation} />
        </View>
    );
};

export default NotificationSettings;

const styles = StyleSheet.create({
    icon_back: {
        height: 18,
        width: 18,
        position: "absolute",
        left: 10,
        zIndex: 1,
        top: -5
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        height: 40,
        backgroundColor: "#ff7f50",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 20,
    },
    header_text: {
        fontSize: 20,
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    generalButton: {
        backgroundColor: "#ff7f50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
