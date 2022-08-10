import React , { useContext, useState, useEffect } from 'react'
import { StyleSheet, TextInput, View, TouchableOpacity, Platform, Clipboard,Alert, Keyboard,ActivityIndicator, TouchableHighlight, TouchableWithoutFeedback } from 'react-native'
import { Formik } from 'formik'
import * as yup from 'yup'
import { Spinner,Text, Modal,Card} from '@ui-kitten/components';
import { Ionicons,MaterialIcons } from '@expo/vector-icons'
import * as LocalAuthentication from 'expo-local-authentication';
import * as constants from '../../global/constants'
import i18n from 'i18n-js'
import {globalStyles} from '../../global/style'
import { AppRoute } from '../../navigator/appRoutes'
// import {AccountContext} from '../../context/authContext'
// import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputComponent from '../../component/form/input'
import { AccountContext } from '../../Context/authContext';
import { NativeModules,NativeEventEmitter } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
// import Clipboard from '@react-native-community/clipboard';

const {IBeaconPlaygroundModule} = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(NativeModules.IBeaconModule);

export default function LoginForm({ navigation, logging }) {
  // const { t, locale, setLocale } = React.useContext(LocalizationContext);
  const [compatible, setCompatible] = useState(false)
  const [biometricRecords, setBiometricRecords] = useState(false)
  const [errorMsg , setErrorMsg ] = useState('')
  const {userData, checkAccount, fa2Login, firstLogin} = useContext(AccountContext)
  // const [ token, setToken ] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [ loading, setLoading ] = useState(false)
   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
   const [isConnected, setisConnected ] = useState(false)
   useEffect(() => {
    let unsubscribeConnListener = NetInfo.addEventListener((state) => {
      
      setisConnected(state.isInternetReachable || false);
    });

    return () => {
      unsubscribeConnListener();
    };
  }, []);
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
  // const [ isCopy, setIsCopy ] = useState(false)
  // const reviewSchema = yup.object({
  //     email: yup.string().email(i18n.t('InvalidEmail'))
  //     .required(i18n.t('EmptyEmail')),
  //     password: yup.string()
  //     .required(i18n.t('EmptyPassword')).min(constants.pwLength,i18n.t('minLength',{pwLength:constants.pwLength})),
  // })
  // const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
  useEffect(() => {
    checkDeviceForHardware()
    checkForBiometrics()
    // console.log(locale)
    // setLocale('zh')
  }, [])

  const checkDeviceForHardware = async () => {
    let compatible = await LocalAuthentication.hasHardwareAsync();
    // console.log(compatible)
    
    if (compatible) {
      setCompatible({ compatible });
    } 
  };

  const checkForBiometrics = async () => {
    let biometricRecords = await LocalAuthentication.isEnrolledAsync();
    setBiometricRecords(biometricRecords)
    // console.log(biometricRecords)
  };

  
    // const [logging, setLogging] = useState(false)
    const [pwOpen, setPwOpen] = useState(true)
    const [eyeIcon, setEye ] = useState('ios-eye')
    const [loginData, setLoginData] = useState(null)
    const [scanned, setScanned] = useState(false)

    
    const showProp = () => {
        setPwOpen(!pwOpen)
        setEye(eyeIcon === 'ios-eye' ? 'ios-eye-off' : 'ios-eye')
    }

    const getData = async (actions) => {
      try {
        const value = await AsyncStorage.getItem('@user_data')
        const result = JSON.parse(value)
        actions.resetForm()
        if(result){
            navigation.navigate(AppRoute.HOME)
            setLoading(false)
          // if(!firstLogin){
          //   navigation.navigate(AppRoute.HOME)
          //   setLoading(false)
          // }else{
          //   navigation.navigate(AppRoute.LINKHOME)
          //   setLoading(false)
          // }
        }else{
          setErrorMsg(i18n.t('WrongInfo'))
          setLoading(false)
          setIsVisible(true)
          actions.resetForm()
        }
       
      } catch(e) {
        setErrorMsg(i18n.t('WrongInfo'))
        setLoading(false)
        setIsVisible(true)
        actions.resetForm()

      }
      

    }
    
    const handlerSubmit = async (values, actions) => {
    //   console.log('hi')
      setLoading(true)
      if(isConnected){
        await checkAccount(values.username, values.password).then(async ()=>{
          await getData(actions)
      })
      }else{
        setErrorMsg(i18n.t('CheckInternet'))
        setLoading(false)
        setIsVisible(true)
      }
      
    }

    const getData2FA = async () => {
      try {
        const value = await AsyncStorage.getItem('@user_data')
        const result = JSON.parse(value)
        if(result){
          if(!firstLogin){
            navigation.navigate(AppRoute.HOME)
            setLoading(false)
          }else{
            navigation.navigate(AppRoute.LINKHOME)
            setLoading(false)
          }
        }
      } catch(e) {
        setLoading(false)
        setIsVisible(true)

      }
      

    }


    const read = async () => {   
      try {
        const credentials = await SecureStore.getItemAsync('userLoginData',{
          keychainService: "credentials",
      });
        // console.log('value of credentials: ', credentials);
  
        if (credentials) {
          const myJson = JSON.parse(credentials);
          const data = {
            username: myJson.username,
            password: myJson.password,
          }
          // console.log(data)
          return data
        }
      } catch (e) {
        // alert(e)
        const data = {
          email: '',
          password: '',
        }
        return data
      }
    };
    // const copyAction = () => {
    //   Clipboard.setString(token)
    //   setIsCopy(false)
    // }

    
    const handleLoginPress = async () => {
      if (biometricRecords){
        if (fa2Login){
          let result = await LocalAuthentication.authenticateAsync();
          
          if (result.success) {
            const data = await read()
            setLoading(true)
            if(netInfo.isConnected){
              await checkAccount(data.username.replace(' ',''), data.password).then(async ()=>{
                await getData2FA()
              })
          
            }else{
              setErrorMsg(i18n.t('CheckInternet'))
              setLoading(false)
              setIsVisible(true)
            }
        
          }
           else{
            // alert('Please enter your username and password!')
            setErrorMsg(i18n.t('WrongFA'))
            setIsVisible(true)
          }
        } else {
          const faMethod = Platform.OS === 'android'?'Touch ID':'Face ID'
          
          // alert('Please enable '+faMethod+' in app first!')
          setErrorMsg(i18n.t('EnableFA',{faMethod}))
          setIsVisible(true)
        }
        
        
      } else {
        const faMethod = Platform.OS === 'android'?'Touch ID':'Face ID'
        // alert('In order to use '+faMethod+'.Please set up your '+faMethod+' first!')
        setErrorMsg(i18n.t('SetUpFA',{faMethod}))
        setIsVisible(true)
      }
      
      
    }


    return (
        <View >
            <Formik
                // initialValues={{ username: 'nic.hung@cerebrohk.com', password: '123456'}}
                initialValues={{ username: '', password: ''}}
                // validationSchema={reviewSchema}
                onSubmit={(values, actions) => {handlerSubmit(values,actions)}}
            >
                {(props) => (
                    <TouchableOpacity style={{zIndex:5}} activeOpacity={1} onPress={Keyboard.dismiss}>
                      <View style={{flexDirection:'column'}}>
                          <View style={{paddingHorizontal:'8%'}}>
                            <InputComponent  
                                onChangeText={props.handleChange('username')}
                                value={props.values.username  } header={i18n.t("Email")} 
                                bgColor="#2E333A" 
                                borderColor="#73B2B8" 
                                labelColor="#73B2B8" 
                                blockSize={40} 
                                textColor="#98D4D4" 
                            />
                            <Text style={globalStyles.errorText}>{  props.errors.email}</Text>
                          </View>
                        <View style={{paddingHorizontal:'8%'}}>
                            <InputComponent 
                                onChangeText={props.handleChange('password')}
                                value={props.values.password} 
                                secureTextEntry={pwOpen} 
                                header={i18n.t("Password")} 
                                bgColor="#2E333A" 
                                blockSize={40}  
                                labelColor="#73B2B8" 
                                textColor="#98D4D4"
                                borderColor="#73B2B8" 
                                rightAccessory={<TouchableOpacity onPress={()=>showProp()} >
                                <Ionicons name={eyeIcon} size={25} color="white"  />
                                </TouchableOpacity>}
                            />
                            <Text style={globalStyles.errorText}>{ props.errors.password}</Text> 
                        </View>
                        {isKeyboardVisible?null:
                        <View style={{flexDirection:'row',width:'100%',alignSelf:'center'}}>
                            <TouchableOpacity onPress={props.handleSubmit} style={[styles.submitBtn,{backgroundColor:'#73B2B8',width:'60%',alignItems:'center'}]}>
                            {loading?<Spinner size='small'/>:
                             <Text style={[styles.btnContent]}>{i18n.t("Login")}</Text>}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={()=>handleLoginPress()}>
                            <MaterialIcons style={{opacity:compatible?1:0}}  name={Platform.OS==='android'?"fingerprint":'face'} size={35} color="white" style={styles.fingerIcon}/>
                          </TouchableOpacity>
                        </View>}
                        {/* <TouchableOpacity onPress={()=>IBeaconPlaygroundModule.startScanning()} style={[styles.submitBtn,{backgroundColor:'#73B2B8',width:'60%',alignItems:'center',marginTop:'5%'}]}>
                          
                             <Text style={[styles.btnContent]}>Start</Text>
                          </TouchableOpacity> */}
                        {/* <TouchableOpacity onPress={()=>navigation.navigate(AppRoute.FORGET)} style={{marginTop:20}}>
                            <Text style={{alignSelf:'center',color:"#FFFFFF",fontFamily:'M-R',fontSize:16}}>{i18n.t("Forget")}?</Text>
                        </TouchableOpacity> */}
                        
                      </View>

                        
                        
                    </TouchableOpacity>
                )}
            </Formik>
            <Modal
              visible={isVisible}
              backdropStyle={styles.backdrop}
              onBackdropPress={() => setIsVisible(false)}>
              <Card disabled={true} style={{marginHorizontal:'5%'}}>
                <Text style={{fontFamily:'M-R',color:'#98D4D4'}}>{errorMsg}</Text>
              </Card> 
            </Modal>
           
        </View>
    )
}

const styles = StyleSheet.create({
  userName:{
    borderRadius:5,
    // padding:10,
    fontFamily:'M-M' ,
    borderColor:'#FFFFFF',
    borderWidth:2,
    padding:20,
    marginHorizontal:35*constants.widthRatio,
    color:'rgba(255, 255, 255, 1.0)',
    fontSize:15
  },
  pwBox:{
    flexDirection:'row',
    borderWidth:2,
    borderColor:'#FFFFFF',
    marginHorizontal:35*constants.widthRatio,
    borderRadius:5
  },
  userPW:{ 
    width:'80%',
    borderRadius:5,
    fontFamily:'M-M' ,
    padding:20,
    color:'rgba(255, 255, 255, 1.0)',
    fontSize:15
  },
  pwIcon:{
    // marmargginRight:'15%'
  },
  submitBtn:{
    
    paddingHorizontal:'20%',
    paddingVertical: '3%',
    justifyContent:'center',
    marginLeft: 35*constants.widthRatio,
    borderRadius:5,
    borderWidth:0,
  },
  btnContent:{
    color:'#FFFFFF',
    fontFamily:'M-SB',
    fontSize:15,
    letterSpacing:2
  },
  fingerIcon:{
    borderRadius:5,
    borderColor:'#FFFFFF',
    borderWidth:1.5,
    paddingVertical:7.5*constants.HeightRatio,
    paddingHorizontal:15*constants.widthRatio,
    marginLeft:25*constants.widthRatio
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
})