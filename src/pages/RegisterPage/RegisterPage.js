import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, Alert } from 'react-native';

const RegisterPage = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const handleRegisterButtonClick = () => {
        if (password !== rePassword) {
          Alert.alert("錯誤", "密碼不一樣，請重新輸入！");
        } else if (email === "") {
          Alert.alert("錯誤", "郵箱請勿留空!");
        } else if (password === "") {
          Alert.alert("錯誤", "密碼請勿留空!");
        } else {
          Alert.alert(
            "成功註冊！",
            "", 
            [
              {
                text: 'Ok',
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        }
      };
    
    return (
        <View style={styles.main_container}>
            <StatusBar backgroundColor="white" />
            <View style={styles.main_box}>
                <Text style={styles.title}>帳號註冊</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>帳號</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="請輸入您的email" 
                        placeholderTextColor="#aaa" 
                        onChangeText={setEmail}
                        value={email}
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
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>確認密碼</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="請再次輸入您的密碼" 
                        placeholderTextColor="#aaa" 
                        secureTextEntry={true} 
                        onChangeText={setRePassword}
                        value={rePassword}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleRegisterButtonClick}>
                    <Text style={styles.buttonText}>註冊</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RegisterPage;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0", // Light gray background
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
    }
});
