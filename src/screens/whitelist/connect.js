import React, { useState, useRef, useEffect, useContext } from 'react'
import { View,Text, Image, StyleSheet, Platform, TouchableWithoutFeedback,TouchableOpacity, Keyboard, FlatList,Animated, ActivityIndicator, Easing,NativeEventEmitter,
  NativeModules,} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import i18n from 'i18n-js';
import * as constants from '../../global/constants'
import { CheckBox } from '@ui-kitten/components';
import InputComponent from '../../component/form/input'
import { Formik } from 'formik'
import axios from 'axios'
import { FontAwesome5 } from '@expo/vector-icons';
import { AccountContext } from '../../Context/authContext';
import {useKeepAwake} from "expo-keep-awake";
import NetInfo from "@react-native-community/netinfo";
import { AppRoute } from '../../navigator/appRoutes';
import { NotiContext } from '../../Context/notContext';

const {IBeaconPlaygroundModule} = NativeModules;


const useWalkBounceAnimation = (running,time,input,output) => {

    const val = React.useRef(new Animated.Value(0))
    const anim = React.useRef(
        Animated.loop(
            Animated.timing(val.current, {
                toValue: 1,
                duration: time,
                easing: Easing.linear,
                //start callback will never run with useNativeDriver: true!
                useNativeDriver: true,  
            }),
            
        )
    )


    const interpolatedOpacity = val.current.interpolate({
        inputRange: input,
        outputRange: output
    })

    //Start and stop the animation based on the value of the boolean prop
    React.useEffect(() => {
        if (running) {  
          anim.current.start((v) => {
          /**
           * 
           * BUG! This callback never runs when .stop() is called on a loop with useNativeDriver: true
           * Docs state that it shoud: https://reactnative.dev/docs/animated#start
           * 
           */
            })
        } else {
            anim.current.stop()
            val.current.setValue(0)
        }

        //Return a function from useEffect to stop the animation on unmount
        return () => anim.current.stop()
    }, [running])


    return [interpolatedOpacity]
}

function filterDataProcess(data,staffList){
    const scannedData = Object.values(data).filter(item=>item.inRange).map(item=>item.detail)
    // console.log(scannedData)

    // const filterData = scannedData.map(item=>({
    //     ...item,
    //     checked:false
    // }))
    const filterData = staffList.filter(item=>{
        if(scannedData.some(data=> data.UUID === item.uuid) && scannedData.some(data=> data.major === item.major) && scannedData.some(data=> data.minor === item.minor)){
            return true
        }else{
            return false
        }
    })
    // console.log(filterData)

    return filterData.map(item=>({
        ...item,
        checked:false
    }))
}


export default function ConnectScreen({navigation,route}){
    useKeepAwake()

    // const isFocused = useIsFocused()
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const { deviceData, token, staffList, reloadStaffList, onCarList, bData,setOnCarList,setDeviceData } = useContext(AccountContext)
    const { config } = useContext(NotiContext)
    const authToken = 'Token '+token
    const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(0))
    const [ animatedSize, setAnimatedSize ] = useState(new Animated.Value(0))
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false)
    const [loadingDot, setLoadingDot ] = useState(false)
    const animationDuration = 200;
    const [ paired, setPaired ] = useState([])
    const [ filterData, setFilterData ] = useState([])
    const [ search, setSearch ] = useState('')  
    const [ scannedData , setScannedData ] = useState({})
    const [isConnected, setisConnected ] = useState(false)

    useEffect(()=>{
        const newDeviceData = {...deviceData}
        console.log(config)
        if(config){
            reloadStaffList(authToken)
            if (config.project_id === deviceData.pj){
                if (config.pf_id){
                    if(  deviceData.plant_id === config.pf_id){
                        if(config.wwl_include_staff){
                            axios.get(constants.plantApi+'/'+deviceData.plant_id ,{
                                headers: {
                                    Authorization: authToken,
                                    "Fcm-Imei":deviceData.imei
                                    },
                            }).then(async function (PlantData){
                                console.log(PlantData.data)
                                if(PlantData.data.paired_staff.length>0){
                                    console.log(PlantData.data.paired_staff)
                                    setOnCarList(PlantData.data.paired_staff)
                                    navigation.navigate(AppRoute.RT,{screen:AppRoute.RTC})
                                }
                              

                            })
            
                        }else{
                            navigation.navigate(AppRoute.WLNAV,{screen:AppRoute.WLNAV})
                        }
                    }else{
                        const newDeviceData = {...deviceData}
                        axios.get(constants.deviceApi ,{
                            params:{
                                paired_staff__isnull:true,
                                imei:deviceData.imei
                            },headers: {
                                Authorization: authToken,
                                "Fcm-Imei":deviceData.imei
                                },
                        }).then(async function (DeviceData){
                            const plantData = DeviceData.data[0].paired_plant[0]
                            newDeviceData.plant_id = plantData.id
                            newDeviceData.label = plantData.label
                            newDeviceData.code = plantData.code
                            newDeviceData.remark = plantData.remark
                            newDeviceData.image = plantData.img.map(item=>item.img)
                            newDeviceData.last_updated = plantData.updated_at
                            setDeviceData(newDeviceData)
                        })
                        navigation.navigate(AppRoute.WLNAV,{screen:AppRoute.WLNAV})
                        
                    }
                    
                }else{
                    setDeviceData({
                        imei:newDeviceData.imei,   
                        series:newDeviceData.series,
                        code: "",
                        label: "",
                        plant_id:'',
                        remark:'',
                        last_updated:'',  
                        tracker_id:newDeviceData.tracker_id,
                        driver:[],
                        image:[],
                        wl:[],
                        pj:newDeviceData.pj
                
                    })
                    navigation.navigate(AppRoute.LINKAGE,{screen:AppRoute.LINKAGE})
                }
            }else{
                setDeviceData({
                    imei:newDeviceData.imei,   
                    series:newDeviceData.series,
                    code: "",
                    label: "",
                    plant_id:'',
                    remark:'',
                    last_updated:'',  
                    tracker_id:newDeviceData.tracker_id,
                    driver:[],
                    image:[],
                    wl:[],
                    pj:config.project_id?config.project_id:''
            
                })
                
                navigation.navigate(AppRoute.AUTH,{screen:AppRoute.SIGNIN})
            }
            
        }
      
    },[config])

    useEffect(() => {
        setPaired([])
        // getNewConfig2()
        closeFilter()
        let unsubscribeConnListener = NetInfo.addEventListener(async    (state) => {
            if(state.isInternetReachable || false){
                const formData = {
                    "paired_staff_ids":deviceData.wl,
                    "paired_tracker_ids":[deviceData.tracker_id]
                }
                await axios.patch(constants.plantApi+'/'+ deviceData.plant_id +'/updatepairing?filter=tracker',formData,{
                    headers: {
                        Authorization: token,
                        "Fcm-Imei":deviceData.imei
                        },
                    }).then(async function (response){
                        console.log(response.data)
                        reloadStaffList(token)
                      
        
                    }).catch(
                        function (error) {
                         console.log(error.text)
                        })
            }
           setisConnected(state.isInternetReachable || false);
         });
     
        const keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          () => {
            keyboardWillShow(); // or some other action
          }
        );
        const keyboardDidHideListener = Keyboard.addListener(
          'keyboardDidHide',
          () => {
            keyboardWillHide(); // or some other action
          }
        );
    
        return () => {
          keyboardDidHideListener.remove();
          keyboardDidShowListener.remove();
          unsubscribeConnListener();

        };
    }, []);

  

    useEffect(() => {
        if(loading){
            const id2 = setInterval(() => {
                setLoadingDot(loadingDot => !loadingDot)
              
                }, 600)
                return () => clearInterval(id2)
        }
     
    },[loading])


    useEffect(()=>{
        // console.log(scannedData)
        const filterData = filterDataProcess(scannedData,staffList)
        const oldPaired = [...paired]
        const newFilterData = filterData.filter(item=>!oldPaired.map(subItem=>subItem.id).includes(item.id))
        const newPaired = [...oldPaired,...newFilterData]
        setPaired(newPaired)
        console.log(newPaired)
    
    },[scannedData])
  
    useEffect(()=>{
        // console.log(new Date())
        setScannedData(bData)
    },[bData])

  
 

   
    const [opacity1] = useWalkBounceAnimation(loadingDot,450,[0,1],[1,0])
    const [opacity2] = useWalkBounceAnimation(loadingDot,500,[0,1],[1,0])
    const [opacity3] = useWalkBounceAnimation(loadingDot,550,[0,1],[1,0])
    const handleCloseConnect = () => {
        if(!isKeyboardVisible){
            if(expanded){
                toggleDropdown()
                closeFilter()
                // setChecked([])
                setPaired([])
                // IBeaconPlaygroundModule.stopScanning()
                IBeaconPlaygroundModule.updateConfig(JSON.stringify({"as":"0"}))

            }
        }
        Keyboard.dismiss()

       
       
    }
    const toggleDropdown = () => {
        // getNewConfig2()
        if (expanded == true) {
            
            Animated.timing(animatedHeight, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver:false
            }).start()
            setPaired([])
            setTimeout(() => {
                setExpanded(!expanded)
            }, animationDuration)
        } else {
            setExpanded(!expanded)
            // expand dropdown

            Animated.timing(animatedHeight, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver:false
            }).start()
        }
    }

    const interpolatedHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '62.5%']
    })
    const moveX1 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -120*constants.windowWidth*0.003],
      });

    const moveY2 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,-100-constants.windowHeight*0.3],
      });

      const moveX3 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, constants.windowWidth*0.3],
      });
  
    const moveY3 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,-constants.windowHeight*0.28],
      });

  
      const moveY1 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,-constants.windowHeight*0.6],
      });

      const scale1 = animatedHeight.interpolate({
        inputRange: [0, 1], 
        outputRange: [1,0.5]
      });

      const scale2 = animatedSize.interpolate({
        inputRange: [0, 0.5,1], 
        outputRange: [1,0.75,0.5]
      });


      const moveY4 = animatedSize.interpolate({
        inputRange: [0, 1], 
        outputRange: [0,-constants.windowHeight*0.3]
      });

    const formOpacity = animatedHeight.interpolate({
        inputRange: [0,1],
        outputRange: [1,0]
        });

    const bottomMove =  animatedSize.interpolate({
        inputRange: [0,1], 
        outputRange: ['0%','10%']
      });

    const DisableOpacity = animatedHeight.interpolate({
        inputRange: [0,1],
        outputRange: [0,1]
        });

    const closeFilter = () => {
        setFilterData([])
        setSearch('')
    }

    const keyboardWillShow = () => {
        setKeyboardVisible(true)
        Animated.timing(animatedSize, {
            toValue: 1,
            useNativeDriver:false
          }).start();
    }

    const keyboardWillHide = () => {
        setKeyboardVisible(false)
        Animated.timing(animatedSize, {
                toValue: 0,
            useNativeDriver:false
          }).start();
    }
        

    const handleSubmit = async () => {
        if (paired.length>0){
            setLoading(true)
            setLoadingDot(true)
            setPaired([])
            setScannedData([])
            // IBeaconPlaygroundModule.stopScanning();
            // if(isConnected){
                await axios.get(constants.apiUri+'device/'+deviceData.tracker_id+'/getwhiteliststaff',{
                    headers: {  
                        Authorization: authToken,
                        "Fcm-Imei":deviceData.imei
                        },
                    }).then(async function (response){
                        console.log(response.data)
                        if(response.data.length>0){
                            const loginList = paired.filter(item=>item.checked && !response.data.map(item=>item.id).includes(item.id)).map(item=>item.id)
                            const whitelist =[...response.data.map(item=>item.id),...loginList]
                            console.log(constants.plantApi+'/'+deviceData.plant_id)
                            await axios.get(constants.plantApi+'/'+deviceData.plant_id,{
                                headers: {
                                    Authorization: authToken,
                                    "Fcm-Imei":deviceData.imei
                                    },
                                }).then(async function (plantData){
                                    // console.log(response.data)
                                    console.log(plantData.data.trackers)
                                   
                                    const formData = {
                                        "paired_staff_ids":whitelist,
                                        "paired_tracker_ids":plantData.data.trackers.includes(deviceData.tracker_id)?plantData.data.trackers:[deviceData.tracker_id,... plantData.data.trackers]
                                    }
                                    console.log('in1')
                                    await axios.patch(constants.apiUri+'plant/'+ deviceData.plant_id +' /updatepairing?filter=tracker',formData,{
                                        headers: {
                                            Authorization: authToken,
                                            "Fcm-Imei":deviceData.imei
                                            },
                                        }).then(async function (response){
                                            // getNewConfig2()
                                            handleCloseConnect()
                                            console.log(response.data)
                                            const newDeviceData = {...deviceData}
                                            newDeviceData.wl = whitelist
                                            console.log(newDeviceData)
                                            setDeviceData(newDeviceData)
                                            setLoading(false)
                                            setOnCarList(paired.filter(item=>item.checked).map(item=>{
                                                const newItem = {...item}
                                                newItem.checked = false
                                                return newItem
                                            }))
                                        //    setLoadingDot(false)
                                        //    setLogin(true)
                                           toggleDropdown()
                                           navigation.navigate(AppRoute.RT,{screen:AppRoute.RTC})
        
                                           
                            
                                        }).catch(
                                            function (error) {
                                             console.log(error.text)
                                             setLoading(false)
                                             setLoadingDot(false)
                                            })
                                   
                                })
                           
                        
                        }else{
                            const loginList = paired.filter(item=>item.checked).map(item=>item.id)
                            await axios.get(constants.plantApi+'/'+deviceData.plant_id,{
                                headers: {
                                    Authorization: authToken,
                                    "Fcm-Imei":deviceData.imei
                                    },
                                }).then(async function (plantData){
                                    console.log(plantData.data.trackers)
                                   
                                    const formData = {
                                        "paired_staff_ids":loginList,
                                        "paired_tracker_ids":plantData.data.trackers.includes(deviceData.tracker_id)?plantData.data.trackers:[deviceData.tracker_id,... plantData.data.trackers]
                                    }
                                    console.log('in1')
                                    await axios.patch(constants.apiUri+'plant/'+ deviceData.plant_id +' /updatepairing?filter=tracker',formData,{
                                        headers: {
                                            Authorization: authToken,
                                            "Fcm-Imei":deviceData.imei
                                            },
                                        }).then(async function (response){
                                            // getNewConfig2()
                                            handleCloseConnect()
                                            console.log(response.data)
                                            const newDeviceData = {...deviceData}
                                            newDeviceData.wl = whitelist
                                            console.log(newDeviceData)
                                            setDeviceData(newDeviceData)
                                            setLoading(false)
                                            setOnCarList(paired.filter(item=>item.checked).map(item=>{
                                                const newItem = {...item}
                                                newItem.checked = false
                                                return newItem
                                            }))
                                        //    setLoadingDot(false)
                                        //    setLogin(true)
                                           toggleDropdown()
                                           navigation.navigate(AppRoute.RT,{screen:AppRoute.RTC})
        
                                           
                            
                                        }).catch(
                                            function (error) {
                                             console.log(error.text)
                                             setLoading(false)
                                             setLoadingDot(false)
                                            })
                                   
                                })
                          
                        }
                      
                        
                    })  
            // }else{
            //     const loginList = paired.filter(item=>item.checked && !deviceData.wl.map(item=>item.id).includes(item.id)).map(item=>item.id)
            //     const whitelist =[...deviceData.wl.map(item=>item.id),...loginList] 
            //     const newDeviceData = {...deviceData}
            //     newDeviceData.wl = whitelist
            //     setDeviceData(newDeviceData)
            //     setLoading(false)
            //     setOnCarList(paired.filter(item=>item.checked).map(item=>{
            //         const newItem = {...item}
            //         newItem.checked = false
            //         return newItem
            //     }))
            //     setLoadingDot(false)
            //     setLogin(true)
            //     toggleDropdown()
            //     setPaired([])
            //     closeFilter()
            //     navigation.navigate("WLNav",{screen:'RTC'})

            // }
            
            // const formData = {
            //     "paired_staff_ids":paired.map(item=>item.id),
            //     "paired_tracker_ids":[deviceData.tracker_id]
            // }
            // await axios.patch(constants.apiUri+'plant/'+ deviceData.id +'/updatepairing',formData,{
            //     headers: {
            //         Authorization: token
            //         },
            //     }).then(async function (response){
            //         // console.log(response.data)
            //         setLoading(false)
            //         setOnCarList(paired)
            //        setLoadingDot(false)
            //        setLogin(true)
            //        IBeaconPlaygroundModule.stopScanning();
            //        setPaired([])
            //        toggleDropdown()
            //        setScannedData([])
            //        navigation.navigate("WLNav",{screen:'RTC'})
    
            //     }).catch(
            //         function (error) {
            //          console.log(error.text)
            //         })
        }else{
            alert(i18n.t('atLessOne'))
        }
       
    }

    const handleConnect = () => {
        toggleDropdown()
        IBeaconPlaygroundModule.updateConfig(JSON.stringify({"as":"1"}))
        if(isConnected){
            reloadStaffList(authToken)
        }
        // IBeaconPlaygroundModule.startScanning();

    }

    const renderItem = ({ item, index}) => {
        const pressHandler = async (index) => { 
            const oldPaired = [...paired]
            const dataIndex = oldPaired.findIndex(subItem=>subItem.id === item.id)
            const popData = [...oldPaired].slice(dataIndex,(dataIndex+1))[0]
            popData.checked = !item.checked
            if(item.checked){
                const others =  [...oldPaired.slice(0,dataIndex),...oldPaired.slice(dataIndex+1)]
                setPaired([popData,...others])
                if (search!==''){
                    const newOthers = others.filter(item=>item.name_eng.toLowerCase().startsWith(search.toLowerCase()))
                    setFilterData([popData,...newOthers])
                }
            }else{
                const others =  [...oldPaired.slice(0,dataIndex),...oldPaired.slice(dataIndex+1)]
                setPaired([...others,popData])
                if (search!==''){
                    const newOthers = others.filter(item=>item.name_eng.toLowerCase().startsWith(search.toLowerCase()))
                    setFilterData([...newOthers,popData])
                }
            }
            // console.log(item)
            // setLoading(true)
            // setLoadingDot(true)
            // setSelected(item.name_eng)
            // await axios.get(constants.apiUri+'device/'+deviceData.tracker_id+'/getwhiteliststaff',{
            //     headers: {
            //         Authorization: token
            //         },
            //     }).then(async function (response){
            //        const oldWhiteList = response.data.map(item=>item.id)
            //        const newWhiteList = oldWhiteList.includes(item.id)?oldWhiteList:[...oldWhiteList,item.id]
            //         const formData = {
            //             "paired_staff_ids":newWhiteList,
            //             "paired_tracker_ids":[deviceData.tracker_id]
            //         }
            //         await axios.patch(constants.apiUri+'plant/'+deviceData.id+'/updatepairing',formData,{
            //         headers: {
            //             Authorization: token
            //             },
            //         }).then(async function (response){
            //            setLoading(false)

            //            setLoadingDot(false)
                        
            //         })
            //     })
           
        }    
        
        return(     
            <TouchableOpacity key={item.id} style={{marginTop:'3%',flexDirection:'row',justifyContent:'space-between'}} onPress={()=>pressHandler(index)}>
                <View style={{flexDirection:'row'}}>
                    <Image style={styles.icon} source={require('../../../assets/icon/user-hard-hat-solid.png')} />
                    <Text style={{fontSize:14,fontFamily:'M-M',color:'#2E333A',marginLeft:'20%',alignSelf:'center'}}>{item.name_eng}</Text>
                </View>

                <CheckBox
                    checked={item.checked}
                    onChange={nextChecked => {
                        const oldPaired = [...paired]
                        const dataIndex = oldPaired.findIndex(subItem=>subItem.id === item.id)
                        const popData = [...oldPaired].slice(dataIndex,(dataIndex+1))[0]
                        popData.checked = !item.checked
                        if(item.checked){
                            const others =  [...oldPaired.slice(0,dataIndex),...oldPaired.slice(dataIndex+1)]
                            setPaired([popData,...others])
                            if (search!==''){
                                const newOthers = others.filter(item=>item.name_eng.toLowerCase().startsWith(search.toLowerCase()))
                                setFilterData([popData,...newOthers])
                            }
                        }else{
                            const others =  [...oldPaired.slice(0,dataIndex),...oldPaired.slice(dataIndex+1)]
                            setPaired([...others,popData])
                            if (search!==''){
                                const newOthers = others.filter(item=>item.name_eng.toLowerCase().startsWith(search.toLowerCase()))
                                setFilterData([...newOthers,popData])
                            }
                        }
                        }}
                    >
                    </CheckBox>
                {/* <TouchableOpacity  onPress={() => removePairedData(index)} >
                    <FontAwesome5 name="trash-alt" size={20} color="#2E333A" />
                </TouchableOpacity> */}
            </TouchableOpacity>
        )
    }

//    const removePairedData = (index) => { 
//         const newData = [...paired.slice(0,index),...paired.slice(index+1)]
//         setPaired(newData)
//     }    



    const NavigationDrawerStructure = (props) => {
        //Structure for the navigatin Drawer
        const toggleDrawer = () => {
          //Props to open/close the drawer
          props.navigationProps.toggleDrawer();
        };
      
        return (
            <MaterialIcons onPress={toggleDrawer} name="menu" size={24} color="white" style={{marginLeft:15}}/>
        );
      };


        return(
            <View style={{flex:1}}>
                <View style={{flex:0.1,backgroundColor:'#2E333A'}}>
                    <View style={{flexDirection:'row',position:'absolute',bottom:0,zIndex:100}}>
                        <View style={{flex:0.3}}>
                            <NavigationDrawerStructure navigationProps={navigation}/>
                        </View>
                        <View style={{flex:0.6,flexDirection:'row'}}>
                            <Text style={styles.header}>Cerebro</Text>
                            <Text style={styles.appName}>  Tracker</Text>
                        </View>
                    </View>
                </View>
                <TouchableWithoutFeedback onPress={()=>handleCloseConnect()}>
                    <View style={{flex:0.6,backgroundColor:'#2E333A',justifyContent:'center'}}>   
                        <Animated.View style={[{flex:0.25,alignSelf:'center'},{opacity:formOpacity}]}>
                            <Text style={{fontFamily:'M-M',color:'#98D4D4',fontSize:14,alignSelf:'center'}}>{i18n.t('Plant')}</Text>
                            <Text style={{fontFamily:'M-SB',color:'white',fontSize:18}}>{deviceData.label} ({deviceData.code})</Text>
                        </Animated.View>
                        <Animated.View style={[{alignItems:'center',flexDirection:'row',justifyContent:'center',flex:0.65},{transform:[{scale:scale2},{translateY: moveY4}]}]}>
                            <Animated.View style={[{height:275,width:275,borderWidth:2,borderColor:'rgba(115,178,184,0.6)',borderRadius:275,position:'absolute'},{opacity:formOpacity}]}></Animated.View>
                            <Animated.View style={[{height:225,width:225,borderWidth:2,borderColor:'rgba(115,178,184,0.3)',borderRadius:225,position:'absolute'},{opacity:formOpacity}]}></Animated.View>
                            <Animated.View style={[{height:175,width:175,borderWidth:2,borderColor:'rgba(115,178,184,0.15)',borderRadius:175,position:'absolute'},{opacity:formOpacity}]}></Animated.View>
                            <Animated.View style={[{height:125,width:125,borderWidth:2,borderColor:'rgba(115,178,184,0.1)',borderRadius:125,position:'absolute'},{opacity:formOpacity}]}></Animated.View>
                            <Animated.View style={[{height:75,width:75,borderWidth:2,borderColor:'rgba(115,178,184,0.1)',borderRadius:75,position:'absolute'},{opacity:formOpacity}]}></Animated.View>
                            <Animated.View style={[{height:175*constants.widthRatio,width:175*constants.widthRatio,borderWidth:2,borderColor:'#98D4D4',borderStyle:'dashed',borderRadius:175*constants.widthRatio,position:'absolute',top:-98},{opacity:DisableOpacity}]}></Animated.View>
                            <Animated.Image style={[{zIndex:100},{transform: [{scale: scale1},{translateY: moveY1},{translateX: moveX1}]}]} source={require('../../../assets/image/watch_xl.png')}/>
                            <Animated.Image style={[{marginRight:'3%',position:'absolute'},{transform: [{scale: scale1},{translateY: moveY2}]},{opacity:DisableOpacity}]} source={require('../../../assets/image/linkage_xl.png')}/>
                            <Animated.Image style={[{marginRight:'3%',position:'absolute'},{transform: [{scale: scale1},{translateY: moveY3},{translateX: moveX3}]},{opacity:DisableOpacity}]} source={require('../../../assets/image/car_xl.png')}/>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
              
                  
                <View style={{flex:0.4,backgroundColor:'#2E333A'}}>
                    <View style={{flex:0.3,alignSelf:'center'}}>
                        <Text style={{fontFamily:'M-SB',color:'white',fontSize:14,marginTop:'5%'}}>{i18n.t('Pair')}{i18n.t('Your')}{i18n.t('SmartWatch')}</Text>
                    </View>
                    <View style={{flex:0.4,marginHorizontal:'10%'}}>
                        <TouchableOpacity  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:8,paddingVertical:'5%',alignItems:'center',borderRadius:5}} onPress={()=>handleConnect()}> 
                            <Text style={styles.btnContent}>{i18n.t("Connect")}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:0.3,alignSelf:'center'}}>
                        <Text style={{fontFamily:'M-M',color:'white',fontSize:14,letterSpacing:1}}>Cerebro Strategy Limited</Text>
                    </View>
                </View>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                
                <Animated.View style={[{borderTopLeftRadius:25,borderTopRightRadius:25,backgroundColor:'white',position:'absolute',width:'100%',paddingHorizontal:'10%'},{height:interpolatedHeight,bottom:bottomMove}]}>
                    {loading?
                    <View>
                        <View style={{marginTop:'10%',alignSelf:'center',flexDirection:'row'}}>
                            <Text style={{color:'#000000',fontFamily:'M-SB',fontSize:14}}>{i18n.t('Connecting')}</Text>
                            <Animated.Text style={[{color:'#000000',fontFamily:'M-SB',fontSize:14},{opacity:opacity1}]}>.</Animated.Text>
                            <Animated.Text style={[{color:'#000000',fontFamily:'M-SB',fontSize:14},{opacity:opacity2}]}>.</Animated.Text>
                            <Animated.Text style={[{color:'#000000',fontFamily:'M-SB',fontSize:14},{opacity:opacity3}]}>.</Animated.Text>
                        </View>
                        <View style={{marginTop:'10%'}}>
                        {paired.filter(item=>item.checked).map((item,index)=>(
                             <View key={item.name_eng+'_'+item.id}  style={{marginTop:'3%',flexDirection:'row'}}>
                                <Image style={styles.icon} source={require('../../../assets/icon/user-hard-hat-solid.png')} />
                                <Text style={{fontSize:14,fontFamily:'M-M',color:'#2E333A',marginLeft:'20%',alignSelf:'center'}}>{item.name_eng}</Text>
                                {/* <TouchableOpacity  onPress={() => removePairedData(index)} >
                                    <FontAwesome5 name="trash-alt" size={20} color="#2E333A" />
                                </TouchableOpacity> */}
                                
                            </View>
                            ))}
                       
                        {/* <View style={{height:100,width:100,borderRadius:100,borderWidth:1,borderColor:'#98D4D4',alignSelf:'center',marginTop:'10%'}}></View> */}
                            <ActivityIndicator color="#98D4D4" size={100} style={{marginTop:'10%'}} animating={loading}/>
                        {/* <View style={{height:100,width:100,borderRadius:100,borderWidth:1,borderColor:'#98D4D4',alignSelf:'center',position:'relative',top:-100,borderWidth:5}}></View> */}
                        </View>
                    </View>:
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[{borderTopLeftRadius:25,borderTopRightRadius:25,backgroundColor:'white',position:'absolute',bottom:0,width:'100%',height:'100%',paddingHorizontal:'5%',alignSelf:'center'}]}>
                            <InputComponent  
                                onChangeText={text=>{
                                    setSearch(text)
                                    const newFilterData = paired.filter(item=>item.name_eng.toLowerCase().startsWith(text.toLowerCase()))
                                    setFilterData(newFilterData)
                                }}
                                value={search} 
                                // setFilterData={setFilterData}
                                // setSearch={setSearch}
                                // setData={setPaired}
                                header={i18n.t("AddWatch")} 
                                style={{marginTop:'10%'}}
                                bgColor="#FFF" 
                                // filterData={filterData}
                                // data={paired}
                                rightAccessory={<TouchableOpacity onPress={()=>closeFilter()}>
                               <MaterialIcons name="close" size={24} color="black" />
                                </TouchableOpacity> }
                                // disabled={true}
                                borderColor="#73B2B8" 
                                borderNormal="rgba(0,0,0,0.12)"
                                labelColor="#73B2B8" 
                                blockSize={40} 
                                textColor="rgba(0,0,0,0.87)" 
                            />

                            <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:'3%'}}>
                                <Text style={{color:'rgba(0,0,0,0.6)',fontFamily:'M-M',fontSize:12}}>{i18n.t('Paired')}{i18n.t('User')}{i18n.t('ss')}</Text>
                                <Text style={{color:'rgba(0,0,0,0.6)',fontFamily:'M-M',fontSize:12}}>{search!==''?filterData.length:paired.length}</Text>
                            </View>
                            <View style={{height:isKeyboardVisible?'20%':'60%'}}>
                                <FlatList style={{marginVertical:'3%'}} data={search!==''?filterData:paired}  renderItem={renderItem} keyExtractor={item => item.id} />
                            </View>
                            
                            <TouchableOpacity onPress={()=>handleSubmit()}  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:2,marginBottom:'10%',paddingVertical:'3%',alignItems:'center',borderRadius:5}}> 
                                <Text style={styles.btnContent}>{i18n.t("Confirm")}</Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>}
                </Animated.View>
                </TouchableWithoutFeedback>
            </View>
          
        )
                                
    
}   


const styles = StyleSheet.create({
    header:{
        fontFamily:'FO',
        fontSize:20,
        color:'white'
    },
    footer:{
        fontFamily:'M-SBL', 
        fontSize:14,
        color:'#73B2B8'
    },
    alertText:{
        fontFamily:'M-SB',
        color:'white',
        fontSize:15
    },
    button: {
        marginHorizontal: '10%',
        backgroundColor:'#73B2B8',
        borderWidth:0,
        elevation:2
      },
    dot:{
        backgroundColor:'#98D4D4',
        height:8,
        width:8,
        borderRadius:8,
        marginHorizontal:'2%'
    },
    image:{
        width: 150*constants.widthRatio,
        height: 150*constants.HeightRatio,
        marginBottom: 10*constants.HeightRatio,
        borderRadius:5,
        flex:0.5,
        aspectRatio:1
    },
    deleteBtn:{
        shadowRadius:1,
        shadowOffset:{width:0,height:3},
        shadowOpacity:0.5,
        zIndex:5,
        position:'absolute',
        elevation:20
    },
    btnContent:{
        fontFamily:'M-SB',
        color:'white',
        fontSize:14,
        letterSpacing:5
        },
        
    appName: {
        color: '#73B2B8',
        fontSize: 20,
        // width: 270,
        fontFamily: 'FO',
    },
    icon:{
        width:25,
        height:25,
        marginVertical:'5%'
        }
})