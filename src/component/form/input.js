import React, {useContext, useState, useEffect, useRef} from 'react'
import {Input} from '@ui-kitten/components';
import * as constants from '../../global/constants'
import 'intl';
import 'intl/locale-data/jsonp/en';
import {MaterialIcons} from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  FlatList,
  TouchableOpacity
} from 'react-native';


const colorSchema = {
  textBasic: "#888",
  bgDisable: "rgba(200,200,200,0.6)",
  bdDisable: "#bbb"
}


export default function InputComponent(props) {
  const [isFocused, setIsFocused] = useState(false)
  // const [isSelected, setIsSelected] = useState(false)
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const [_animatedIsFocused] = useState(new Animated.Value(0))

  useEffect(() => {

    Animated.timing(_animatedIsFocused, {
      toValue: (isFocused || props.value !== '') ? 1 : 0,
      duration: 125,
      useNativeDriver: false
    }).start();

  }, [isFocused])


  // useEffect(()=>{
  //   if(isSelected){
  //     setIsSelected(false)
  //     const newFilterData = props.filterData.filter(subItem => !props.data.map(item=>item.id).includes(subItem.id) )
  //     console.log(newFilterData)
  //     props.setFilterData(newFilterData)
  //   }
  // },[isSelected])

  const labelStyle = {
    position: 'absolute',
    fontFamily: 'M-M',
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
            outputRange: [18, -11],
          })
      },
    ],
    opacity: _animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    color: (isFocused) ? (props.labelColor ? props.labelColor : '#FFF') : colorSchema.textBasic,
  };

  const styles = StyleSheet.create({
    inputBox: {
      height: (props.blockSize) ? props.blockSize : null,
      fontFamily: 'M-M',
      color: props.textColor ? props.textColor : '#FFF',
    },
  })

  // const renderItem = ({ item, index}) => {
  //   const pressHandler = (index) => { 
  //       // setIsSelected(true)
  //       if(!props.data.some(subItem=>subItem.id === item.id)){
  //         props.setData([...props.data,item])
  //       }

  //       // props.setFilterData([])
  //       // props.setSearch('')
  //       // var array = [...fileList]
  //       // setSelectedImage(index)
  //       // setIsVisible(true)
  //   }    

  //   return(
  //       <TouchableOpacity key={item.id+'_'+item.name_eng} style={{marginTop:'3%',flexDirection:'row'}} onPress={()=>pressHandler(index)}>
  //         <View style={{flex:0.2}}>
  //           <MaterialIcons name="add-circle" size={24} color="black" />
  //         </View>
  //         <View style={{flex:0.8,justifyContent:'center'}}>
  //           <Text style={{fontSize:14,fontFamily:'M-M',color:'#2E333A'}}>{item.name_eng}</Text>
  //         </View>
  //       </TouchableOpacity>
  //   )

  return (
    <>
      {props.disabled && props.value ? <Text style={[{
        color: colorSchema.textBasic,
        position: 'absolute',
        left: 13,
        top: 24,
        fontFamily: 'M-M',
        backgroundColor: (props.disabled) ? (props.bgColor ? props.bgColor : "#fff") : null,
        zIndex: 1
      }]}>{props.header}</Text> : null}
      <View style={{...props.style}}>
        <Input {...props}
               placeholder={isFocused ? ' ' : props.header}
               onFocus={handleFocus}
               style={{
                 backgroundColor: props.bgColor,
                 borderColor: (isFocused) ? props.borderColor : props.borderNormal
               }}
               onBlur={handleBlur}
               accessoryRight={props.rightAccessory ? (isFocused || props.value !== '' ? props.rightAccessory : null) : null}
               textStyle={styles.inputBox}
               editable={!(props.disabled)}
        />
        {props.filterData && props.filterData.length !== 0 ?
          <FlatList style={{
            position: 'absolute',
            width: '100%',
            elevation: 5,
            paddingHorizontal: '3%',
            zIndex: 100,
            backgroundColor: 'white',
            maxHeight: isFocused ? 130 : 300,
            top: 50,
            borderRadius: 5
          }} data={props.filterData} renderItem={props.renderItem} keyExtractor={item => item.id}/>
          : null}
        {props.disabled && props.value ? null :
          <Animated.Text style={labelStyle}>
            {props.header}
          </Animated.Text>
        }

      </View>
    </>
  );
}
