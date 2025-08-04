import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'


const data = [
  {key:'1', value:'Mobiles', disabled:true},
  {key:'2', value:'Appliances'},
  {key:'3', value:'Cameras'},
  {key:'4', value:'Computers', disabled:true},
  {key:'5', value:'Vegetables'},
  {key:'6', value:'Diary Products'},
  {key:'7', value:'Drinks'},
]

const default_styles = StyleSheet.create({
  box_style: {
    width: 80,
    height: 40,
  }
});

const DropdownComponent = ({placeholderName, setValue, dropdownData = data, styles = default_styles}) => {

  return(
    <SelectList 
        setSelected={(val) => setValue(val)} 
        data={dropdownData} 
        search = {false}
        boxStyles = {styles.box_style}
        placeholder={placeholderName}
        save="value"
    />
  )
};

export default DropdownComponent;

