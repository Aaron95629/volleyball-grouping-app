import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const GroupBox = ({
    groupId,
    name,
    image,
    handleGroupPressed
  }) => {
    // Simplified NET_TYPE_MAPPING without redundant tuple keys
  
    return (
        <View style={styles.mainBox} >
            <Image source={{uri: image}} style={styles.image}/>
            <Text style={styles.title}>{name}</Text>
            <TouchableOpacity 
                style={styles.goButton}
                onPress={handleGroupPressed}
            >
                <Text style={styles.goText}>前往場次</Text>
            </TouchableOpacity>
        </View>
    );
  };
  
  export default GroupBox;
  
  // Stylesheet
  const styles = StyleSheet.create({
    mainBox: {
      height: 129,
      width: 171,
      borderRadius: 8,
      backgroundColor: "#FFDCA7",
      flexDirection: "column",
      alignItems: "flex-start",
      marginBottom: 10
    },
    image: {
        width: 171,
        height: 70,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    title: {
        fontSize: 19,
        fontWeight: "600",
        color: "black",
        marginLeft: 8,
        marginTop: 5
    },
    goButton: {
        backgroundColor: "#FFFCF6",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 19,
        width: 157,
        borderRadius: 5,
        marginLeft: 8,
        marginTop: 5
    },
    goText: {
        fontSize: 12,
    }
    
  });
    