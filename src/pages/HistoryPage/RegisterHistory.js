import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import TailBar from '../../component/tailBar/tailBar.js';
import { ScrollView } from 'react-native-gesture-handler';
import SessionBox from '../SearchSessionsPage/SessionBox.js';

const RegisterHistory = ({route, navigation}) => {

    const { registeredHistory } = route.params;

    useEffect(() => {
        
    }, []);

    const handleSessionPress = (id) => {
        console.log(id);
        navigation.navigate("RegisterSession", { id: id });
    };

    return (
        <View style = {styles.container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            <View style = {styles.header}>
                <TouchableOpacity
                    style={styles.goBackButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                </TouchableOpacity>
                <Text style = {styles.header_text}> 報名紀錄 </Text>
            </View>
            <ScrollView> 
                {registeredHistory.map((session) => {
                    return (
                        <SessionBox
                            key={session.id}
                            sessionId={session.id}
                            name={session.name}
                            location={session.location}
                            time={`${session.date} ${session.start_time.slice(0, 5)}-${session.end_time.slice(0, 5)}`}
                            spots_left={session.spots_left}
                            net={session.net_type}
                            status={session.status}
                            handleSessionPress={handleSessionPress}
                        />
                    );
                })}
            </ScrollView>
            <TailBar navigation={navigation}/>
        </View>
    );
};

export default RegisterHistory;

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
        justifyContent: "center"
    },
    header_text: {
        fontSize: 20,
        fontWeight: "bold"
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 20, // Ensure the button is above other elements
    },
});