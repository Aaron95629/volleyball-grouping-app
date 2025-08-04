import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Platform } from 'react-native';
import TailBar from '../../component/tailBar/tailBar.js';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';
import NotificationBox from './NotificationBox.js';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const Notification = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotification();
    }, []);

    const fetchNotification = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/api/notifications/`, 'get');
            const res = JSON.parse(response);
            setNotifications(res);
        } catch (error) {
            navigation.navigate("Login");
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationPress = async (id, eventId) => {
        console.log(`${id} pressed`);
        try {
            const response = await makeAuthenticatedRequest(`/api/notifications/mark_as_read/${id}/`, 'put');
            fetchNotification();
            navigation.navigate("RegisterSession", { id: eventId });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            <View style={styles.header}>
                <Text style={styles.header_text}> 訊息 </Text>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{marginBottom: 60}}
            >
                {notifications.map((notification, index) => (
                    
                    <View key={notification.id}>
                        {(index) % 4 === 0 && (
                            <View style={styles.adContainer}>
                                <BannerAd
                                    unitId={Platform.OS === 'ios' ? 'ca-app-pub-3666579337584135/2764027659' : 'ca-app-pub-3666579337584135/5972861495'}  // Use TestIds.BANNER for testing
                                    size={BannerAdSize.BANNER}
                                    requestOptions={{
                                        requestNonPersonalizedAdsOnly: true,
                                    }}
                                />
                            </View>
                        )}
                        <NotificationBox
                            id={notification.id}
                            title={notification.title}
                            eventId={notification.event_id}
                            is_read={notification.is_read}
                            message={notification.message}
                            timestamp={notification.timestamp}
                            handleNotificationPress={handleNotificationPress}
                        />
                        {/* Render BannerAd every 7 notifications */}
                        
                    </View>
                ))}
            </ScrollView>
            <TailBar navigation={navigation} />
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        height: 40,
        backgroundColor: "#ff7f50",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    header_text: {
        fontSize: 20,
        fontWeight: "bold"
    },
    adContainer: {
        height: BannerAdSize.BANNER,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
});
