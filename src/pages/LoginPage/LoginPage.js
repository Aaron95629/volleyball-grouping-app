import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator 
} from 'react-native';
import { CLIENT_ID, IOS_CLIENT_ID, API_BASE_URL } from '../../../config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postRequest } from '../../component/Auth/network';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native'; // Added import for Platform
import appleAuth, {
    AppleButton,
} from '@invertase/react-native-apple-authentication';


const LoginPage = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: CLIENT_ID, 
            iosClientId: IOS_CLIENT_ID, 
        });

        const checkLogin = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (accessToken) {
                    // Optionally, decode the token to check its validity
                    const decodedToken = jwtDecode(accessToken);
                    const currentTime = Date.now() / 1000; // Current time in seconds

                    if (decodedToken.exp && decodedToken.exp > currentTime) {
                        // Token is valid
                        console.log('Valid access token found. Navigating to SearchSessions.');
                        navigation.navigate('SearchSessions');
                    } else {
                        // Token has expired
                        console.log('Access token expired. Please log in again.');
                        await AsyncStorage.removeItem('accessToken');
                        await AsyncStorage.removeItem('refreshToken');
                        setIsLoading(false);
                    }
                } else {
                    // No access token found
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error checking access token:', error);
                setIsLoading(false);
            }
        };

        checkLogin();
    }, [navigation]);

    const requestPermissions = async () => {
        console.log("Requesting permissions...");
    
        if (Platform.OS === 'ios') {
            try {
                // Request permission for push notifications
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
                if (enabled) {
                    console.log('Authorization status:', authStatus);
    
                    // Get the FCM token
                    const fcmToken = await messaging().getToken();
    
                    if (fcmToken) {
                        console.log('FCM Token:', fcmToken);
    
                        const accessToken = await AsyncStorage.getItem('accessToken');
                        console.log('Access Token:', accessToken);
    
                        if (accessToken) {
                            const decodedToken = jwtDecode(accessToken);
                            const userId = decodedToken.user_id; // Adjust this according to your token's structure
                            console.log('User ID:', userId);
    
                            // Send FCM token to the backend
                            const response = await postRequest(
                                `${API_BASE_URL}/api/register_device_token/`,
                                { registration_id: fcmToken, type: "ios" },
                                {
                                    Authorization: `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                }
                            );
    
                            console.log("Device token registration successful");
                            const responseData = JSON.parse(response);
                            console.log('Response Data:', responseData);
                        } else {
                            console.log('Access Token not available');
                        }
                    } else {
                        console.log('FCM Token not available');
                    }
                } else {
                    console.log('User did not grant permission for push notifications');
                }
            } catch (error) {
                console.error('Error in registerDeviceToken:', error);
                if (error.response) {
                    console.error('Response error:', error.response);
                } else {
                    console.error('Network error:', error);
                }
            }
        }
    };

    const handleGuestBrowse = () => {
        navigation.navigate('SearchSessions');
    };

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            const { idToken, accessToken } = tokens;
            // console.log(idToken);
            // console.log(accessToken);
    
            const response = await postRequest(`${API_BASE_URL}/users/google-login/`, {
                access_token: accessToken
            }, {'Content-Type': 'application/json'});
            
            const responseData = JSON.parse(response);
            
    
            if (responseData) {
                const { access, refresh } = responseData; // Ensure you get both tokens from the response
                // console.log(access);
                await AsyncStorage.setItem('accessToken', access);
                await AsyncStorage.setItem('refreshToken', refresh); // Store the refresh token here
                // console.log('Stored tokens:', access, refresh);
                requestPermissions();
                navigation.navigate('SearchSessions');
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
        }
    };

    const handleAppleLogin = async () => {
        try {
            // Start the sign-in request
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
            });
    
            // Ensure nonce, identityToken, etc. are available
            const { identityToken, authorizationCode, fullName, email } = appleAuthRequestResponse;
            console.log("fullName", fullName);
            console.log("email", email);
            if (fullName.givenName) {
                AsyncStorage.setItem("firstName", fullName.givenName);
                AsyncStorage.setItem("lastName", fullName.familyName);
            }
            // console.log(appleAuthRequestResponse);
            if (identityToken) {
                console.log('Apple identity token: ', identityToken);
                const decoded = jwtDecode(identityToken);
                console.log("decode:", decoded);
    
                // Send identityToken to your backend
                const response = await postRequest(`${API_BASE_URL}/users/apple-login/`, {
                    id_token: identityToken,
                    authorization_code: authorizationCode
                }, {'Content-Type': 'application/json'});
                
                // Alert.alert('title', response);
                const responseData = JSON.parse(response);
                if (responseData.access && responseData.refresh) {
                    await AsyncStorage.setItem('accessToken', responseData.access);
                    await AsyncStorage.setItem('refreshToken', responseData.refresh);
                    requestPermissions();
                    navigation.navigate('SearchSessions');
                } else {
                    Alert.alert('Login Failed', 'Apple login failed. Please try again.');
                }
            } else {
                console.log('Apple login failed - no identity token');
                Alert.alert('Apple Sign-In Error', 'No identity token found. Please try again.');
            }
        } catch (error) {
            console.error('Apple Sign-In error:', error);
            // Alert.alert('Apple Sign-In Error', error.message || 'An error occurred during Apple Sign-In.');
        }
    };
    

    const handleLoginButtonClick = async () => {
        navigation.navigate("SearchSessions")
        console.log(email);
        console.log(password);
        
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        try {
            const response = await postRequest(`${API_BASE_URL}/users/login/`, {
                email,
                password
            }, {'Content-Type': 'application/json'});
            
            const responseData = JSON.parse(response);
            
            if (responseData.access && responseData.refresh) {
                await AsyncStorage.setItem('accessToken', responseData.access);
                await AsyncStorage.setItem('refreshToken', responseData.refresh);
                requestPermissions();
                navigation.navigate('SearchSessions');
            } else {
                Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Error', error.message || 'An error occurred during login.');
        }
    };

    if (isLoading) {
        // Show a loading indicator while checking for token
        return (
            <View style={styles.loading_container}>
                <ActivityIndicator size="large" color="#ff7f50" />
            </View>
        );
    }

    return (
        <View style={styles.main_container}>
            <StatusBar backgroundColor="white" />
            <View style={styles.main_box}>
                <Text style={styles.title}>帳號登入</Text>
                {/* <View style={styles.inputContainer}>
                    <Text style={styles.label}>帳號</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="請輸入您的email" 
                        placeholderTextColor="#aaa" 
                        onChangeText={setEmail}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>密碼</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="請輸入您的密碼" 
                        placeholderTextColor="#aaa" 
                        secureTextEntry={true} 
                        onChangeText={setPassword}
                        value={password}
                    />
                </View>
                <View style={styles.register}>
                    <Text style={styles.registerText}>還沒有帳號？點</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>這裡</Text>
                    </TouchableOpacity>
                    <Text style={styles.registerText}>註冊帳號</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLoginButtonClick}>
                    <Text style={styles.buttonText}>登入</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                    <Text style={styles.buttonText}>Google 登入</Text>
                </TouchableOpacity>
                {Platform.OS === 'ios' && (
                    <AppleButton
                        buttonStyle={AppleButton.Style.WHITE}
                        buttonType={AppleButton.Type.SIGN_IN}
                        style={{
                            width: '100%', 
                            height: 50,
                            marginTop: 20,
                            borderRadius: 25,
                            borderWidth: 1
                        }}
                        onPress={handleAppleLogin}
                    />
                )}
                <TouchableOpacity style={styles.guestButton} onPress={handleGuestBrowse}>
                    <Text style={styles.guestButtonText}>以訪客身份瀏覽</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default LoginPage;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0", // Light gray background
    },
    loading_container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
    main_box: {
        width: "85%",
        padding: 30,
        backgroundColor: "#fff",
        borderRadius: 20, // More rounded corners
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
        fontWeight: "bold"
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: "#555",
        marginBottom: 5,
        fontWeight: "600"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd", 
        height: 45,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
    },
    button: {
        backgroundColor: "#ff7f50", // Modern coral color
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        width: "100%",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    appleButtonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
    },
    registerText: {
        fontSize: 14,
        color: '#555',
    },
    registerLink: {
        fontSize: 14,
        color: "#ff7f50",
        paddingHorizontal: 2,
    },
    register: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    googleButton: {
        backgroundColor: "#4285F4", // Google Blue color
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        width: "100%",
        marginTop: 20,
    },
    appleButton: {
        backgroundColor: "white", // Google Blue color
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        width: "100%",
        marginTop: 20,
        borderWidth: 1,
        borderColor: "black"
    },
    guestButton: {
        backgroundColor: "#808080", // Gray background
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        width: "100%",
        marginTop: 20,
    },
    guestButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
