import React, { useState, useRef, useEffect, useContext } from 'react'
import { View,Text, Image, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Animated,TouchableOpacity, Keyboard, FlatList, Modal,ScrollView,NativeModules} from 'react-native'
import { MaterialIcons,Ionicons } from '@expo/vector-icons';
import i18n from 'i18n-js';
import axios from 'axios'
import * as constants from '../../global/constants'
import { Button, Modal as KModal, Card } from '@ui-kitten/components';
import InputComponent from '../../component/form/input'
import { Formik } from 'formik'
import * as ImagePicker from 'expo-image-picker';
import mime from "mime";
import { AccountContext } from '../../Context/authContext';
import ImageView from "react-native-image-viewing";
import { AppRoute } from '../../navigator/appRoutes';
import { CommonActions, StackActions, NavigationActions } from "@react-navigation/native";
import {useKeepAwake} from "expo-keep-awake";
import { NotiContext } from '../../Context/notContext';


const {IBeaconPlaygroundModule} = NativeModules;


export default function LinkcCreateScreen({navigation,route}){
    useKeepAwake()
    const animationDuration = 200
    const { token, deviceData, handleData,setBgColor, setDeviceData } = useContext(AccountContext)
    const authToken = 'Token '+token
    const [ submit, setSubmit ] = useState(false)
    const [ fileList, setFileList ] = useState([])
    const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(0))
    const [ expanded, setExpanded ] = useState(false)
    console.log(deviceData.image, fileList)
    const [ modalVisible, setModalVisible ] = useState(false)
    const [ animatedSize, setAnimatedSize ] = useState(new Animated.Value(0))
    const [ login, setLogin ] = useState(false)
    const [ password, setPassword ] = useState('')
    const [ email, setEmail ] = useState('')
    const [pwOpen, setPwOpen] = useState(true)
    const [ isVisible, setIsVisible ] = useState(false)
    const [ selectedImnage, setSelectedImage ] = useState(-1)
    const [eyeIcon, setEye ] = useState('ios-eye')
    const { config } = useContext(NotiContext)
    const showProp = () => {
        setPwOpen(!pwOpen)
        setEye(eyeIcon === 'ios-eye' ? 'ios-eye-off' : 'ios-eye')
    }
    useEffect(() => {
        // setSubmit(false)
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
        };

    }, []);

    const keyboardWillShow = () => {
            Animated.timing(animatedSize, {
                toValue: 1,
                useNativeDriver:false
              }).start();
         
      
    }

    const keyboardWillHide = () => {
            Animated.timing(animatedSize, {
                toValue: 0,
            useNativeDriver:false
          }).start();
     
    }

    useEffect(()=>{
        const newDeviceData = {...deviceData}
        if(config){
            reloadStaffList(authToken)
            if (config.project_id === deviceData.pj){
                if (config.pf_id){
                    if(  deviceData.plant_id === config.pf_id){
                        if(config.wwl_include_staff){
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

    
        


    const maxImage = constants.maxImage
    const handlerSubmit = async (values, actions) => {
        if(!submit){
            if(values.code!=='' && values.label!=='' && fileList.length!==0){

            setSubmit(true)
            const formData = new FormData() 
            formData.append('code',values.code)
            formData.append('label',values.label)
            formData.append('remark',values.remark)
            formData.append('alert',true)
            // formData.append('projects',route.params.projects)
            const newData = fileList.map(item=>{
                const newImageData = {...item.image}
                 if(newImageData.height){
                    newImageData['name'] = item.image.filename

                }
                formData.append('img',newImageData)
            })
            await axios.post(constants.domain+'api-project-admin/plant',formData,{
                params:{
                    project:deviceData.pj
                },
              headers: {
                  Authorization: route.params.token,
                  "Fcm-Imei":deviceData.imei
                  },
              }).then(async function (response){        
                  console.log(response.data.id)    
                const newDeviceData = {...deviceData}
                newDeviceData.last_updated = response.data.updated_at
                newDeviceData.code = response.data.code
                newDeviceData.remark = response.data.remark
                newDeviceData.label = response.data.label
                newDeviceData.plant_id = response.data.id   
                newDeviceData.image = response.data.img.map(item=>item.img)
                await axios.patch(constants.plantApi+'/'+ response.data.id+'/addtracker',
                    {
                        "paired_tracker_id": deviceData.tracker_id
                    },
                    {
                    headers: {      
                        Authorization: authToken,
                        "Fcm-Imei":deviceData.imei
                        },
                    }).then(async function (response){
                        setSubmit(false)
                        handleData(newDeviceData)   
                        toggleDropdown()
                        actions.reset()
                        setFileList([])
                        // IBeaconPlaygroundModule.startScanning();

                    }).catch(function (error){
                            console.log(error)
                            setSubmit(false)
                        })
                        
             
             
          }).catch(function (error){
              console.log(error)
              setSubmit(false)
              // alert('Wrong email or password')
          })
        }else{
            alert(i18n.t('DataMiss'))
        }

            // toggleDropdown()
        }
        
      
    }
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
        outputRange: ['70%', '60%']
    })

    

    const moveX1 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, constants.windowWidth*0.1],
      });

    const moveX2 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,-constants.windowWidth*0.015],
    });

    const moveY1 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,-constants.windowHeight*0.025],
      });

    const moveY2 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,constants.windowHeight*0.025],
      });

      const moveX3 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -constants.windowWidth*0.11],
      });
  
    const moveY3 = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0,constants.windowHeight*0.08],
      });

      const scale1 = animatedHeight.interpolate({
        inputRange: [0, 1], 
        outputRange: [1,1.3]
      });

      const scale2 = animatedSize.interpolate({
        inputRange: [0, 1], 
        outputRange: [1,0.7]
      });

      const moveY4 = animatedSize.interpolate({
        inputRange: [0, 1], 
        outputRange: [0,-constants.windowHeight*0.12]
      });

      const moveBot = animatedSize.interpolate({
        inputRange: [0, 1], 
        outputRange: [0,constants.windowHeight*0.17]
      });

    const formOpacity = animatedHeight.interpolate({
        inputRange: [0,1],
        outputRange: [1,0]
        });

    const DisableOpacity = animatedHeight.interpolate({
        inputRange: [0,1],
        outputRange: [0,1]
        });



    const deleteImage = (index) => {
        var array = [...fileList] 
        const fileLength = array.length
        array.splice(index, 1)
        setFileList(array)
    }

    const convertDateTime = (time) => {
        const newTime = new Date(time)
        const result = newTime.getFullYear() +'-'+ (newTime.getMonth()+1) +'-' + newTime.getDate() + ' ' + newTime.getHours()+':'+newTime.getMinutes()
        return result
    }

    useEffect(()=> {
        setFileList(route.params.photo)
        
    },[route.params.photo])


    const renderItem = ({ item, index}) => {
        const pressHandler = (index) => { 
            // var array = [...fileList]
            setSelectedImage(index)
            setIsVisible(true)
        }    
        if(expanded){
            console.log(item)
            return(
                <TouchableOpacity key={'image_'+item.id+'_expand'} style={{aspectRatio:1}} onPress={() => pressHandler(index)} >
                    <Image style={{width:70*constants.HeightRatio,height:70*constants.HeightRatio}} resizeMode='cover' source={{isStatic:true,uri:item}} key={'image_'+item.id} />
                </TouchableOpacity>
            )
        }else{

        return(
            <View key={'image_'+index} style={{marginVertical:'2%'}}>
                <TouchableOpacity style={[styles.deleteBtn,{right:'10%'}]} onPress={() => deleteImage(index)} >
                    <MaterialIcons style={{padding:5}} name="close" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1/2,aspectRatio:1}} onPress={() => pressHandler(index)} >
                    <Image style={styles.image} resizeMode='cover' source={{isStatic:true,uri:item.uri}} key={index+'_'+item.name+'_image'} />
                </TouchableOpacity>
                
            </View>
        )
        }

    }

    const takePicture = async () => {
        setModalVisible(false)

        // const [status, requestPermission] = ImagePicker.useCameraPermissions();
        // if (status === 'granted'){
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                aspect: [4, 3],
                quality: 1,
            })
            if (!result.cancelled) {
                    const uri =  "file:///" + result.uri.split("file:/").join("");
                    setFileList([...fileList,{ 
                        uri,
                        image:{name:uri.split("/").pop(),type:mime.getType(uri),uri:uri}
                    }])
                }

        // }
    }

    const handleLogin = async () => {
        if(!submit){
            setSubmit(true)
            await axios.post(constants.loginApi,{
                username:email.replace(' ','').toLowerCase(),
                password
            }).then(async function (response){
                // if(deviceData.plant_id!==''){
                setSubmit(false)

                handleUnlink('Token '+ response.data.token)
               
                // }
                // else{
                //     await axios.get(constants.userDataApi+'/loaduser',{
                //         headers: {
                //             Authorization: authToken,
                //             },
                //     }).then(async function (response){

                //     })
                //     const adminToken = 'Token '+ response.data.token
                //     navigation.navigate('LinkCreate',{token:adminToken})
                //     setLogin(false)
                //     setEmail('')
                //     setPassword('')
                //     setPwOpen(false)
                // }
            
            }).catch(function (error){
                alert(i18n.t('WrongInfo'))
                setSubmit(false)
            })
        }
    }


    const handleUnlink = async (token) => {
        var config = {
            method: 'patch',
            url: constants.projAdminApi+'plant/'+ deviceData.plant_id+'/unlink?project='+deviceData.pj,
            headers: { 
              'Authorization': token, 
            },
          };
          axios(config)
            .then(function (response) {
                const newDeviceData = {...deviceData}
                newDeviceData.code = ''
                newDeviceData.label = ''
                newDeviceData.plant_id = ''
                newDeviceData.remark = ''
                newDeviceData.image = []
                newDeviceData.last_updated = convertDateTime(new Date())
                handleData(newDeviceData)   
                setLogin(false)
                handleData(newDeviceData)   
                IBeaconPlaygroundModule.stopScanning()
                // navigation.popToTop()
                setSubmit(false)
                toggleDropdown()
                // const resetAction = StackActions.reset({
                //     index: 0,
                //     key: null,
                //     actions: [
                //       NavigationActions.navigate({
                //         routeName: AppRoute.HOME,
                //         action: NavigationActions.navigate({
                //           routeName:AppRoute.AUTH, 
                //           params:{}
                //         })
                //       })
                //     ]
                //   });
                //   navigation.dispatch(resetAction);
                // navigation.popToTop()
                navigation.navigate('Auth')
            })
            .catch(function (error) {
            console.log(error.message);
            });
     
       
    }

    const ImageFooter = ({ imageIndex }: Props) => (
        <TouchableOpacity onPress={()=>{
            if(fileList.length===1){
                setIsVisible(false)
                deleteImage(imageIndex)
            }else{
                deleteImage(imageIndex)
            }
           }} style={{width:'100%',backgroundColor:'#73B2B8',height:70,borderTopLeftRadius:15,borderTopEndRadius:15,justifyContent:'center'}}>
          <Ionicons style={{alignSelf:'center'}} name="ios-trash" size={30} color="white" />
        </TouchableOpacity>
      );

   



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
                        <View style={{flex:0.7}}>
                            <Text style={{color:'white',fontFamily:'M-SB',fontSize:18,justifyContent:'center'}}> {i18n.t('Linkage')}</Text>
                        </View>
                    </View>
                    
                 
                  
                </View>
                <View style={{flex:0.2,backgroundColor:'#2E333A',justifyContent:'center'}}>
                    
                        <View style={[{alignItems:'center',flexDirection:'row',justifyContent:'center'}]}>
                            <Animated.View style={[{height:175*constants.HeightRatio,width:175*constants.HeightRatio,borderWidth:2,borderColor:'#98D4D4',borderStyle:'dashed',borderRadius:175*constants.HeightRatio,position:'absolute',top:-25,left:'25%'},{opacity:DisableOpacity}]}></Animated.View>
                            <Animated.Image style={[{marginRight:'3%'},{transform: [{scale: scale1},{translateX: moveX1},{translateY: moveY1}]}]} source={require('../../../assets/image/tracker-tag.png')}/>
                            <Animated.View style={[styles.dot,{opacity:formOpacity}]}></Animated.View>
                            <Animated.View style={[styles.dot,{opacity:formOpacity},{backgroundColor:'#73B2B8'}]}></Animated.View>
                            <Animated.Image style={[{marginHorizontal:'3%'},{transform: [{scale: scale1},{translateY: moveY2},{translateX: moveX2}]}]} source={require('../../../assets/image/linkage.png')}/>
                            <Animated.View style={[styles.dot,{opacity:formOpacity},{backgroundColor:'#73B2B8'}]}></Animated.View>
                            <Animated.View style={[styles.dot,{opacity:formOpacity}]}></Animated.View>
                            <Animated.Image style={[{},{transform: [{scale: scale1},{translateY: moveY3},{translateX: moveX3}]}]} source={require('../../../assets/image/car.png')}/>
                        </View>
                    
                    </View>
                <View style={{flex:0.2,backgroundColor:'#2E333A',zIndex:-1}}>
                   
                  
                </View>
                <Animated.View style={[{borderTopLeftRadius:25,borderTopRightRadius:25,backgroundColor:'white',justifyContent:'center',position:'absolute',width:'100%'},{height:interpolatedHeight,bottom:moveBot}]}>
                    <View style={{alignSelf:'flex-end',marginTop:'7.5%',marginRight:'10%'}}>
                        {expanded ?  
                            <TouchableOpacity onPress={()=>setLogin(true)}>
                                <Text style={{color:'#B00020',fontFamily:'M-SB',fontSize:14,letterSpacing:1}}>{i18n.t('Unlink')}{i18n.t('Plant')}</Text>
                            </TouchableOpacity>
                            :
                        null}
                    </View>
                    <ScrollView >
                            <TouchableOpacity style={{width:'100%',height:'100%'}} activeOpacity={1} onPress={Keyboard.dismiss}>

                            <View style={{flexDirection:'row',justifyContent:"center"}}>
                                <Formik
                                    initialValues={{ code: '', label: '',remark:''}}
                                    // validationSchema={reviewSchema}
                                    onSubmit={(values, actions) => {handlerSubmit(values,actions)}}
                                >
                                    {(props) => (
                                        <View style={{width:'80%'}}>
                                            
                                            {/* {expanded?
                                            <View style={{marginTop:'2%'}}>
                                                <Text style={{color:'rgba(0,0,0,0.6)',fontFamily:'M-M',fontSize:12}}>{i18n.t("Project")}</Text>
                                                <Text style={{color:'rgba(0,0,0,0.87)',fontFamily:'M-SB',fontSize:16}}>{userData.default_project[0].description} </Text>
                                            </View>:
                                            <InputComponent  
                                                // onChangeText={props.handleChange('code')}
                                                // value={props.values.code} 
                                                value={userData.default_project[0].description}
                                                header={i18n.t("Project")} 
                                                style={{marginTop:'10%'}}
                                                bgColor="#FFF" 
                                                disabled={true}
                                                borderColor="#73B2B8" 
                                                borderNormal="rgba(0,0,0,0.12)"
                                                labelColor="#73B2B8" 
                                                blockSize={40} 
                                                textColor="rgba(0,0,0,0.87)" 
                                            />} */}
                                            {expanded?
                                            <View style={{marginTop:'4%'}}>
                                                <Text style={{color:'rgba(0,0,0,0.6)',fontFamily:'M-M',fontSize:12}}>{i18n.t("Code")}</Text>
                                                <Text style={{color:'rgba(0,0,0,0.87)',fontFamily:'M-SB',fontSize:16}}>{deviceData.code}</Text>
                                            </View>:
                                            <InputComponent  
                                                onChangeText={props.handleChange('code')}
                                                value={props.values.code} 
                                                header={i18n.t("Code")} 
                                                style={{marginTop:'5%'}}
                                                bgColor="#FFF" 
                                                borderColor="#73B2B8" 
                                                borderNormal="rgba(0,0,0,0.12)"
                                                labelColor="#73B2B8" 
                                                blockSize={40} 
                                                textColor="rgba(0,0,0,0.87)" 
                                            />}
                                            {expanded?
                                            <View style={{marginTop:'4%'}}>
                                                <Text style={{color:'rgba(0,0,0,0.6)',fontFamily:'M-M',fontSize:12}}>{i18n.t("Name")}</Text>
                                                <Text style={{color:'rgba(0,0,0,0.87)',fontFamily:'M-SB',fontSize:16}}>{deviceData.label} </Text>
                                            </View>:
                                            <InputComponent 
                                                onChangeText={props.handleChange('label')}
                                                value={props.values.label} 
                                                style={{marginTop:'5%'}}
                                                header={i18n.t("Name")} 
                                                bgColor="#2E333A" 
                                                blockSize={40}  
                                                labelColor="#73B2B8" 
                                                textColor="rgba(0,0,0,0.87)" 
                                                bgColor="#FFF" 
                                                borderColor="#73B2B8" 
                                                borderNormal="rgba(0,0,0,0.12)"
                                                
                                            />}
                                            {expanded?
                                            <View style={{marginTop:'4%'}}>
                                                <Text style={{color:'rgba(0,0,0,0.6)',fontFamily:'M-M',fontSize:12}}>{i18n.t("Location")} </Text>
                                                <Text style={{color:'rgba(0,0,0,0.87)',fontFamily:'M-SB',fontSize:16}}>{deviceData.remark}</Text>
                                            </View>:
                                            <InputComponent 
                                                onChangeText={props.handleChange('remark')}
                                                value={props.values.remark} 
                                                style={{marginTop:'5%'}}
                                                header={i18n.t("Location")} 
                                                bgColor="#2E333A" 
                                                blockSize={40}  
                                                labelColor="#73B2B8" 
                                                textColor="rgba(0,0,0,0.87)" 
                                                bgColor="#FFF" 
                                                borderColor="#73B2B8" 
                                                borderNormal="rgba(0,0,0,0.12)"
                                                
                                            />}
                                            {expanded?
                                            <View style={{flexDirection:'row',marginTop:'3%'}}>
                                                {deviceData.image.length>0?
                                            <Text style={{fontFamily:'M-SB',color:'#73B2B8',fontSize:18,alignSelf:'center'}}>{i18n.t('Plant')}{i18n.t('Image')}</Text>:null}
                                            
                                        </View>:
                                            <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:'3%'}}>
                                                <Text style={{fontFamily:'M-SB',color:'#73B2B8',fontSize:18,alignSelf:'center'}}>{i18n.t('Upload')}{i18n.t('Plant')}{i18n.t('Image')}</Text>
                                                <TouchableOpacity onPress={()=>setModalVisible(true)}>
                                                    <Text style={{fontFamily:'M-SB',color:'#73B2B8',fontSize:30}}>+</Text>
                                                </TouchableOpacity>
                                            </View>}
                                            <FlatList style={{marginTop:'3%'}} horizontal={true} data={expanded?deviceData.image:fileList}  renderItem={renderItem} keyExtractor={item => expanded?item.id:item.name} />
                                            
                                            {expanded?
                                            
                                            <View style={{}}>
                                                <Text style={{fontFamily:'M-ML',fontSize:10,color:'rgba(0,0,0,0.6)',marginVertical  :'1%',}}>{i18n.t('LastUpdatedAt',{time:convertDateTime(deviceData.last_updated)})}</Text>
                                                <TouchableOpacity style={{alignSelf:'center'}} onPress={()=>{
                                                    const newBgColor = new Array(6).fill('#2E333A')
                                                    newBgColor[3] = '#73B2B8'
                                                    setBgColor(newBgColor)
                                                    navigation.navigate('WLNav')}}>
                                                    <Text style={{color:'#73B2B8',fontSize:14,fontFamily:'M-SB',letterSpacing:1,textTransform:'uppercase'}}>{i18n.t('Pair')}{i18n.t('User')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <TouchableOpacity  onPress={props.handleSubmit}  style={{backgroundColor:'#73B2B8',borderWidth:0,elevation:2,marginBottom:'10%',paddingVertical:'3%',alignItems:'center',borderRadius:5}}> 
                                            {submit?<ActivityIndicator size="small" color="white" />:<Text style={[styles.btnContent]}>{i18n.t("Add")} & {i18n.t("LINK")}</Text>}
                                        </TouchableOpacity>
                                            // <Button
                                            //     style={{backgroundColor:'#73B2B8',borderWidth:0,elev ation:2}}
                                            //     buttonType='clear'
                                            //     onPress={props.handleSubmit}
                                            //     // disabled={!props.isValid || props.isSubmitting}
                                            //     >
                                            //     <Text style={styles.btnContent}>{i18n.t("LINK")}</Text>
                                            //     {/* <ActivityIndicator style={{}} size="small" color="#FFFFFFF"/> */}
                                                
                                            //     </Button>
                                                }
                                        
                                            
                                        </View>

                                            
                                            
                                    )}
                                </Formik>
                            </View>
                  
                   
                  
                    
                        </TouchableOpacity>
                        <View style={{height:50}}>

                        </View>
                    </ScrollView>
                </Animated.View>
                {fileList.length>0? 
                    <ImageView
                        images={fileList.map(item=>{return {uri:item.uri}})}
                        imageIndex={selectedImnage!==-1?selectedImnage:0}
                        visible={isVisible}
                        FooterComponent={({ imageIndex }) => (
                            <>
                             {expanded?<></>:
                            <ImageFooter imageIndex={imageIndex}  />}
                            </>
                           
                          )}
                        onRequestClose={() => setIsVisible(false)}
                    />:null}
                    {console.log(deviceData)}
                     {deviceData.plant_id !=='' ?                         
                    <ImageView
                        images={deviceData.image.map(item=> {return {uri:item.img}})}
                        imageIndex={selectedImnage!==-1?selectedImnage:0}
                        visible={isVisible}
                        onRequestClose={() => setIsVisible(false)}
                    />:null}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                    setModalVisible(!modalVisible);
                    }}>
                    <View  style={styles.modal} >
                        <View style={{flex:1}}>
                            <TouchableOpacity style={{flex:0.75}} activeOpacity={1} onPress={()=>setModalVisible(false)} >
                            </TouchableOpacity>
                            <View style={{flex:0.25,
                                        width:'100%',
                                        backgroundColor:'#2E333A',
                                        paddingHorizontal:20*constants.widthRatio}}>
                                <TouchableOpacity style={styles.imageLibBtn} onPress={()=>{
                                    navigation.navigate('Image',{photo:fileList,max:maxImage-fileList.length, token: route.params.token})
                                    setModalVisible(false)
                                    }}>
                                    <MaterialIcons name="insert-photo" size={30} color="white" />
                                    <Text style={styles.imageBtnDes}>{i18n.t('UploadFromAlbum')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>takePicture()}>
                                    <MaterialIcons name="camera-alt" size={30} color="white" />
                                    <Text style={styles.imageBtnDes}>{i18n.t('Camera')}</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </View>
                </Modal>    
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={login}
                    onRequestClose={() => {
                        setLogin(!login);
                        setEmail('')
                        setPassword('')
                        setPwOpen(false)
                    }}>
                    <View  style={styles.modal} >
                        <View style={{flex:1}}>
                            <TouchableOpacity style={{flex:0.35}} activeOpacity={1} onPress={()=>{
                                    setEmail('')
                                    setPassword('')
                                    setPwOpen(false)
                                    setLogin(false)}} >
                            </TouchableOpacity>
                            <View 
                                style={{
                                        height:250,
                                        width:'80%',
                                        backgroundColor:'#fff',
                                        borderRadius:10,
                                        justifyContent:'center',
                                        alignSelf:'center',
                                        elevation:20,
                                        paddingHorizontal:20*constants.widthRatio}}>
                                <Text style={{fontFamily:'M-SB',fontSize:12,alignSelf:'center',opacity:0.6,color:'#000000'}}>{i18n.t('verify')}</Text>
                                <InputComponent  
                                    onChangeText={nextValue => setEmail(nextValue)}
                                    value={email} 
                                    header={i18n.t("Email")} 
                                    style={{marginTop:'5%',width:'100%'}}
                                    bgColor="#FFF" 
                                    borderColor="#73B2B8" 
                                    borderNormal="rgba(0,0,0,0.12)"
                                    labelColor="#73B2B8" 
                                    blockSize={40} 
                                    textColor="rgba(0,0,0,0.87)" 
                                />
                                <InputComponent  
                                    onChangeText={nextValue => setPassword(nextValue)}
                                    value={password} 
                                    secureTextEntry={pwOpen}
                                    header={i18n.t("Password")} 
                                    style={{marginTop:'5%',width:'100%'}}
                                    bgColor="#FFF" 
                                    borderColor="#73B2B8" 
                                    borderNormal="rgba(0,0,0,0.12)"
                                    labelColor="#73B2B8" 
                                    blockSize={40} 
                                    rightAccessory={
                                        <TouchableOpacity onPress={()=>showProp()} >
                                            <Ionicons name={eyeIcon} size={25} color="grey"  />
                                        </TouchableOpacity>}
                                    textColor="rgba(0,0,0,0.87)" 
                                />
                                <TouchableOpacity onPress={() => handleLogin()} style={[styles.submitBtn,{backgroundColor:'#73B2B8',alignItems:'center',marginVertical:'5%',elevation:10}]}>
                                    {submit?<ActivityIndicator size="small" color="white" />:<Text style={[styles.btnContent,{paddingVertical:'2.5%'}]}>{i18n.t("Login")}</Text>}
                                </TouchableOpacity>
                            </View>
                                <TouchableOpacity style={{flex:0.5}} activeOpacity={1} onPress={()=>{
                                    setEmail('')
                                    setPassword('')
                                    setPwOpen(false)
                                    setLogin(false)}} ></TouchableOpacity>
                            
                        </View>
                    </View>
                </Modal>                            
            
                                    
            </View>
          
        )
                                
    
}   


const styles = StyleSheet.create({
    header:{
        fontFamily:'M-SB',
        fontSize:14,
        color:'white'
    },
    modal:{
        flex:1, 
        justifyContent:'flex-end',
        backgroundColor:'rgba(0,0,0,0.3)',
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
        width: 75*constants.widthRatio,
        height: 75*constants.HeightRatio,
        marginBottom: 10*constants.HeightRatio,
        borderRadius:5,
        flex:0.5,
        aspectRatio:1
    },
    deleteBtn:{
        shadowOffset:{width:0,height:3},
        shadowOpacity:0.5,
        shadowRadius:3,
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
    imageBtnDes:{
        color:'#FFFFFF',
        fontFamily:'M-M',
        fontSize:14,
        marginLeft:30*constants.widthRatio,
        alignSelf:'center'
    },
    imageLibBtn:{
        flexDirection:'row',
        marginVertical:20*constants.HeightRatio
    },
    icon:{
        width:25,
        height:25
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    submitBtn:{
        paddingHorizontal:'20%',
        paddingVertical: '3%',
        justifyContent:'center',
        borderRadius:5,
        borderWidth:0,
        },
        root: {
            height: 64,
            backgroundColor: "#00000077",
            alignItems: "center",
            justifyContent: "center"
          },
          text: {
            fontSize: 17,
            color: "#FFF"
          }
        
})