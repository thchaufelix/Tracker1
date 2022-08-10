import React , { useContext, useState, useEffect, useRef } from 'react'
import {Input} from '@ui-kitten/components';
import * as constants from '../../global/constants'
import 'intl';
import 'intl/locale-data/jsonp/en';
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


export default function NestInputComponent(props) {
  
  const [isFocused, setIsFocused] = useState(false)
  const handleFocus = () => {
      setIsFocused(true)};
  const handleBlur = () => {
      setIsFocused(false)};
  
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
              outputRange: [18, -8],
            })
        },
      ],
      opacity: _animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      color: (isFocused) ? '#28626D' : colorSchema.textBasic,
      fontSize:12
    }
  ;

  const styles = StyleSheet.create({
    inputBox: {
      height: (props.blockSize) ? props.blockSize : null,
      fontFamily:'roboto',
      color:'#262626',
      
      
    },
    
  })

  return (
    <>
      
      <View style={{...props.style}}>
        <Input
          {...props}
          style={{backgroundColor:props.bgColor ? props.bgColor : "#fff",}}
          placeholder={isFocused?' ':props.header}
          onFocus={handleFocus}
          onBlur={handleBlur}
        //   autoFocus={true}
          textStyle={styles.inputBox}
          editable={!(props.disabled)}
        />
        {props.disabled && props.value ? null :
          <Animated.Text style={labelStyle}>
            {props.header}
          </Animated.Text>
        }
        {/* {props.meta ? <Text style={{color: colorSchema.textBasic}}>{props.meta.error}</Text> : null} */}
      </View>
    </>
  );
}
