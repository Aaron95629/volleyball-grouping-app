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
    ActivityIndicator,
    
} from 'react-native';
import TailBar from '../../component/tailBar/tailBar.js';
import { makeAuthenticatedRequest } from '../../component/Auth/Auth';

const MoreParticipant = ({ route, navigation }) => {
    const {users} = route.params;


    return (
        <View style={styles.main_container}>
            <StatusBar />
            <SafeAreaView style={{ flex: 0, backgroundColor: "#ff7f50" }}></SafeAreaView>
            <View style={{ zIndex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.goBackButton}
                        onPress={() => navigation.goBack()}
                        accessibilityLabel="Go Back"
                        accessibilityHint="Navigates to the search sessions screen"
                    >
                        <Image source={require('../../../assets/images/arrow_pointing_left_icon.png')} style={styles.icon_back} />
                    </TouchableOpacity>
                    <Text style={styles.header_text}>參與者</Text>
                </View>

            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {users.map((user, index) => (
                    <TouchableOpacity style={styles.particpantContainer} onPress={() => navigation.navigate('GeneralProfile', { userId: user.user_id })}>
                        <Image source={{uri: "https://accademiagallery.org/wp-content/uploads/2024/08/Michelangelos-Statue-of-David-in-florence-accademia-gallery-1.jpg"}} style={styles.image}></Image>
                        <Text style={styles.name}>{user.user_nickname}</Text>
                        <View style={styles.spotsBox}>
                            <Text style={styles.spotsText}>{user.number_of_people}人</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                
            </ScrollView>
        </View>
    );

}

const styles = {
    main_container: {
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
    icon_back: {
        height: 18,
        width: 18,
        position: "absolute",
        left: 10,
        zIndex: 1,
        top: -5
    },
    goBackButton: {
        position: 'absolute',
        left: 10,
        zIndex: 20,
    },
    scrollContent: {
        padding: 0,
        paddingBottom: 120,
        paddingRight: 0,
        marginBottom: 120
    },
    particpantContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderColor: "#D9D9D9"
    },
    image: {
        height: 60,
        width: 60,
        borderRadius: 100,
        marginLeft: 10
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 10
    },
    spotsBox: {
        backgroundColor: "#FFD798",
        borderRadius: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        position: "absolute",
        right: 20
    },
    spotsText: {
        fontSize: 18,
        fontWeight: "600"
    }
}

export default MoreParticipant;
