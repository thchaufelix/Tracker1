import React , { useContext, useState, useEffect, useRef } from 'react'
import {Input , SelectGroup,Select,SelectItem} from '@ui-kitten/components';
import * as constants from '../../global/constants'
import 'intl';
import 'intl/locale-data/jsonp/en';
import { DownIcon,EmptyIcon} from '../../assets/icons'
import { MaterialIcons } from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  Animated,
  Text
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';


const colorSchema = {
  textBasic: "#888",
  bgDisable: "rgba(200,200,200,0.6)",
  bdDisable: "#bbb"
}


export default function SelectComponent(props) {
  const [isFocused, setIsFocused] = useState(false)
  const [borderColor, setBorderColor ] = useState()
  const handleFocus = () => setIsFocused(true)

  const handleBlur = () => setIsFocused(false)

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
              outputRange: [18, -17],
            })
        },
      ],
      opacity: _animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      color: (isFocused) ? '#28626D' : colorSchema.textBasic,
    }
  ;

  const styles = StyleSheet.create({
    inputBox: {
      height: (props.blockSize) ? props.blockSize : null,
      fontFamily:'roboto',
      color:'#262626'
    },
    
  })
  const selectorItem = props.data.map(item=>{
    const title = () => {
        return(
            <View style={{paddingHorizontal:'3%'}}>
                <Text style={{fontFamily:'roboto',color:'#262626'}}>{item}</Text>
            </View>
        )
    }
  return(
    <SelectItem  key={Math.random()} title={title} />
  )
  })

  const selectValue = (value)=> (
    <Text style={{fontFamily:'roboto-medium',color:'#262626',paddingHorizontal:'2%'}}>{value}</Text>
  )

  


  return (
    <>
      <View style={{...props.style,marginBottom:'6%'}}>
        <Select
          {...props}
          placeholder={props.header}
          status='control'
          // size='middle'
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessoryRight={props.value===''||props.value===props.header?DownIcon:EmptyIcon}
          style={{backgroundColor:props.bgColor ? props.bgColor : "#fff",borderColor:isFocused?'#1E3957':'rgba(0,0,0,0.1)',borderWidth:0.9,borderRadius:5}}
          value={<Text style={{color:props.color?props.color:'black',}}>{props.value===''?props.header:props.value}</Text>}
        >
            {props.selectGroup?props.selectGroup:selectorItem}
        </Select>
        {props.value && props.value === props.header ? null :
          <Animated.View style={[labelStyle,{height:'45%'}]}>
            <Text style={{position:'relative',top:'50%',fontSize:12}} >
            {props.header}
          </Text>
          </Animated.View>
          
        }

      </View>
    </>
  );
}
