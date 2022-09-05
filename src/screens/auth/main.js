import React, {useState, useEffect, useContext} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  TouchableOpacity
} from 'react-native'
import * as constants from '../../global/constants'
import i18n from 'i18n-js'
import axios from 'axios'
import {AccountContext2} from '../../Context/authContext2'
// import NetInfo from "@react-native-community/netinfo";
import {AppRoute} from '../../navigator/appRoutes'
import {Ionicons} from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {NotiContext} from '../../Context/notContext'
import {ScrollView} from 'react-native-gesture-handler'
import {PPBox} from './pp'


// function AnimatedComponent({type,style,children,functional,onFunc=null}){
//     if(type === 'View'){
//         return(
//             <Animated.View style={style} >
//                 {children}
//             </Animated.View>
//         )
//     }else if (type === 'Text'){
//         return(
//             <Animated.Text style={style} >
//                 {children}
//             </Animated.Text>
//         )
//     }else if (type === 'Image'){
//         return(
//             <Animated.Image style={style}  source={children}  />

//         )

//     }else{
//         return(
//             <></>
//         )
//     } 


// }


export default function SignInScreen({navigation}) {
  const AValue = 0
  const [headerAnimatedValue, setHeaderAnimatedValue] = useState(new Animated.Value(AValue))
  const [imageAnimatedValue, setImageAnimatedValue] = useState(new Animated.Value(AValue))
  const [logoOpacityValue, setLogoOpacityValue] = useState(new Animated.Value(AValue))
  const [copyRightAnimatedValue, setCopyRightAnimatedValue] = useState(new Animated.Value(AValue))
  const [formAnimatedValue, setFormAnimatedValue] = useState(new Animated.Value(AValue))
  const [btnAnimatedValue, setBtnAnimatedValue] = useState(new Animated.Value(AValue))
  const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(AValue))
  const [animatedBottom, setAnimatedBottom] = useState(new Animated.Value(AValue))
  const [animatedWarn, setAnimatedWarn] = useState(new Animated.Value(AValue))
  const [appOpacityValue, setAppOpacityValue] = useState(new Animated.Value(AValue))
  const {
    checkAccount,
    firstLogin,
    deviceData,
    versionData,
    setVersionData,
    setDeviceData,
    token,
  } = useContext(AccountContext2)
  const {loadConfig, config, setLoadConFig} = useContext(NotiContext)
  const [bgRadiusValue, setBGRadiusValue] = useState(1)
  const [bgColor, setBGColor] = useState('#2E333A')
  const [wordColor, setWordColor] = useState('#2E333A')
  const [show, setShow] = useState(false)
  const [isConnected, setisConnected] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const newDeviceData = {...deviceData}
    console.log(loadConfig, deviceData)
    if (config) {
      if (config.project_id !== deviceData.pj && config.project_id !== "") {
        setDeviceData({
          imei: newDeviceData.imei,
          series: newDeviceData.series,
          code: "",
          label: "",
          plant_id: '',
          remark: '',
          last_updated: '',
          tracker_id: newDeviceData.tracker_id,
          driver: [],
          image: [],
          wl: [],
          pj: config.project_id

        })
        setLoadConFig(true)

      } else if (config.project_id == "") {
        setDeviceData({
          imei: newDeviceData.imei,
          series: newDeviceData.series,
          code: "",
          label: "",
          plant_id: '',
          remark: '',
          last_updated: '',
          tracker_id: newDeviceData.tracker_id,
          driver: [],
          image: [],
          wl: [],
          pj: config.project_id

        })
        setLoadConFig(false)
      }

    }

  }, [config])


  const versionCheck = (token, imei, setModalVisible, setVersionData) => {

    axios({
      method: 'get', //you can set what request you want to be
      url: 'https://connect.cerebrohk.com' + '/api-connect/release-version/geturl',
      params: {
        "version": constants.systemVersion,
        "device_type": "tracker"
      },
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Token ' + token,
        'Fcm-Imei': imei
      }
    })
      .then((response) => {
        console.log(response.data)
        if (response.data.url) {
          setModalVisible(true)
          setVersionData(response.data)
        } else {

          // alert("This is the Latest Version")
        }
      }, (error) => {
        console.log(error.message)
        // ErrorDescription("upload", error.message)
      });
  }

  const handleUpgradePressed = () => {
    versionCheck("481a97e75b040e526305", deviceData.imei, setModalVisible, setVersionData, versionData)
    // setModalVisible(true)
    // IBeaconPlaygroundModule.writeLog("{\"testing\": \"HelloWorld\"}", false);
    // IBeaconPlaygroundModule.readLog((text) => console.log(text));

  }

  const handleConfirmPressed = () => {
    console.log('hi')
    WebBrowser.openBrowserAsync(versionData.url).then(r => setModalVisible(!modalVisible))
  }
  const ConformBox = () => <Modal transparent={true}
                                  visible={modalVisible}
                                  onRequestClose={() => {
                                    setModalVisible(!modalVisible);
                                  }}>
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>{i18n.t('NewV')}</Text>
        <Text style={styles.modalText2}>{versionData.version ? versionData.version : ""}</Text>
        <Text style={styles.modalText2}>{versionData.description ? versionData.description : ""}</Text>
        <TouchableOpacity onPress={() => handleConfirmPressed()} style={[styles.submitBtn2, {
          backgroundColor: '#73B2B8',
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: "20%"
        }]}>
          <Text style={[styles.data, {textAlign: 'center', alignSelf: 'center'}]}>{i18n.t('UPGRADE')}</Text>
        </TouchableOpacity>
      </View>
    </View>

  </Modal>


//     useEffect(() => {
//      let unsubscribeConnListener = NetInfo.addEventListener(async (state) => {
//        setisConnected(state.isInternetReachable || false);
//        if((state.isInternetReachable || false)&&!loadConfig ){
//         const notification = new NotifService((token)=>onRegister(token),(iNotification)=>onNotification(iNotification))
//         // const formData = {
//         //     "paired_staff_ids":deviceData.wl,
//         //     "paired_tracker_ids":[deviceData.tracker_id]
//         // }
//         // await axios.patch(constants.apiUri+'plant/'+ deviceData.id +'/updatepairing',formData,{
//         //     headers: {
//         //         Authorization: token    
//         //         },
//         //     }).then(async function (response){    
//         //         console.log(response.data)
//         //         reloadStaffList(token)


//         //     }).catch(
//         //         function (error) {
//         //          console.log(error.text)
//         //         })
//        }
//      });

//      return () => {
//        unsubscribeConnListener();
//      };
//    }, []);


  const animationDuration = 300
  const moveX1 = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });
  const moveY1 = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -175 * constants.HeightRatio],
  });
  const scale1 = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8 * constants.widthRatio]
  });

  const moveY2 = imageAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150 * constants.HeightRatio],
  });
  // const moveX2 = imageAnimatedValue.interpolate({
  //     inputRange: [0, 1],
  //     outputRange: [0,0],
  //     });
  const scale2 = imageAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.5 * constants.widthRatio]
  });


  const imageOpacity = logoOpacityValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const appOpacity = appOpacityValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const warnOpacity = animatedWarn.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });
  const imageOpacityStyle = {
    opacity: imageOpacity
  };

  const formOpacity = formAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  const formOpacityStyle = {
    opacity: formOpacity
  };

  const btnOpacity = btnAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });
  const btnOpacityStyle = {
    opacity: btnOpacity
  };

  const topHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [constants.windowHeight / 2 + 25, 0]
  });

  const botHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [constants.windowHeight / 1.5, 0]
  });

  const botRise = animatedBottom.interpolate({
    inputRange: [0, 1],
    outputRange: [-1000, -200]
  });


  // const btnOpacityStyle = {
  //     opacity: btnOpacity
  //     };

  const handleLogIn = async () => {
    const btnAction = Animated.timing(btnAnimatedValue, {
      toValue: 1,
      duration: animationDuration,
      easing: Easing.linear,
      useNativeDriver: true
    })

    const iconAction = Animated.timing(appOpacityValue, {
      toValue: 1,
      duration: 0,
      easing: Easing.linear,
      useNativeDriver: true
    })
    const viewAction = Animated.timing(animatedHeight, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    })

    const btnActionReverse = Animated.timing(btnAnimatedValue, {
      toValue: 0,
      duration: animationDuration,
      easing: Easing.linear,
      useNativeDriver: true
    })
    const viewActionReverse = Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false
    })

    const warnAction = Animated.timing(animatedBottom, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    })
    const disappearAction = Animated.timing(animatedWarn, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    })

    checkAccount().then(() => {
      btnAction.start(result => {
        setTimeout(() => {
          iconAction.start()

        }, 1000);
        viewAction.start(result2 => {
          if (loadConfig) {
            navigation.navigate(AppRoute.HOME)
            // console.log('hi')
            btnAnimatedValue.setValue(0)
            appOpacityValue.setValue(0)
            animatedHeight.setValue(0)
          } else {
            if (result2.finished) {
              warnAction.start(result => {
                if (result.finished) {
                  disappearAction.start(result2 => {
                    if (result2.finished) {
                      setTimeout(() => {
                        appOpacityValue.setValue(0)
                        animatedBottom.setValue(0)
                        animatedWarn.setValue(0)
                        btnActionReverse.start()
                        viewActionReverse.start()
                      }, 1000);

                    }
                  })

                }
              })
            }
          }


        })
      })


    })
  }


  // await checkAccount().then(async ()=>{
  //     if(loadConfig){
  //         btnAction.start(result=>{
  //                 viewAction.start(result2=>{
  //                     if(result2.finished){
  //                         if(firstLogin){
  //                             navigation.navigate(AppRoute.HOME)
  //                             btnAction.reset()
  //                             viewAction.reset()
  //                         }else{
  //                             navigation.navigate(AppRoute.LINKHOME)
  //                             btnAction.reset()
  //                             viewAction.reset()
  //                         }
  //                     }
  //                 })
  //         })

  //     }else{
  //         warnAction.start(result=>{
  //             if(result.finished){
  //                 disappearAction.start(result2=>{
  //                     if(result2.finished){
  //                         animatedBottom.setValue(0)
  //                         animatedWarn.setValue(0)
  //                         btnActionReverse.start()
  //                         viewActionReverse.start()
  //                     }
  //                 })

  //             }
  //         })
  //     }
  // })


  useEffect(() => {

    Animated.parallel([
      Animated.timing(headerAnimatedValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(imageAnimatedValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(logoOpacityValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(copyRightAnimatedValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(formAnimatedValue, {
        toValue: 1,
        duration: animationDuration,
        easing: Easing.ease,
        useNativeDriver: true
      }),

    ]).start()
    setTimeout(() => {
      setBGRadiusValue(40)
      setShow(true)
      setBGColor('#FFFFFF')
      setWordColor('#1E3957')
      handleUpgradePressed()
    }, animationDuration)

  }, [])
  return (
    <View style={{flex: 1, width: '100%', backgroundColor: 'white'}}>
      {show ?
        // <AnimatedComponent
        //     type={"View"}
        //     style={[{position:'absolute',zIndex:1,width:'100%',alignItems:'center',top:'40%'},btnOpacityStyle]}
        //     children={[<TouchableOpacity activeOpacity={1} onPress={()=>loadConfig?handleLogIn():null} style={[styles.submitBtn,{backgroundColor:loadConfig?'#73B2B8':'grey',alignItems:'center'}]}>
        //                 <Text style={[styles.btnContent]}>{i18n.t("Login")}</Text>
        //             </TouchableOpacity>]}
        // />
        // <AnimatedComponent
        // type={"View"}
        // style={[{position:'absolute',zIndex:1,width:'100%',alignItems:'center',top:'40%'},btnOpacityStyle]}

        // >
        //     <TouchableOpacity activeOpacity={1} onPress={()=>loadConfig?handleLogIn():null} style={[styles.submitBtn,{backgroundColor:loadConfig?'#73B2B8':'grey',alignItems:'center'}]}>
        //         <Text style={[styles.btnContent]}>{i18n.t("Login")}</Text>
        //     </TouchableOpacity>
        // </AnimatedComponent>
        <Animated.View
          style={[{position: 'absolute', zIndex: 1, width: '100%', alignItems: 'center', top: '40%'}, btnOpacityStyle]}>
          <TouchableOpacity activeOpacity={1} onPress={() => loadConfig ? handleLogIn() : null}
                            style={[styles.submitBtn, {
                              backgroundColor: loadConfig ? '#73B2B8' : 'grey',
                              alignItems: 'center'
                            }]}>
            {/* <TouchableOpacity activeOpacity={1} onPress={()=>handleLogIn()} style={[styles.submitBtn,{backgroundColor:loadConfig?'#73B2B8':'grey',alignItems:'center'}]}> */}
            <Text style={[styles.btnContent]}>{i18n.t("Login")}</Text>
          </TouchableOpacity>
        </Animated.View>
        : null}
      <View style={{flex: 1}}>

        {/* <AnimatedComponent
                    type={"View"} 
                    style={[styles.container,{borderBottomLeftRadius:bgRadiusValue,borderBottomRightRadius:bgRadiusValue,},{height:topHeight}]} 
                    value={[
                        <AnimatedComponent 
                            type={"Image"} 
                            style={[styles.logo,{transform:[{scale: scale2},{
                                translateY: moveY2}]},{opacity:appOpacity}]} 
                            value={require('../../assets/icon/icon.png')}
                        />,
                        <AnimatedComponent 
                            type={"Image"} 
                            style={[styles.logo,{transform:[{scale: scale2},{
                                translateY: moveY2}]},{opacity:appOpacity}]} 
                            value={require('../../assets/icon/icon.png')}
                        />,
                    ]}
                /> */}
        <Animated.View style={[styles.container, {
          borderBottomLeftRadius: bgRadiusValue,
          borderBottomRightRadius: bgRadiusValue,
        }, {height: topHeight}]}>
          <Animated.Image style={[styles.logo, {
            transform: [{scale: scale2}, {
              translateY: moveY2
            }]
          }, {opacity: appOpacity}]} source={require('../../../assets/icon/icon.png')}/>
          {/* <Text style={styles.logo}>Inspections</Text> */}
          <Animated.View style={[styles.textBox, {
            transform: [{scale: scale1}, {
              translateX: moveX1
            }, {translateY: moveY1}]
          }, {top: constants.windowWidth / 2 - 125 * constants.HeightRatio,}]}>
            <Animated.Text style={[styles.header, {opacity: appOpacity}]}>Cerebro</Animated.Text>
            <Animated.Text style={[styles.appName, {opacity: appOpacity}]}> Tracker</Animated.Text>
          </Animated.View>
          <Animated.View style={[styles.formContainer, formOpacityStyle]}>
            {/* <LoginForm navigation={navigation} logging={setLogging}/> */}

          </Animated.View>


        </Animated.View>

        <Animated.View style={[{
          backgroundColor: bgColor,
          position: 'absolute',
          width: '100%',
          bottom: 0,
          zIndex: -1,
          justifyContent: 'center'
        }, {height: botHeight}]}>
          <Animated.Image source={require('../../../assets/icon/logo.png')}
                          style={[styles.companyLogo, imageOpacityStyle]}/>
          <Animated.Text style={[styles.copyright, {color: wordColor}]}>Cerebro Strategy Limited</Animated.Text>
        </Animated.View>

        <Animated.View style={[{
          backgroundColor: bgColor,
          position: 'absolute',
          width: '100%',
          bottom: 0,
          zIndex: -1,
          justifyContent: 'space-between'
        }, {height: botHeight}]}>
          <Animated.Image source={require('../../../assets/icon/logo.png')}
                          style={[styles.companyLogo, imageOpacityStyle]}/>
          <Animated.Text style={[styles.copyright, {color: wordColor}]}>Cerebro Strategy Limited</Animated.Text>
          <Text style={[styles.copyright, {color: wordColor}, {marginBottom: 10}]}>IMEI: {deviceData.imei}</Text>
        </Animated.View>

        <Animated.View
          style={[{position: 'absolute', alignSelf: 'center', zIndex: 1001}, {bottom: botRise, opacity: warnOpacity}]}>
          <Ionicons style={{alignSelf: 'center'}} name="ios-close-circle" size={150} color="#7ABBA3"/>
          <Text style={[styles.copyright, {fontSize: 20}]}>{i18n.t('UAD')}</Text>
        </Animated.View>

      </View>

      {/* <ConformBox />      */}
      <PPBox/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E333A',
  },
  logo: {
    alignSelf: 'center',
    top: '30%',
    width: constants.windowWidth / 2 + 15,
    height: constants.windowWidth / 2,

  },
  header: {
    color: '#FFFFFF',
    fontSize: 30,
    fontFamily: 'FO',
  },
  appName: {
    color: '#7ABBA3',
    fontSize: 30,
    overflow: 'scroll',
    // width: 270,
    fontFamily: 'FO',
  },
  textBox: {
    justifyContent: "center",
    flexDirection: 'row',
    top: '30%',
    marginTop: 50 * constants.HeightRatio,

    // left:'20%',
    alignSelf: 'center',
  },
  companyLogo: {
    alignSelf: 'center',
    marginTop: '10%',
    height: 70,
    width: 65
    // opacity:1
  },
  copyright: {
    fontSize: 14,
    alignSelf: 'center',
    // justifyContent:'center',
    fontFamily: 'M-M'
    // opacity: 0
  },
  formContainer: {
    // marginVertical:'70%',
    position: 'relative',
    top: '25%',
  },
  submitBtn: {
    justifyContent: 'center',
    width: 150,
    height: 150,
    borderRadius: 150,
    // borderWidth:1,
    // borderColor: '#2E333A',
    elevation: 5
  },
  btnContent: {
    color: '#FFFFFF',
    fontFamily: 'M-SB',
    fontSize: 15,
    letterSpacing: 2
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "rgba(56, 56, 56, 1)",
    borderRadius: 18,
    padding: 35,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6
  },
  button: {
    marginTop: 10,
    borderRadius: 18,
    padding: 10,
    // elevation: 2
  },

  textStyle: {
    color: "rgba(150, 150, 150, 1)",
    fontWeight: "bold",
    fontFamily: 'M-M',
    fontSize: 20,
    textAlign: "center"
  },
  modalText: {
    color: "white",
    fontFamily: 'M-M',
    fontSize: 28,
    marginBottom: 15,
    textAlign: "center"
  },
  modalText2: {
    color: "white",
    fontSize: 18,
    fontFamily: 'M-M',
    marginBottom: 8,
    textAlign: "center"
  },
  submitBtn2: {

    paddingVertical: '5%',
    borderRadius: 5,
    borderWidth: 0,
  },
  data: {
    fontFamily: 'M-R',
    fontSize: 14,
    color: '#FFF',
    width: '60%'
  },

})