import React , { useContext, useState, useEffect, useRef } from 'react'
import {Radio, RadioGroup} from '@ui-kitten/components';
import * as constants from '../../global/constants'
import {
  View,
  StyleSheet,
  Text
} from 'react-native';

export default function RadioComponent(props){
        const handleChange = (index,rowIndex) =>{
            const newSelectIndex = [...props.selectedIndex]
            newSelectIndex[rowIndex] = index
            props.setSelectedIndex(newSelectIndex)
        }
        return(
        <View>
            <View style={{marginVertical:'2%'}}>
                <Text style={styles.labelFontStyle}>Decision</Text>
                <RadioGroup
                    selectedIndex={props.selectedIndex[props.index]}
                    onChange={index => handleChange(index,props.index)}>
                   <Radio>
                        <Text style={{fontFamily:'roboto',color:'#262626',letterSpacing:0.3,fontSize:15}}>Approve</Text>
                    </Radio>
                    <Radio>
                        <Text style={{fontFamily:'roboto',color:'#262626',letterSpacing:0.3,fontSize:15}}>Reject</Text>
                    </Radio>
                    <Radio>
                        <Text style={{fontFamily:'roboto',color:'#262626',letterSpacing:0.3,fontSize:15}}>Return</Text>
                    </Radio>
                </RadioGroup>
            </View>
   
        </View>
        )
       
    
   
}


const styles = StyleSheet.create({
    dataFontStyle:{
        fontSize:16,
        fontFamily:'roboto-medium',
        letterSpacing:0.5,
    },
    labelFontStyle:{
        fontFamily:'roboto',
        fontSize:14,
        color:'grey',
        letterSpacing:0.3,
    },
    selectorLabel:{
        fontFamily:'roboto',
        color:'#000000',
        backgroundColor:'#FFFFFF',
        width:'15%',
        fontSize:12,
        position:'absolute',
        top:'-15%',
        zIndex:1,
        left:'2%',
        textAlign:'center',
      },
})