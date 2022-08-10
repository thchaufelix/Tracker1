import React , { useContext, useState, useEffect } from 'react'
import { View,TouchableWithoutFeedback,Keyboard,Image,Text, StyleSheet,TouchableOpacity,TextInput } from 'react-native'
import * as constants from '../../global/constants'
import i18n from 'i18n-js'
import { MaterialIcons } from '@expo/vector-icons';



export default function Forget({navigation}){
    const [ username, setUsername ] = useState('')
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          () => {
            setKeyboardVisible(true); // or some other action
          }
        );
        const keyboardDidHideListener = Keyboard.addListener(
          'keyboardDidHide',
          () => {
            setKeyboardVisible(false); // or some other action
          }
        );
    
        return () => {
          keyboardDidHideListener.remove();
          keyboardDidShowListener.remove();
        };
      }, []);
    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex:1}}>
                <View style={[styles.container,{borderBottomRightRadius:50,borderBottomLeftRadius:50}]}>
                        <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backIcon}>
                            <MaterialIcons name="chevron-left" size={30} color="white" />
                        </TouchableOpacity>
                        <Image style={[styles.logo]} source={require('../../../assets/icon/icon.png')}  />
                        {/* <Text style={styles.logo}>Inspections</Text> */}
                        <View style={[styles.textBox]}>
                            <Text style={styles.header}>Cerebro</Text>
                            <Text style={styles.appName}> Tracker</Text>
                        </View>
                        <View style={[styles.formContainer]}>
                            <Text style={styles.forgetLabel}>{i18n.t("ForgetUsername")}</Text>
                            <TextInput
                                style={styles.userName}
                                onChangeText={(value)=>setUsername(value)}
                                value={username}
                                placeholder={i18n.t("Email")}
                                placeholderTextColor='white'
                            />
                            <TouchableOpacity style={[styles.forgetLabel,{backgroundColor:'#7ABBA3',borderRadius:5,marginTop:'5%',elevation:3}]}>
                                <Text style={styles.forgetBtn} >{i18n.t("Send")}</Text>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                <View style={{backgroundColor:'#FFFFFF',height:200,position:'absolute',bottom:0,width:'100%',zIndex:-1,justifyContent:'center'}}>
                    {/* <Image source={require('../../assets/icon/logo.png')} style={[styles.companyLogo]} /> */}
                    <Text style={[styles.copyright,{bottom:isKeyboardVisible?'0%':'10%'}]}>Cerebro Strategy Limited</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2E333A',
        flex:0.9
    },
    logo: {
        position: "absolute",
        alignSelf:'center',
       
        marginVertical: 100*constants.HeightRatio,
        
    },
    header: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'FO',
    },
    appName: {
        color: '#7ABBA3',
        fontSize: 27,
        // width: 270,
        fontFamily: 'FO',
    },
    textBox: {
        justifyContent: "center",
        position:'relative',
        flexDirection:'row',
        top:'60%',
        // left:'20%',
        alignItems: 'center',
    },
    companyLogo: {
        alignSelf: 'center',
        // opacity:1
    },
    copyright: {
        color: '#1E3957',
        fontSize: 14,
        alignSelf: 'center',
        fontFamily: 'R-M',
        marginVertical: 20*constants.HeightRatio,
        position:'absolute',
        bottom: '10%',
        // opacity: 0
    },
    formContainer:{
        // marginVertical:'70%',
        position:'relative',
        top:'35%',
        marginHorizontal:'15%'
    },
    backIcon:{
        zIndex:1,
        position:'absolute',
        top:'7%',
        left:'4%',
        backgroundColor:'rgba(52, 52, 52, 0.4)',
        borderRadius:30
    },
    userName:{
        borderRadius:5,
        // padding:10,
        fontFamily:'R-M' ,
        borderColor:'#FFFFFF',
        borderWidth:2,
        padding:'5%',
        marginHorizontal:'5%',
        color:'rgba(255, 255, 255, 1.0)',
        fontSize:15
      },
      forgetLabel:{
          marginHorizontal:'5%',
          marginVertical:'3%',
          color:'#FFFFFF',
          fontFamily:'R-M',
          fontSize:15
        },
        forgetBtn:{
            color:'#FFFFFF',
          fontFamily:'R-M',
          fontSize:15,
          alignSelf:'center',
          paddingVertical:'5%',
          letterSpacing:1
          
        }

})