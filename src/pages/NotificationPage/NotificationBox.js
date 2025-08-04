import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NotificationBox = ({ id, eventId, is_read, title, message, timestamp, handleNotificationPress }) => {

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading 0 if needed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.mainBox, is_read && styles.readBox]} 
      onPress={() => handleNotificationPress(id, eventId)}
    >
      <View style={styles.leftContainer}>
        <Text style={[styles.titleText, is_read && styles.readText]}>{title}</Text>
        <Text style={[styles.messageText, is_read && styles.readText]}>{message}</Text>
      </View>
      <Text style={[styles.timeStamp, is_read && styles.readText]}>{formatTimestamp(timestamp)}</Text>
    </TouchableOpacity>
  );
};

export default NotificationBox;

const styles = StyleSheet.create({
  mainBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 15,
    backgroundColor: "white",
  },
  readBox: {
    backgroundColor: "#f0f0f0", // Grayer background for read notifications
  },
  leftContainer: {
    flex: 4,
  },
  titleText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5, // Increased space between title and message
  },
  messageText: {
    fontSize: 14,  
    color: "#555",
  },
  readText: {
    color: "#aaa", // Grayer text for read notifications
  },
  timeStamp: {
    fontSize: 12,
    color: "#999",
    position: "absolute",
    top: 5,
    right: 10,
  },
});
