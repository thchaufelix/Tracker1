import React , { useContext, useState, useEffect, useRef } from 'react'
import {Input} from '@ui-kitten/components';
import { TouchableWithoutFeedback } from 'react-native';
import * as constants from '../../global/constants'
import 'intl';
import 'intl/locale-data/jsonp/en';
import { Autocomplete, AutocompleteItem, Icon } from '@ui-kitten/components'
import {
  View,
  StyleSheet,
  Animated,
  Text
} from 'react-native';


const colorSchema = {
  textBasic: "#888",
  bgDisable: "rgba(200,200,200,0.6)",
  bdDisable: "#bbb"
}

const filter = (item, query) => item.toLowerCase().includes(query.toLowerCase());

export default function AutoCompleteComponent(props) {
  const [value, setValue] = useState(null);
  const [data, setData] = useState(props.data);

  const onSelect = (index) => {
    setValue(data[index].code);
  };

  const onChangeText = (query) => {
    setValue(query);
    // console.log(props.data.filter(item =>console.log(item)))
    setData(props.data.filter(item => filter(item.code, query)));
  };

  const StarIcon = (props) => (
    <Icon {...props} name='add-circle' pack='material' color="black"/>
  );

  const clearInput = () => {
    setValue('');
    setData(props.data);
  };


  const renderOption = (item, index) => (
    <AutocompleteItem
      key={index}
      title={<Text style={{color:'#000000',fontFamily:'M-M',fontSize:16,paddingVertical:'10%'}}>{item.code}</Text>}
      accessoryLeft={StarIcon}
    />
  );

  const renderCloseIcon = (props) => (
    <TouchableWithoutFeedback onPress={clearInput}>
      <Icon {...props} name='close'/>
    </TouchableWithoutFeedback>
  );
 

  const [isFocused, setIsFocused] = useState(false)
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const _animatedIsFocused = new Animated.Value(!!props.value ? 1 : 0)

  useEffect(() => {
    Animated.timing(_animatedIsFocused, {
      toValue: (isFocused || !!props.value) ? 1 : 0,
      duration: 125,
      useNativeDriver: false
    }).start(); 
  }, [isFocused])

  const labelStyle = {
      position: 'absolute',
      fontFamily:'M-M',
      zIndex: _animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [-1, 1],
      }),

      backgroundColor: (props.disabled) ? null : props.bgColor ? props.bgColor : "#fff",
      paddingHorizontal: _animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [5, 2],
      }),
      transform: [
        {
          translateX: 10
        },
        {
          translateY:
            _animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [18, -9],
            })
        },
      ],
      opacity: _animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      color: (isFocused) ? (props.labelColor?props.labelColor:'#FFF') : colorSchema.textBasic,
    }
  ;

  const styles = StyleSheet.create({
    inputBox: {
      height: (props.blockSize) ? props.blockSize : null,
      fontFamily:'M-M',
      color:props.textColor?props.textColor:'#FFF',
     

    },
    
  })

  return (
    <>
      {props.disabled && props.value ? <Text style={[{color: colorSchema.textBasic,position:'absolute',paddingHorizontal:13,zIndex:1,paddingVertical:24,fontFamily:'M-M'}]}>{props.header}</Text> : null}
      <View style={{...props.style}}>
        <Autocomplete
         {...props}
          placeholder={isFocused?' ':props.header}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessoryRight={renderCloseIcon}
          style={{backgroundColor:props.bgColor, borderColor: (isFocused) ? props.borderColor: props.borderNormal}}
          onChangeText={onChangeText}
          textStyle={styles.inputBox}
          editable={!(props.disabled)}
          value={value}
          onSelect={onSelect}>
          <AutocompleteItem
      title={<Text style={{color:'#black'}}>123</Text>}
      accessoryLeft={StarIcon}
    />
      <AutocompleteItem
      title={<Text style={{color:'black'}}>234</Text>}
      accessoryLeft={StarIcon}
    />
        </Autocomplete>
     
        {props.disabled && props.value ? null :
          <Animated.Text style={labelStyle}>
            {props.header}
          </Animated.Text>
        }

      </View>
    </>
  );
}
