import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';

const data = [
  { key: '1', value: '早班' },
  { key: '2', value: '中班' },
  { key: '3', value: '晚班' },
  { key: '4', value: '大夜班' },
];

const MutiSelectComponent = ({ placeholderName, inputData = data, setValue, date = false, setStartDate, setEndDate }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [startDate, setStartDateState] = useState('');
  const [endDate, setEndDateState] = useState('');

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const finishPressed = () => {
    setIsModalVisible(!isModalVisible);
    setValue(selectedItems);
  };

  const finishPressedDate = () => {
    setIsModalVisible(!isModalVisible);
    if (startDate !== '')  {
      setStartDate(formatDate(startDate));
    }
    else {
      setStartDate(startDate);
    }
    if (endDate !== '') {
      setEndDate(formatDate(endDate));
    }
    else {
      setEndDate(endDate);
    }
    console.log("Formatted Start Date:", formatDate(startDate));
    console.log("Formatted End Date:", formatDate(endDate));
  };

  const handleSelection = (itemKey) => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(itemKey)) {
        return prevSelectedItems.filter(key => key !== itemKey);
      } else {
        return [...prevSelectedItems, itemKey];
      }
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    setStartDateState(selectedDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    setEndDateState(selectedDate);
  };

  const resetDates = () => {
    setStartDateState('');
    setEndDateState('');
    setIsDatePickerVisible(false);
  };

  const renderItems = () => {
    return inputData.map(item => (
      <View key={item.key} style={default_styles.itemContainer}>
        <CheckBox
          value={selectedItems.includes(item.key)}
          onValueChange={() => handleSelection(item.key)}
        />
        <Text style={default_styles.itemText}>
          {item.value}
        </Text>
      </View>
    ));
  };

  return (
    <View>
      <TouchableOpacity style={default_styles.box_style} onPress={toggleModal}>
        <Text style={default_styles.placeholderText}>{placeholderName}</Text>
        <Image source={require('../../../assets/images/arrow_pointing_down_icon.png')} style={default_styles.icon} />
      </TouchableOpacity>

      {isModalVisible && !date && (
        <Modal transparent={true} animationType="slide">
          <View style={default_styles.modalContainer}>
            <View style={default_styles.modalContent}>
              <ScrollView style={default_styles.scrollContainer}>
                {renderItems()}
              </ScrollView>
              <View style={default_styles.buttonsContainer}>
                <TouchableOpacity style={default_styles.button} onPress={() => setSelectedItems([])}>
                  <Text style={default_styles.buttonText}>清除重選</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[default_styles.button, { marginLeft: 10 }]} onPress={finishPressed}>
                  <Text style={default_styles.buttonText}>確定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {isModalVisible && date && (
        <Modal transparent={true} animationType="slide">
          <View style={default_styles.modalContainer}>
            <View style={default_styles.modalContent}>
              <View style={default_styles.dateTimeContainer}>
                <Text style={default_styles.label}>開始日期</Text>
                <TouchableOpacity
                  style={default_styles.dateTimeButton}
                  onPress={() => setIsDatePickerVisible('startDate')}
                >
                  <Text style={default_styles.dateTimeButtonText}>
                    {startDate ? startDate.toLocaleDateString() : ""}
                  </Text>
                </TouchableOpacity>
                {isDatePickerVisible === 'startDate' && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}

                <Text style={default_styles.label}>結束日期</Text>
                <TouchableOpacity
                  style={default_styles.dateTimeButton}
                  onPress={() => setIsDatePickerVisible('endDate')}
                >
                  <Text style={default_styles.dateTimeButtonText}>
                    {endDate ? endDate.toLocaleDateString() : ""}
                  </Text>
                </TouchableOpacity>
                {isDatePickerVisible === 'endDate' && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
              </View>

              <View style={default_styles.buttonsContainer}>
                <TouchableOpacity style={[default_styles.button]} onPress={resetDates}>
                  <Text style={default_styles.buttonText}>重置</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[default_styles.button, { marginLeft: 10 }]} onPress={finishPressedDate}>
                  <Text style={default_styles.buttonText}>確定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default MutiSelectComponent;

const default_styles = StyleSheet.create({
  box_style: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    height: 40,
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: 14,
    color: 'gray',
    paddingRight: 5
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '50%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignSelf: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingLeft: 5
  },
  itemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  scrollContainer: {
    maxHeight: 200,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    height: 12,
    width: 12,
    opacity: 0.3
  },
  dateTimeContainer: {
    width: '100%',
    marginBottom: 10,
  },
  dateTimeButton: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 5,
    color: '#333',
  },
});
