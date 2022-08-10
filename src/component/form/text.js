import React , { useContext, useState, useEffect, useRef } from 'react'
import * as constants from '../../global/constants'
import 'intl';
import 'intl/locale-data/jsonp/en';
import {
  View,
  StyleSheet,
  Text
} from 'react-native';


export default function TextComponent(props){
    if(props.itemvalue === 2){
        return(
            <View style={styles.MainViewerStyle}>
                <View style={styles.SubViewerStyle}>
                    <Text style={styles.labelFontStyle}>{props.values.label1}</Text>
                    <Text style={styles.dataFontStyle}>{props.values.value1}</Text>
                </View>
                <View style={styles.SubViewerStyle}>
                    <Text style={styles.labelFontStyle}>{props.values.label2}</Text>
                    <Text style={styles.dataFontStyle}>{props.values.value2}</Text>
                </View>
            </View>
        )
    }else{
        return(
            <View style={[styles.SubViewerStyle],{marginVertical:'2%',width:'100%'}}>
                <Text style={styles.labelFontStyle}>{props.values.label1}</Text>
                <Text style={[styles.dataFontStyle,{color:props.color?props.color:'black'}]}>{props.values.value1}</Text>
            </View>
        )
    }
   
}

const styles = StyleSheet.create({
    dataFontStyle:{
        fontSize:16,
        fontFamily:'roboto-medium',
        letterSpacing:0.5,
    },
    labelFontStyle:{
        fontFamily:'roboto',
        fontSize:12,
        color:'grey',
        letterSpacing:0.3,
    },
    SubViewerStyle:{
        flexDirection:'column',
        width:'45%'
    },
    MainViewerStyle:{
        flexDirection:'row',
        marginTop:'4%',
        // justifyContent:'space-between',
    }
})