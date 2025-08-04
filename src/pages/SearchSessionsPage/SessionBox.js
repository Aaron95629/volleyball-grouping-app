// components/SessionBox.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const SessionBox = ({
  sessionId,
  name,
  location,
  time,
  spots_left,
  net,
  handleSessionPress,
  status,
  city,
}) => {
  // Simplified NET_TYPE_MAPPING without redundant tuple keys
  const NET_TYPE_MAPPING = {
    beach_volleyball: '沙灘排球',
    women_net_mixed: '女網混排',
    women_net_women: '女網女排',
    men_net_men: '男網男排',
    men_net_mixed: '男網混排',
    mixed_net: '人妖網',
  };

  const STATUS_MAPPING = {
    past: '已結束',
    open: '開放報名',
    playing: '進行中',
    waitlist: '候補中',
    canceled: '已取消',
  };

  const CITY_TYPE_MAPPING = {
    'unspecified': "未填寫縣市",
    'taipei': '臺北市',
    'new_taipei': '新北市',
    'taoyuan': '桃園市',
    'taichung': '臺中市',
    'tainan': '臺南市',
    'kaohsiung': '高雄市',
    'keelung': '基隆市',
    'hsinchu_city': '新竹市',
    'hsinchu_county': '新竹縣',
    'miaoli': '苗栗縣',
    'changhua': '彰化縣',
    'nantou': '南投縣',
    'yunlin': '雲林縣',
    'chiayi_city': '嘉義市',
    'chiayi_county': '嘉義縣',
    'pingtung': '屏東縣',
    'yilan': '宜蘭縣',
    'hualien': '花蓮縣',
    'taitung': '臺東縣',
    'penghu': '澎湖縣',
    'kinmen': '金門縣',
    'lienchiang': '連江縣',
};


  const getStatusTagStyle = (status) => {
    switch (status) {
      case 'open':
        return styles.statusTagOpen;
      case 'past':
        return styles.statusTagClosed;
      case 'waitlist':
        return styles.statusTagWaitlist;
      case 'playing':
        return styles.statusTagPlaying;
      case 'canceled':
        return styles.statusTagCancelled;
      default:
        return styles.statusTagDefault;
    }
  };

  const getPeopleSquareStyle = (status) => {
    if (status === 'waitlist') {
      return [styles.peopleSquare, styles.peopleSquareWaitlist];
    }
    return styles.peopleSquare;
  };

  return (
    <TouchableOpacity
      style={styles.mainBox}
      onPress={() => handleSessionPress(sessionId)}
      accessibilityLabel="Session Box"
      accessibilityHint="Navigates to the session details"
    >
      <View style={styles.leftContainer}>
        {/* Title Row */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{name}</Text>
        </View>

        {/* Tags Row */}
        <View style={styles.tagsContainer}>
          <View style={styles.netTag}>
            <Text style={styles.netTagText}>{NET_TYPE_MAPPING[net]}</Text>
          </View>
          <View style={[styles.statusTag, getStatusTagStyle(status)]}>
            <Text style={styles.statusTagText}>{STATUS_MAPPING[status]}</Text>
          </View>
        </View>

        {/* Time Row */}
        <View style={styles.timePriceContainer}>
          <Text style={styles.infoText}>{time}</Text>
        </View>

        {/* Location */}
        <Text style={styles.areaText}>{CITY_TYPE_MAPPING[city]} {location}</Text>
      </View>

      {/* Spots Left */}
      <View style={styles.rightContainer}>
        <View style={getPeopleSquareStyle(status)}>
          <Text style={styles.peopleText}>{spots_left}</Text>
        </View>
        <View style={styles.smallWord}>
          <Text>人</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SessionBox;

// Stylesheet
const styles = StyleSheet.create({
  mainBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    backgroundColor: 'white',
    position: 'relative',
  },
  leftContainer: {
    flex: 4,
  },
  rightContainer: {
    flexDirection: 'row', // Changed from column (default) to row
    alignItems: 'center', // Vertically centers the children
    justifyContent: 'center',
    marginRight: 10, // Adds spacing to the right
    marginTop: 20
  },
  titleContainer: {
    marginBottom: 5,
  },
  titleText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  netTag: {
    backgroundColor: '#ff7f50', // Tag background color
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10, // Adds space between the net tag and status tag
  },
  netTagText: {
    color: '#fff', // Tag text color
    fontSize: 14,
  },
  statusTag: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusTagText: {
    color: '#fff', // Tag text color
    fontSize: 14,
  },
  statusTagOpen: {
    backgroundColor: '#50c878', // Green for '開放報名'
  },
  statusTagClosed: {
    backgroundColor: '#ff4c4c', // Red for '已結束'
  },
  statusTagWaitlist: {
    backgroundColor: '#ffbf00', // Yellow for '候補中'
  },
  statusTagPlaying: {
    backgroundColor: '#1e90ff', // Blue for '進行中'
  },
  statusTagCancelled: {
    backgroundColor: 'gray', // Gray for '已取消'
  },
  statusTagDefault: {
    backgroundColor: '#888', // Default gray color
  },
  timePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },
  areaText: {
    fontSize: 14,
    color: '#555',
  },
  peopleSquare: {
    height: 45,
    width: 35,
    backgroundColor: '#50c878',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleSquareWaitlist: {
    backgroundColor: '#ffbf00', // Yellow for waitlist status
  },
  peopleText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  smallWord: {
    marginLeft: 5, // Added margin to space "人" from the spots_left number
    justifyContent: 'center',
    alignItems: 'center',
  },
});
  