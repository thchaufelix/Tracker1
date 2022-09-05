import React, { useState, useRef, useEffect,useContext } from 'react'
import { View,Text, Image, StyleSheet, Vibration, TouchableWithoutFeedback, Animated,TouchableOpacity,Easing, FlatList,ActivityIndicator } from 'react-native'
import { MaterialIcons,Foundation,FontAwesome } from '@expo/vector-icons';
import i18n from 'i18n-js';
import {useKeepAwake} from "expo-keep-awake";
import { NativeModules,NativeEventEmitter } from 'react-native';
import { AccountContext2 } from '../../Context/authContext2';
import axios from 'axios'
import * as constants from '../../global/constants'
import { Audio } from 'expo-av';
import { Button, Card, Modal,CheckBox } from '@ui-kitten/components';
import { NotiContext } from '../../Context/notContext';
import { AppRoute } from '../../navigator/appRoutes';
import { useIsFocused } from "@react-navigation/native";



const {IBeaconPlaygroundModule} = NativeModules;



export default function RTCScreen({navigation}){
    useKeepAwake()
    // const notification = new NotifService((token)=>onRegister(token),(iNotification)=>onNotification(iNotification))
   
    const [sound, setSound] = React.useState(new Audio.Sound());

    const [ lockScreen, setLockScreen ] = useState(false)
    const [ scannedData , setScannedData ] = useState([])
    const [ submit, setsubmit ] = useState(false)
    const [ inRangeData, setInRangeData ] = useState([])
    const animationDuration = 300;
    const [ DR, setDR ] = useState(false)
    const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(0))
    const [aniamtedSize, setAnimatedSize] = useState(new Animated.Value(0))
    const animatedOpacity= useRef(new Animated.Value(0)).current
    const animatedOpacity2= useRef(new Animated.Value(0)).current
    const animatedOpacity3= useRef(new Animated.Value(0)).current
    const animatedOpacity1= useRef(new Animated.Value(0)).current
    const { token, deviceData,login,bData,staffList, onCarList, setOnCarList,setDeviceData ,reloadStaffList,handleData} = useContext(AccountContext2)
    const authToken = 'Token ' + token
    const [ selectedData, setSelectedData ] = useState([...onCarList])
    // const [ warning, setWarning ] = useState(false)
    const [ running, setRunning ] = useState(false)
    const [expanded, setExpanded] = useState(false);
    const layerLevel = 4    
    const layerList = new Array(layerLevel).fill(0)
    const [isConnected, setisConnected ] = useState(false)
    const { config } = useContext(NotiContext)
    const isFocused = useIsFocused();


    useEffect(()=>{
        const newDeviceData = {...deviceData}

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
                                console.log(PlantData)
                                if(PlantData.data.paired_staff.length>0){
                                    setOnCarList([...PlantData.data.paired_staff])
                                    console.log([...PlantData.data.paired_staff])
                                    setSelectedData([...PlantData.data.paired_staff])
                                }else{
                                    navigation.navigate(AppRoute.WLNAV,{screen:AppRoute.WLNAV}) 
                                }
                              

                            })
                            // navigation.navigate(AppRoute.RTC,{screen:AppRoute.RTC})
            
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

//     useEffect(() => {
//      let unsubscribeConnListener = NetInfo.addEventListener(async (state) => {
//        setisConnected(state.isInternetReachable || false);
//        if(state.isInternetReachable || false){
//         const formData = {
//             "paired_staff_ids":deviceData.wl,
//             "paired_tracker_ids":[deviceData.tracker_id]
//         }
//         await axios.patch(constants.apiUri+'plant/'+ deviceData.plant_id +'/updatepairing?filter=tracker',formData,{
//             headers: {
//                 Authorization: authToken,
//                 "Fcm-Imei":deviceData.imei 
//                 },
//             }).then(async function (response){
//                 console.log(response.data)
//                 reloadStaffList(token)
              

//             }).catch(
//                 function (error) {
//                  console.log(error.text)
//                 })
//        }
//      });
 
//      return () => {
//        unsubscribeConnListener();
//      };
//    }, []);
 
    // useEffect(()=>{
    //     setSelectedData(new Array(onCarList.length).fill(false))
    // },[onCarList])
    async function playSound() {
        console.log('Loading Sound');
        var { sound } = await Audio.Sound.createAsync(
        require('../../../assets/audio/warning.mp3')
        );
        setSound(sound);

        console.log('Playing Sound');
        await sound.playAsync(); }
     
    useEffect(() => {
        return sound
        ? () => {
            console.log('Unloading Sound');
            sound.unloadAsync(); }
        : undefined;
    }, [sound]);

    // useEffect(() => {
    //             IBeaconPlaygroundModule.startScanning();

        
    
    // }, [])

    function filterDataProcess(data,staffList){
        const rawData = Object.values(data).filter(item=>item.inRange)
        const scannedData = rawData.map(item=>item.detail)
        const filterData = scannedData.map((item,index)=>{
            const uuid = item.UUID
            const major = item.major
            const minor = item.minor
            const result = staffList.filter(subItem => subItem.uuid === uuid && subItem.major === major && subItem.minor === minor)
            // console.log(result)
            return{
                ...item,    
                name:result.length>0?result[0].full_name:rawData[index].name,
                distance:rawData[index].distance,
            }
        })
        // console.log(filterData)
        return filterData
    }               

    const opacityEffect =  Animated.timing(animatedOpacity, {
        toValue: 1, 
        duration:1500,
        useNativeDriver:false
    })

    const opacityEffect1 =  Animated.timing(animatedOpacity1, {
        toValue: 1, 
        duration:1000,
        useNativeDriver:false
    })


    const opacityEffect2 =  Animated.timing(animatedOpacity2, {
        toValue: 1, 
        duration:2000,
        useNativeDriver:false
    })


    const opacityEffect3 =  Animated.timing(animatedOpacity3, {
        toValue: 1, 
        duration:3000,
        useNativeDriver:false
    })

    



    useEffect(()=>{
        if(isFocused){
            if(Object.values(bData).length !==0){
                const newData = Object.values(bData).filter(item=>item.inRange && !item.inWhiteList)
                const newDR = Object.values(bData).some(item=>item.inRange && !item.inWhiteList)
                setScannedData(newData.map(item=>({uuid:item.detail.UUID,distance:item.distance,}))) 
                if(DR !== newDR){
                    setDR(newDR)
                }
        
                if(newDR){
                    const newInRangeData = filterDataProcess(newData,staffList)
                    setInRangeData(newInRangeData.sort((a, b) => a.distance > b.distance))
    
                    playSound()
                    opacityEffect.start(result => {
                        if (result.finished) {
                            opacityEffect.reset()}
                        })
                }else{
                    opacityEffect1.start()
                        opacityEffect2.start()
                            opacityEffect3.start(result => {
                                if(result.finished){
                                    opacityEffect3.reset()
                                    opacityEffect1.reset()
                                    opacityEffect2.reset()
                                }
                                  
                                })
                        
                }
            }else{
                setDR(false)
            }
        
        }
       
       
        
        
    },[bData,isFocused])
  
  
  
    React.useEffect(async() => {
        if(DR){
            Animated.timing(aniamtedSize, {
                toValue: 1, 
                duration: animationDuration,
                useNativeDriver:false
            }).start()
        // const id = setInterval(() => {
        //     setWarning(warning => !warning)

        //     }, 800)
            return () => clearInterval(id)
        }else{
            Animated.timing(aniamtedSize, {
                toValue: 0, 
                duration: animationDuration,
                useNativeDriver:false
            }).start()
            // await sound.unloadAsync()
             // await sound.stopAsync()
          
             
        }
     
      },[DR])
    // const [opacity] = useWalkBounceAnimation(warning,800,[0,0.5, 1],[0,0.47, 0])
    // const [opacity1] = useWalkBounceAnimation(running,450,[0,1],[1,0])
    // const [opacity2] = useWalkBounceAnimation(running,500,[0,1],[1,0])
    // const [opacity3] = useWalkBounceAnimation(running,550,[0,1],[1,0])
    const toggleDropdown = () => {
        if (expanded == true) {
            Animated.timing(animatedHeight, {
                toValue: 0, 
                duration: animationDuration,
                useNativeDriver:false
            }).start()
            setTimeout(() => {
                setExpanded(!expanded)
            }, animationDuration)
        } else {
            setExpanded(!expanded)
            setSelectedData(selectedData.map(item=>{
                const oldData = {...item}
                oldData.checked = false
                return oldData
            }))
            Animated.timing(animatedHeight, {
                toValue: 100,
                duration: animationDuration,
                useNativeDriver:false
            }).start()
        }
    }



    const interpolatedHeight = animatedHeight.interpolate({
        inputRange: [0, 100],
        outputRange: [constants.windowHeight*0.1, constants.windowHeight*0.4]
    })
    const interpolatedSize = aniamtedSize.interpolate({
        inputRange: [0,0.2,0.4,0.6,0.8, 1],
        outputRange: [1,1.1,1.2,1.3,1.4,1.5]
    })

    const redOpacity = animatedOpacity.interpolate({
        inputRange: [0,0.125,0.25,0.375,0.5,0.625,0.75,0.875, 1],
        outputRange: [0,0.12,0.24,0.36,0.47,0.36,0.24,0.12,0]
    })

    const dotOpacity1 = animatedOpacity1.interpolate({
        inputRange: [0,1],
        outputRange: [0,1],
    })

    const dotOpacity2 = animatedOpacity2.interpolate({
        inputRange: [0, 1],
        outputRange: [0,1],
    })

    const dotOpacity3 = animatedOpacity3.interpolate({
        inputRange: [0,1],
        outputRange: [0, 1],
    })


    // useEffect(()=>{
    //     if(DR){
    //         playSound()
    //         setCount(count+1)
    //     }
    //     return ()=>setCount(0)   
    // },[count])
   
    

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

    const renderItem = ({ item, index}) => {
        const pressHandler = (index) => { 
            const oldSelected = [...selectedData]
            oldSelected[index].checked = !oldSelected[index].checked
            setSelectedData(oldSelected)
        }    
        return(
            <TouchableOpacity onPress={()=>pressHandler(index)}>
                <View key={index+'_'+item.name} style={{marginVertical:'2%',flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{flexDirection:'row'}}>
                        <Image style={[styles.icon]} source={require('../../../assets/icon/user-hard-hat-solid.png')} />
                        <Text style={[styles.header,{color:'black'},{marginLeft:'15%'}]}>{item?item.full_name:''}</Text>
                    </View>
                    <CheckBox
                        checked={item.checked}
                        onChange={nextChecked => {
                            const oldSelected = [...selectedData]
                            oldSelected[index].checked = !oldSelected[index].checked
                            setSelectedData(oldSelected)
                        }}>
                    </CheckBox>
                </View>
            </TouchableOpacity>

        )

    }

    // useEffect(()=>{
    //     console.log(onCarList)
    //     navigation.navigate(AppRoute.WLNAV,{screen:AppRoute.WLNAV})
    //     navigation.dispatch(
    //         CommonActions.reset({
    //           index: 1,
    //           routes: [
    //             { name: "Home" },
    //             {
    //               name: "Profile",
    //               params: { user: "jane" },
    //             },
    //           ],
    //         })
    //       );
    // },[onCarList])


    const handleLogout = async(mode) =>  {
        setsubmit(true)
        // if(isConnected){
        //     console.log(constants.deviceApi+'/'+deviceData.tracker_id+'/getwhiteliststaff')
        //     console.log(authToken)
        //     console.log(deviceData.imei)
            // await axios.get(constants.deviceApi+'/'+deviceData.tracker_id+'/getwhiteliststaff',{
            //     headers: {  
            //         Authorization: authToken,
            //         "Fcm-Imei":deviceData.imei
            //         },
            //     }).then(async function (response){
            //         console.log('api' + constants.plantApi+'/'+deviceData.plant_id+'/updatepairing?filter=tracker')
                    if(mode==="all"){
                        const logoutList = selectedData.map(item=>item.id)
                        // const whitelist = response.data.filter(item=>!logoutList.includes(item.id)).map(item=>item.id)
                      
                        const formData = {
                            // "paired_staff_ids":whitelist,
                            "paired_staff_ids":logoutList,
                            // "paired_tracker_ids":[deviceData.tracker_id]
                        }
                        
                        // await axios.patch(constants.plantApi+'/'+deviceData.plant_id+'/updatepairing?filter=tracker',formData,{
                        await axios.patch(constants.plantApi+'/'+deviceData.plant_id+'/dropoff',formData,{
                            headers: {  
                                Authorization: authToken,
                                "Fcm-Imei":deviceData.imei
                                },
                            }).then(async function (response){
                                // getNewConfig2()
                                setsubmit(false)
                                // const newDeviceData = {...deviceData}
                                // newDeviceData.wl = whitelist
                                // setDeviceData(newDeviceData)
                                //  IBeaconPlaygroundModule.stopScanning();
                                    IBeaconPlaygroundModule.updateConfig(JSON.stringify({"as":"0"}))
                                 setOnCarList([])
                                  // IBeaconPlaygroundModule.stopForeground();
                               toggleDropdown()
                               setDR(false)
                               navigation.navigate(AppRoute.WLNAV,{screen:AppRoute.WLNAV})
                            }).catch(function (error){
                                alert(error)
                                setSubmit(false)
                            })
                    }else{
                        const logoutList = selectedData.filter((item,index)=>selectedData[index].checked).map(item=>item.id)
                        // const whitelist = response.data.filter(item=>!logoutList.includes(item.id)).map(item=>item.id)
                       
                        const formData = {
                            // "paired_staff_ids":whitelist,
                            "paired_staff_ids":logoutList,
                            // "paired_tracker_ids":[deviceData.tracker_id]
                        }
                        // await axios.patch(constants.apiUri+'plant/'+deviceData.plant_id+'/updatepairing?filter=tracker',formData,{
                        await axios.patch(constants.plantApi+'/'+deviceData.plant_id+'/dropoff',formData,{
                            headers: {  
                                Authorization: authToken,
                                "Fcm-Imei":deviceData.imei
                                },
                            }).then(async function (response){
                                // getNewConfig2()
                                setsubmit(false)
                                // const newDeviceData = {...deviceData}
                                // newDeviceData.wl = whitelist
                                // setDeviceData(newDeviceData)
                                setOnCarList(selectedData.filter((item,index)=>!selectedData[index].checked))
                                const checkList = [...selectedData].filter((item,index)=>!selectedData[index].checked)
                                setSelectedData(checkList)
                                if(checkList.length===0){
                                    setDR(false)
                                    setOnCarList([])
                                    navigation.navigate(AppRoute.WLNAV,{screen:AppRoute.WLNAV})
                                }
                                toggleDropdown()
                               
                              
                            }).catch(function (error){
                                alert(error)
                                setSubmit(false)
                            })
                    }
                 
                  
                    
                // })
        // }else{
        //     if(mode==="all"){
        //         const logoutList = selectedData
        //         const whitelist = deviceData.wl.filter(item=>!logoutList.map(item=>item.id).includes(item.id)).map(item=>item.id)
        //         const newDeviceData = {...deviceData}
        //         newDeviceData.wl = whitelist
        //         setDeviceData(newDeviceData)
        //         IBeaconPlaygroundModule.stopScanning();
        //         toggleDropdown()
        //         setDR(false)
        //         navigation.goBack()
        //     }else{
        //         const logoutList = selectedData.filter((item,index)=>selectedData[index].checked)
        //         const whitelist = deviceData.wl.filter(item=>!logoutList.map(item=>item.id).includes(item.id)).map(item=>item.id)
        //         const newDeviceData = {...deviceData}
        //         newDeviceData.wl = whitelist
        //         setDeviceData(newDeviceData)
        //         setOnCarList(selectedData.filter((item,index)=>!selectedData[index].checked))
        //         const checkList = [...selectedData].filter((item,index)=>!selectedData[index].checked)
        //         setSelectedData(checkList)
        //         if(checkList.length===0){
        //             setDR(false)
        //             setOnCarList([])
        //             navigation.goBack()
        //         }
        //         toggleDropdown()
                       
                      
        //     }
        // }
       
       
    }
    if(DR){
        return(
            <View style={{flex:1}}>
                
                <View style={{flexDirection:'row',position:'absolute',top:'7%',zIndex:100}}>
                    <View style={{flex:0.3}}>
                        <NavigationDrawerStructure navigationProps={navigation}/>
                    </View>
                    <View style={{flex:1}}>
                        <Text style={{color:'white',fontFamily:'M-SB',fontSize:18,justifyContent:'center'}}> {i18n.t('RT')}</Text>
                    </View>
                </View> 
                {/* <TouchableOpacity style={{position:"absolute",zIndex:1001,top:'15%',right:20}} onPress={()=>reloadStaffList(authToken)}>
                    <FontAwesome name="refresh" size={30} color="white" />
                </TouchableOpacity> */}
                <View style={{flex:1,backgroundColor:'#48000C',justifyContent:'center'}}>
                    <View style={{alignItems:'center',position:'absolute',alignSelf:'center'}}>
                        <Animated.View style={[{height:layerLevel*50,width:layerLevel*50,backgroundColor:'#F29393',borderRadius:layerLevel*50,opacity:0.5},{transform:[{scale:interpolatedSize}]}]}></Animated.View>
                        {layerList.slice(1).map((item,index)=>(
                            <Animated.View key={index} style={[{height:layerLevel*50-(index+1)*50,width:layerLevel*50-(index+1)*50,backgroundColor:'#F29393',borderRadius:layerLevel*50-(index+1)*50,opacity:0.5 ,position:'absolute',top:(index+1)*25},,{transform:[{scale:interpolatedSize}]}]}></Animated.View>
                        ))}
                        
                    </View>
                    <View style={{alignItems:'center'}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Foundation name="alert" size={32} color="white" />
                            <Text style={[styles.alertText,{fontSize:32,marginLeft:'3%'}]}>{inRangeData.length} </Text>
                        </View>
                        
                        {inRangeData.length>0? inRangeData.map((item,index)=>(
                            <View key={Math.random()} style={{flexDirection:'row',justifyContent:'space-between',width:'80%'}}>
                                <Text style={{fontFamily:'M-M',fontSize:15,color:'white',zIndex:1000,width:'40%'}} key={item.uuid+'_'+index}>{item.UUID.split('-')[0]}</Text>
                                <Text style={{fontFamily:'M-M',fontSize:15,color:'white',zIndex:1000,width:'40%'}} key={item.name+'_'+index}>{item.name}</Text>
                                <Text style={{fontFamily:'M-M',fontSize:15,color:'white',zIndex:1000,width:'20%'}} key={Math.random()}>{+(Math.round(item.distance+ "e+1")  + "e-1")}m</Text>
                            </View>
                            )):null}
                        {/* <Text style={[styles.alertText]}>{i18n.t('Neatby')}</Text>
                        <Text style={[styles.alertText]}>{i18n.t('User')}</Text> */}
                      
                       
                    </View>
                
                </View> 
                <Animated.View style={[{backgroundColor:'#B00020',position:'absolute',zIndex:1000,bottom:0,height:'100%',width:'100%'},{opacity:redOpacity}]}>

                
                </Animated.View>
            
                    
                <TouchableWithoutFeedback style={{}} onPress={()=>{
                    toggleDropdown()}}>
                    <Animated.View style={[{borderTopLeftRadius:25,borderTopRightRadius:25,backgroundColor:'white',justifyContent:'center',position:'absolute',bottom:0,width:'100%',zIndex:1000},{height:interpolatedHeight}]}>
                    {expanded?null:
                            <View style={{flexDirection:'row',justifyContent:"space-around",marginTop:expanded?'5%':0}}>
                                <Image style={styles.icon} source={require('../../../assets/icon/user-hard-hat-solid.png')} />
                                <Text style={[styles.header,{color:'black'}]}>{selectedData.length===0?'':(selectedData.length>1?selectedData.length+' '+i18n.t('User'):selectedData[0].full_name?selectedData[0].full_name:'')}</Text>
                                <TouchableOpacity onPress={()=>toggleDropdown()}>
                                    <Text style={[styles.header,{color:'#73B2B8'}]}> {expanded?i18n.t('Cancel'):i18n.t('Change')}</Text>
                                </TouchableOpacity>
                            </View>}
                            {expanded?
                            <View style={{width:'100%',alignSelf:'center',paddingHorizontal:'5%'}}>
                                <Text style={{fontFamily:'M-SB',fontSize:14,textAlign:'center',marginVertical:'3%'}}>{i18n.t('SureLogout')}</Text>
                                <FlatList style={{marginVertical:'2%',height:100,paddingHorizontal:'5%'}} data={selectedData}  renderItem={renderItem} keyExtractor={item => item.name} />
                                {selectedData.filter(item=>item.checked).length>0?
                                <TouchableOpacity onPress={()=>submit?null:handleLogout()}  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:2,marginBottom:'5%',paddingVertical:'3%',alignItems:'center',borderRadius:5}}> 
                                    {submit?<ActivityIndicator size="small" color="white" />:<Text style={[styles.btnContent]}>{i18n.t("LogOut")}</Text>}
                                </TouchableOpacity>:
                                <TouchableOpacity onPress={()=>submit?null:handleLogout("all")}  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:2,marginBottom:'5%',paddingVertical:'3%',alignItems:'center',borderRadius:5}}> 
                                    {submit?<ActivityIndicator size="small" color="white" />:<Text style={styles.btnContent}>{i18n.t("LogOutAll")}</Text>}
                                </TouchableOpacity>}
                                
                            </View>:null}
                           
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Modal
                    visible={lockScreen}
                    backdropStyle={styles.backdrop}
                    onBackdropPress={() => {
                        navigation.goBack()
                        setDR(false)
                        setLockScreen(false)
                    }}>
                    <Card disabled={true}>
                      <Text style={{fontFamily:'M-M',marginBottom:'5%'}}>{i18n.t('ConnectUser')}</Text>
                      <Button onPress={() => {
                        navigation.goBack()
                        setDR(false)
                        setLockScreen(false)
                    }}>
                        {i18n.t('OK')}
                      </Button>
                    </Card>
                  </Modal>

            </View>
        )
    }else{
        return(
            <View style={{flex:1,backgroundColor:'#2E333A'}}>
                <View style={{flexDirection:'row',position:'absolute',top:'7%',zIndex:100}}>
                    <View style={{flex:0.3}}>
                        <NavigationDrawerStructure navigationProps={navigation}/>
                    </View>
                    <View style={{flex:1}}>   
                        <Text style={{color:'white',fontFamily:'M-SB',fontSize:18,justifyContent:'center'}}> {i18n.t('RT')}</Text>
                    </View>
                </View>
                {/* <TouchableOpacity style={{position:"absolute",zIndex:1001,top:'15%',right:20}} onPress={()=>reloadStaffList(authToken)}>
                    <FontAwesome name="refresh" size={30} color="white" />
                </TouchableOpacity> */}
                <View style={{flex:1,backgroundColor:'#2E333A',justifyContent:'center'}}>
                   
                    <View style={{alignItems:'center'}}>
                        <View style={{marginTop:'20%'}}>
                            <Text style={[styles.header]}>{i18n.t('Scan')}</Text>
                            <View style={{flexDirection:'row'}}>
                                <Text style={[styles.header]}>{i18n.t('User')}</Text>
                                <Animated.Text style={[styles.header,{opacity:dotOpacity1}]}>.</Animated.Text>
                                <Animated.Text style={[styles.header,{opacity:dotOpacity2}]}>.</Animated.Text>
                                <Animated.Text style={[styles.header,{opacity:dotOpacity3}]}>.</Animated.Text>
                            </View>
                        </View>
                        <Image
                            style={{marginVertical:'2.5%'}}
                            source={require('../../../assets/image/search.png')}
                        />
                        <View style={{alignItems:'center',width:'80%'}}>
                            <Text style={[styles.footer]}>{i18n.t('FunctionalDes')}</Text>
                        </View>
                    </View>
                
                </View>


                <TouchableWithoutFeedback style={{}} onPress={()=>toggleDropdown()}>
                    <Animated.View style={[{borderTopLeftRadius:25,borderTopRightRadius:25,backgroundColor:'white',justifyContent:'center',position:'absolute',bottom:0,width:'100%'},{height:interpolatedHeight}]}>
                    {expanded?null:
                            <View style={{flexDirection:'row',justifyContent:"space-around",marginTop:expanded?'5%':0}}>
                                <Image style={styles.icon} source={require('../../../assets/icon/user-hard-hat-solid.png')} />
                                <Text style={[styles.header,{color:'black'}]}>{selectedData.length===0?'':(selectedData.length>1?selectedData.length+' '+i18n.t('User'):selectedData[0].full_name?selectedData[0].full_name:'')}</Text>
                                <Text style={[styles.header,{color:'#73B2B8'}]}> {expanded?i18n.t('Cancel'):i18n.t('Change')}</Text>
                            </View>}
                            {expanded?
                            <View style={{width:'100%',alignSelf:'center',paddingHorizontal:'5%'}}>
                                <Text style={{fontFamily:'M-SB',fontSize:14,textAlign:'center',marginVertical:'3%'}}>{i18n.t('SureLogout')}</Text>
                                <FlatList style={{marginVertical:'2%',height:100}} data={selectedData}  renderItem={renderItem} keyExtractor={item => item.name} />
                                {selectedData.filter(item=>item.checked).length>0?
                                <TouchableOpacity onPress={()=>submit?null:handleLogout()}  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:2,marginBottom:'5%',paddingVertical:'3%',alignItems:'center',borderRadius:5}}> 
                                    {submit?<ActivityIndicator size="small" color="white" />:<Text style={[styles.btnContent]}>{i18n.t("LogOut")}</Text>}
                                </TouchableOpacity>:
                                <TouchableOpacity onPress={()=>submit?null:handleLogout("all")}  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:2,marginBottom:'5%',paddingVertical:'3%',alignItems:'center',borderRadius:5}}> 
                                    {submit?<ActivityIndicator size="small" color="white" />:<Text style={styles.btnContent}>{i18n.t("LogOutAll")}</Text>}
                                </TouchableOpacity>}
                            </View>:null}
                           
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Modal
                    visible={lockScreen}
                    backdropStyle={styles.backdrop}
                    onBackdropPress={() => {
                        navigation.goBack()
                        setLockScreen(false)
                    }}>
                    <Card disabled={true}>
                      <Text style={{fontFamily:'M-M',marginBottom:'5%'}}>{i18n.t('ConnectUser')}</Text>
                      <Button onPress={() => {
                        navigation.goBack()
                        setLockScreen(false)
                    }}>
                        {i18n.t('OK')}
                      </Button>
                    </Card>
                  </Modal>

            </View>
           
        )
    }
    
}   


const styles = StyleSheet.create({
    header:{
        fontFamily:'M-SB',
        fontSize:14,
        color:'white'
    },
    footer:{
        fontFamily:'M-SBL',
        fontSize:14,
        color:'#73B2B8',
        textAlign:'center'
    },
    alertText:{
        fontFamily:'M-SB',
        color:'white',
        fontSize:15
    },
     backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
    btnContent:{
        fontFamily:'M-SB',
        color:'white',
        fontSize:14,
        letterSpacing:5
        },
    icon:{
        width:25,
        height:25
        }
})