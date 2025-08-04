import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, Linking } from 'react-native';
import {jwtDecode} from 'jwt-decode';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import React from 'react';
import LoginPage from './src/pages/LoginPage/LoginPage';
import RegisterPage from './src/pages/RegisterPage/RegisterPage';
import PersonalInfoPage from './src/pages/PersonalInfoPage/PersonalInfoPage';
import SearchSessionsPage from './src/pages/SearchSessionsPage/SearchSessionsPage';
import RegisterSessionPage from './src/pages/RegisterSessionPage/RegisterSessionPage';
import Notification from './src/pages/NotificationPage/Notification';
import Profile from './src/pages/ProfilePage/Profile';
import ChatRoom from './src/pages/ChatRoomPage/ChatRoom';
import HostedHistory from './src/pages/HistoryPage/HostedHistory';
import RegisterHistory from './src/pages/HistoryPage/RegisterHistory';
import VerifyingRegister from './src/pages/HistoryPage/VerifyingRegister';
import NotificationSettings from './src/pages/HistoryPage/NotificationSetting';
import GeneralProfile from './src/pages/ProfilePage/GeneralProfile';
import Setting from './src/pages/HistoryPage/Setting';
import BlockList from './src/pages/ProfilePage/BlockList';
import VersionCheck from 'react-native-version-check';
import Test from './src/pages/RegisterSessionPage/Test';
import TestSettings from './src/pages/HistoryPage/TestSetting';
import TestSearchSessionsPage from './src/pages/SearchSessionsPage/TestSearchSession';
import MoreParticipant from './src/pages/RegisterSessionPage/MoreParticipant';
import GroupDetailPage from './src/pages/RegisterSessionPage/GroupDetailPage';


async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    messaging().getToken().then(token => {
      console.log('messaging.getToken: ', token);
    });
    messaging().onTokenRefresh(token => {
      console.log('messaging.onTokenRefresh: ', token);
    });
    // fcmUnsubscribe = messaging().onMessage(async remoteMessage => {
    //     Alert.alert(
    //       remoteMessage.notification.title,
    //       remoteMessage.notification.body,
    //     );
    //   });
    }
  }



const connectWebSocket = async () => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem('accessToken');
    // console.log(token);

    if (token) {
      // Decode the token to get the user ID
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id; // Adjust this according to your token's structure
      console.log('userId:', userId);

      // Create WebSocket connection using the user ID
      const socket = new WebSocket(`ws://ec2-18-181-213-23.ap-northeast-1.compute.amazonaws.com:8000/ws/notifications/${userId}/`);

      socket.onopen = function (event) {
        console.log('WebSocket connection opened:', event);
      };

      socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log('ok');
        console.log(data); // Your function to display the notification
        // sendLocalNotification(data);
      };

      socket.onerror = function (error) {
        console.error('WebSocket error:', error);
      };

      socket.onclose = function (event) {
        console.log('WebSocket connection closed:', event);
      };
    } else {
      console.error('No token found in AsyncStorage');
    }
  } catch (error) {
    console.error('Error connecting to WebSocket:', error);
  }
};

requestUserPermission();

connectWebSocket();
const Stack = createStackNavigator();

function App() {
  // useEffect(() => {
  //   // Check if the current version is outdated
  //   VersionCheck.getLatestVersion()
  //     .then(latestVersion => {
  //       const currentVersion = VersionCheck.getCurrentVersion();
        
  //       if (currentVersion !== latestVersion) {
  //         Alert.alert(
  //           '更新提醒',
  //           '有新的版本可以在App Store下載，請前去更新！',
  //           [
  //             {
  //               text: 'Update',
  //               onPress: () => {
  //                 // Redirect to App Store for iOS or Google Play for Android
  //                 Linking.openURL(VersionCheck.getStoreUrl());
  //               },
  //             },
  //             { text: 'Cancel' },
  //           ]
  //         );
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error checking app version', error);
  //     });
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TestSearchSessions">
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="Test" component={Test} options={{ headerShown: false }} />
        <Stack.Screen name="MoreParticipant" component={MoreParticipant} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterPage} options={{ headerShown: false }} />
        <Stack.Screen name="GroupDetailPage" component={GroupDetailPage} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoPage} options={{ headerShown: false }} />
        <Stack.Screen name="SearchSessions" component={SearchSessionsPage} options={{ headerShown: false }} />
        <Stack.Screen name="TestSearchSessions" component={TestSearchSessionsPage} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterSession" component={RegisterSessionPage} options={{ headerShown: false }} />
        <Stack.Screen name="Notification" component={Notification} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ headerShown: false }} />
        <Stack.Screen name="HostedHistory" component={HostedHistory} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterHistory" component={RegisterHistory} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyingRegister" component={VerifyingRegister} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ headerShown: false }} />
        <Stack.Screen name="GeneralProfile" component={GeneralProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Setting" component={Setting} options={{ headerShown: false }} />
        <Stack.Screen name="TestSetting" component={TestSettings} options={{ headerShown: false }} />
        <Stack.Screen name="BlockList" component={BlockList} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
