import React, {useContext, useEffect, useState} from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Modal,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import i18n from 'i18n-js';
import axios from 'axios'
import * as constants from '../../global/constants'
import InputComponent from '../../component/form/input'
import {AccountContext} from '../../Context/authContext';
import ImageView from "react-native-image-viewing";
import {AppRoute} from '../../navigator/appRoutes';
import {useKeepAwake} from "expo-keep-awake";
import {NotiContext} from '../../Context/notContext';
import {useIsFocused} from "@react-navigation/native";

const {IBeaconPlaygroundModule} = NativeModules;


export default function LinkScreen({navigation, route}) {
  useKeepAwake()
  const [submit, setSubmit] = useState(false)
  const animationDuration = 200
  const {
    token,
    deviceData,
    handleData,
    setBgColor,
    bData,
    setDeviceData,
    reloadStaffList,
    getDeviceData
  } = useContext(AccountContext)
  const haveData = deviceData.plant_id !== ''
  const authToken = 'Token ' + token
  const [fileList, setFileList] = useState(deviceData.image)
  const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(haveData ? 1 : 0))
  const [expanded, setExpanded] = useState(haveData)
  const [modalVisible, setModalVisible] = useState(false)
  const [animatedSize, setAnimatedSize] = useState(new Animated.Value(haveData ? 1 : 0))
  const [login, setLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [plantList, setPlantList] = useState([])
  const [plant, setPlant] = useState('')
  const [search, setSearch] = useState('')
  const [filterData, setFilterData] = useState([])
  const [pwOpen, setPwOpen] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedImnage, setSelectedImage] = useState(-1)
  const [eyeIcon, setEye] = useState('ios-eye')
  const {config} = useContext(NotiContext)
  const isFocused = useIsFocused();


  useEffect(() => {

    if (config) {
      const newDeviceData = {
        ...deviceData,
        code: "",
        label: "",
        plant_id: '',
        remark: '',
        last_updated: '',
        driver: [],
        image: [],
        wl: []
      }

      reloadStaffList(authToken)
      if (config.project_id === deviceData.pj) {
        if (config.pf_id) {
          if (deviceData.plant_id === config.pf_id) {
            if (config.wwl_include_staff) {
              navigation.navigate(AppRoute.RTC, {screen: AppRoute.RTC})
            } else {
              navigation.navigate(AppRoute.WLNAV, {screen: AppRoute.WLNAV})
            }
          } else {
            axios.get(constants.deviceApi, {
              params: {
                paired_staff__isnull: true,
                imei: deviceData.imei
              }, headers: {
                Authorization: authToken,
                "Fcm-Imei": deviceData.imei
              },
            }).then((DeviceData) => {
              const plantData = DeviceData.data[0].paired_plant[0]
              setDeviceData({
                ...deviceData,
                plant_id: plantData.id,
                label: plantData.label,
                code: plantData.code,
                remark: plantData.remark,
                image: plantData.img.map(item => item.img),
                last_updated: plantData.updated_at
              })
            }).finally(() => navigation.navigate(AppRoute.WLNAV, {screen: AppRoute.WLNAV}))
          }
        } else {
          setDeviceData({
            ...newDeviceData,
            pj: newDeviceData.pj
          })
          navigation.navigate(AppRoute.LINKAGE, {screen: AppRoute.LINKAGE})
        }
      } else {
        setDeviceData({
          ...newDeviceData,
          pj: config.project_id ? config.project_id : ''
        })

        navigation.navigate(AppRoute.AUTH, {screen: AppRoute.SIGNIN})
      }

    }

  }, [config])

  const showProp = () => {
    setPwOpen(!pwOpen)
    setEye(eyeIcon === 'ios-eye' ? 'ios-eye-off' : 'ios-eye')
  }

  // useEffect(() => {
  //   //   console.log(bData)
  // }, [bData])

  useEffect(() => {
    // setSubmit(false)
    console.log(deviceData)
    axios.get(constants.plantApi, {
      headers: {
        Authorization: authToken,
        "Fcm-Imei": deviceData.imei
      },
    }).then((response) => {
      // console.log(response.data)
      const filterList = response.data.filter(item => !item.is_locked)
      setPlantList(filterList)
      setFilterData(filterList)
    })


    // const keyboardDidShowListener = Keyboard.addListener(
    //   'keyboardDidShow',
    //   () => {
    //     keyboardWillShow(); // or some other action
    //   }
    // );
    // const keyboardDidHideListener = Keyboard.addListener(
    //   'keyboardDidHide',
    //   () => {
    //     keyboardWillHide(); // or some other action
    //   }
    // );

    // return () => {
    //   keyboardDidHideListener.remove();
    //   keyboardDidShowListener.remove();
    // };

  }, [isFocused]);

  // const keyboardWillShow = () => {
  //         Animated.timing(animatedSize, {
  //             toValue: 1,
  //             useNativeDriver:false
  //           }).start();


  // }

  // const keyboardWillHide = () => {
  //     console.log(login)
  //         Animated.timing(animatedSize, {
  //             toValue: 0,
  //         useNativeDriver:false
  //       }).start();

  // }
  const convertDateTime = (time) => {
    const newTime = new Date(time)
    // const result = newTime.getFullYear() + '-' + (newTime.getMonth() + 1) + '-' + newTime.getDate() + ' ' + newTime.getHours() + ':' + newTime.getMinutes()
    return `${newTime.getFullYear()}-${(newTime.getMonth() + 1)}-${newTime.getDate()} ${newTime.getHours()}:${newTime.getMinutes()}`
  }


  const handleLogin = () => {
    console.log(submit)
    //     const formData = new FormData()
    //     formData.append('username','bryan@cerebrohk.com')
    //     formData.append('password','123456')
    //     console.log(formData)
    //     await axios.post(constants.loginApi,formData    ).then(async function (response){
    //         if(deviceData.plant_id!==''){
    //             handleUnlink('Token '+ response.data.token)
    //         }else{
    //             await axios.get(constants.userDataApi+'/loaduser',{
    //                 headers: {
    //                     Authorization: authToken,
    //                     // "Fcm-Imei":deviceData.imei
    //                     },
    //                 }).then(async function (loadUserData){
    //                     const adminToken = 'Token '+ response.data.token
    //                     navigation.navigate('LinkCreate',{token:adminToken,projects:loadUserData.default_project.id})
    //                     setLogin(false)
    //                     setEmail('')
    //                     setPassword('')
    //                     setPwOpen(false)
    //             })

    //         }

    //     }).catch(function (error){
    //         console.log(error)
    //         alert(i18n.t('WrongInfo'))
    //     })

    if (!submit) {
      setSubmit(true)
      axios.post(constants.loginApi, {
        username: email.replace(' ', '').toLowerCase(),
        password
      }).then((response) => {
        console.log(response.data.token)
        // await axios.get(constants.userDataApi+'/loaduser',{
        //     headers: {
        //         Authorization: 'Token '+ response.data.token,
        //         // "Fcm-Imei":deviceData.imei
        //         },
        //     }).then(async function (loadUserData){
        // console.log(loadUserData.data)
        const adminToken = 'Token ' + response.data.token
        if (deviceData.plant_id !== "") {
          handleUnlink(adminToken)
        } else {
          setLogin(false)
          setEmail('')
          setSubmit(false)
          setPassword('')
          setPwOpen(false)
          navigation.navigate('LinkCreate', {token: adminToken})

        }


        // })


      }).catch((error) => {
        console.log(error)
        alert(i18n.t('WrongInfo'))
        setSubmit(false)
      })
    }

  }


  // const maxImage = constants.maxImage
  const handlerSubmit = async () => {
    if (deviceData.tracker_id == '') {
      getDeviceData()
    }
    if (!submit) {
      console.log(constants.plantApi + '/' + plant.id + '/addtracker', authToken, deviceData.imei, deviceData.tracker_id)
      if (plant !== '') {
        setSubmit(true)
        await axios.patch(constants.plantApi + '/' + plant.id + '/addtracker',
          {
            "paired_tracker_id": deviceData.tracker_id
          },
          {
            headers: {
              Authorization: authToken,
              "Fcm-Imei": deviceData.imei
            },
          }).then(async function (response) {
          const newDeviceData = {...deviceData}
          newDeviceData.code = plant.code
          newDeviceData.label = plant.label
          newDeviceData.plant_id = plant.plant_id
          newDeviceData.remark = plant.remark
          newDeviceData.image = plant.img.map(item => item.img)
          newDeviceData.plant_id = plant.id
          newDeviceData.driver = plant.driver
          newDeviceData.last_updated = convertDateTime(new Date())
          handleData(newDeviceData)
          toggleDropdown()
          setSubmit(false)
          // IBeaconPlaygroundModule.startScanning();
          navigation.navigate('WLNav')
          const newBgColor = new Array(6).fill('#2E333A')
          newBgColor[3] = '#73B2B8'
          setBgColor(newBgColor)
        }).catch(function (error) {
          console.log(error.message);
          setSubmit(false)
        });
      } else {
        alert(i18n.t('atLessOneP'))
        setSubmit(false)
      }

    }


  }
  const toggleDropdown = () => {
    if (expanded == true) {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: false
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
        useNativeDriver: false
      }).start()
    }
  }

  const interpolatedHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['70%', '60%']
  })


  const moveX1 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, constants.windowWidth * 0.1],
  });

  const moveX2 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -constants.windowWidth * 0.015],
  });

  const moveY1 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -constants.windowHeight * 0.025],
  });

  const moveY2 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, constants.windowHeight * 0.025],
  });

  const moveX3 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -constants.windowWidth * 0.11],
  });

  const moveY3 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, constants.windowHeight * 0.08],
  });

  const scale1 = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3]
  });

  const scale2 = animatedSize.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7]
  });

  const moveY4 = animatedSize.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -constants.windowHeight * 0.12]
  });

  const moveBot = animatedSize.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0]
  });

  const formOpacity = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const DisableOpacity = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });


  // const deleteImage = (index) => {
  //     var array = [...fileList]
  //     const fileLength = array.length
  //     array.splice(index, 1)
  //     setFileList(array)
  // }


  // useEffect(()=> {
  //     setFileList(route.params.photo)
  //     console.log(fileList)

  // },[route.params.photo])


  // const renderItem = ({ item, index}) => {
  //     const pressHandler = (index) => {
  //         // var array = [...fileList]
  //         // setSelectedImage(index)
  //         // setIsVisible(true)
  //     }
  //     if(expanded){
  //         return(
  //             <TouchableOpacity style={{flex:1,aspectRatio:1}} onPress={() => pressHandler(index)} >
  //                 <Image style={{width:70*constants.HeightRatio,height:70*constants.HeightRatio}} resizeMode='cover' source={{isStatic:true,uri:item}} key={index+'_'+item.name+'_image'} />
  //             </TouchableOpacity>
  //         )
  //     }else{

  //     return(
  //         <View key={index+'_'+item.name} style={{marginVertical:'2%'}}>
  //             <TouchableOpacity style={[styles.deleteBtn,{right:'10%'}]} onPress={() => deleteImage(index)} >
  //                 <MaterialIcons style={{padding:5}} name="close" size={24} color="white" />
  //             </TouchableOpacity>
  //             <TouchableOpacity style={{flex:1/2,aspectRatio:1}} onPress={() => pressHandler(index)} >
  //                 <Image style={styles.image} resizeMode='cover' source={{isStatic:true,uri:item.uri}} key={index+'_'+item.name+'_image'} />
  //             </TouchableOpacity>

  //         </View>
  //     )
  //     }

  // }

  // const takePicture = async () => {
  //     setModalVisible(false)

  //     // const [status, requestPermission] = ImagePicker.useCameraPermissions();
  //     // if (status === 'granted'){
  //         let result = await ImagePicker.launchCameraAsync({
  //             mediaTypes: ImagePicker.MediaTypeOptions.All,
  //             allowsEditing: false,
  //             aspect: [4, 3],
  //             quality: 1,
  //         })
  //         if (!result.cancelled) {
  //                 const uri =  "file:///" + result.uri.split("file:/").join("");
  //                 setFileList([...fileList,{
  //                     uri,
  //                     image:{name:uri.split("/").pop(),type:mime.getType(uri),uri:uri}
  //                 }])
  //             }

  //     // }
  // }


  const handleUnlink = async (token) => {
    console.log(constants.projAdminApi + 'plant/' + deviceData.plant_id + '/unlink?project=' + deviceData.pj)
    const config = {
      method: 'PATCH',
      url: constants.projAdminApi + 'plant/' + deviceData.plant_id + '/unlink?project=' + deviceData.pj,
      headers: {
        'Authorization': token,
      },
    };
    axios(config)
      .then(function (response) {
        console.log(response.data)
        setLogin(false)
        handleData({
          ...deviceData,
          code: '',
          label: '',
          plant_id: '',
          remark: '',
          image: [],
          last_updated: convertDateTime(new Date())
        })
        // navigation.popToTop()
        setSubmit(false)
        navigation.navigate(AppRoute.AUTH)

        // const resetAction = StackActions.reset({
        //     index: 0,
        //     key: null,
        //     actions: [
        //       NavigationActions.navigate({
        //         routeName: AppRoute.LINKAGE,
        //         action: NavigationActions.navigate({
        //           routeName:AppRoute.AUTH,
        //           params:{}
        //         })
        //       })
        //     ]
        //   });
        //   navigation.dispatch(resetAction);
      })
      .catch(function (error) {
        console.log(error.message);
        setSubmit(false)
      });


  }
  const renderItem = ({item, index}) => {
    const pressHandler = (index) => {
      console.log(item)
      console.log(deviceData)
      console.log(plant)
      setSearch(item.code)
      setPlant(item)
      setFilterData([])
    }

    return (
      <TouchableOpacity key={item.id + '_' + item.name_eng}
                        style={{marginTop: '3%', flexDirection: 'row', paddingVertical: '5%'}}
                        onPress={() => pressHandler(index)}>
        <View style={{flex: 0.2}}>
          <MaterialIcons name="directions-car" size={24} color="black"/>
        </View>
        <View style={{flex: 0.8, justifyContent: 'center'}}>
          <Text style={{fontSize: 14, fontFamily: 'M-M', color: '#2E333A'}}>{item.code}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const closeFilter = () => {
    setFilterData(plantList)
    setSearch('')
    setPlant('')
  }

  const renderImageItem = ({item, index}) => {
    const pressHandler = (index) => {
      console.log(item)
      setSelectedImage(index)
      setIsVisible(true)
    }
    return (
      <TouchableOpacity key={'image_' + index} style={{aspectRatio: 1}} onPress={() => pressHandler(index)}>
        {/* <Text>{item}</Text> */}

        <Image style={{width: 70 * constants.HeightRatio, height: 70 * constants.HeightRatio}} resizeMode='cover'
               source={{isStatic: true, uri: item.img ? item.img : item}} key={'image_' + item.id}/>
      </TouchableOpacity>
    )

  }

  const renderDriverItem = ({item, index}) => {
    const pressHandler = (index) => {
      // var array = [...fileList]
      // setSelectedImage(index)
      // setIsVisible(true)
    }
    return (
      <TouchableOpacity key={'drive_' + index} style={{flex: 1, aspectRatio: 1}} onPress={() => pressHandler(index)}>
        <Text style={{color: '#73B2B8', fontFamily: 'M-SB', fontSize: 13}}>{item.contractor_name}</Text>
        <Text style={{color: 'rgba(0,0,0,0.87)', fontFamily: 'M-SB', fontSize: 16}}>{item.full_name}</Text>
      </TouchableOpacity>
    )

  }


  const NavigationDrawerStructure = (props) => {
    //Structure for the navigatin Drawer
    const toggleDrawer = () => {
      //Props to open/close the drawer
      props.navigationProps.toggleDrawer();
    };

    return (
      <MaterialIcons onPress={toggleDrawer} name="menu" size={24} color="white" style={{marginLeft: 15}}/>
    );
  };
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 0.1, backgroundColor: '#2E333A'}}>
        <View style={{flexDirection: 'row', position: 'absolute', bottom: 0, zIndex: 100}}>
          <View style={{flex: 0.3}}>
            <NavigationDrawerStructure navigationProps={navigation}/>
          </View>
          <View style={{flex: 0.7}}>
            <Text style={{
              color: 'white',
              fontFamily: 'M-SB',
              fontSize: 18,
              justifyContent: 'center'
            }}> {i18n.t('Linkage')}</Text>
          </View>
        </View>


      </View>
      <View style={{flex: 0.2, backgroundColor: '#2E333A', justifyContent: 'center'}}>

        <View style={[{alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}]}>
          <Animated.View style={[{
            height: 175 * constants.HeightRatio,
            width: 175 * constants.HeightRatio,
            borderWidth: 2,
            borderColor: '#98D4D4',
            borderStyle: 'dashed',
            borderRadius: 175 * constants.HeightRatio,
            position: 'absolute',
            top: -25,
            left: '25%'
          }, {opacity: DisableOpacity}]}></Animated.View>
          <Animated.Image
            style={[{marginRight: '3%'}, {transform: [{scale: scale1}, {translateX: moveX1}, {translateY: moveY1}]}]}
            source={require('../../../assets/image/tracker-tag.png')}/>
          <Animated.View style={[styles.dot, {opacity: formOpacity}]}></Animated.View>
          <Animated.View style={[styles.dot, {opacity: formOpacity}, {backgroundColor: '#73B2B8'}]}></Animated.View>
          <Animated.Image
            style={[{marginHorizontal: '3%'}, {transform: [{scale: scale1}, {translateY: moveY2}, {translateX: moveX2}]}]}
            source={require('../../../assets/image/linkage.png')}/>
          <Animated.View style={[styles.dot, {opacity: formOpacity}, {backgroundColor: '#73B2B8'}]}></Animated.View>
          <Animated.View style={[styles.dot, {opacity: formOpacity}]}></Animated.View>
          <Animated.Image style={[{}, {transform: [{scale: scale1}, {translateY: moveY3}, {translateX: moveX3}]}]}
                          source={require('../../../assets/image/car.png')}/>
        </View>

      </View>
      <View style={{flex: 0.2, backgroundColor: '#2E333A', zIndex: -1}}>

        {console.log(deviceData.image)}
      </View>

      <Animated.View style={[{
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%'
      }, {height: interpolatedHeight, bottom: moveBot}]}>
        <View style={{alignSelf: 'flex-end', marginTop: '7.5%', marginRight: '10%'}}>
          {deviceData.plant_id !== "" ?
            <TouchableOpacity onPress={() => setLogin(true)}>
              <Text style={{
                color: '#B00020',
                fontFamily: 'M-SB',
                fontSize: 14,
                letterSpacing: 1
              }}>{i18n.t('Unlink')}{i18n.t('Plant')}</Text>
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={() => setLogin(true)}>
              <Text style={{
                color: '#73B2B8',
                fontFamily: 'M-SB',
                fontSize: 14,
                letterSpacing: 1
              }}>{i18n.t('Add')}{i18n.t('Plant')}</Text>
            </TouchableOpacity>}

        </View>
        {deviceData.plant_id == '' ?
          <View style={{marginHorizontal: '10%'}}>
            <InputComponent
              onChangeText={text => {
                setSearch(text)
                const newFilterData = plantList.filter(item => item.code.toLowerCase().includes(text.toLowerCase()))
                setFilterData(newFilterData)
              }}
              renderItem={renderItem}
              value={search}
              // setFilterData={setFilterData}
              // setSearch={setSearch}
              // setData={setPlant}
              header={i18n.t("Code")}
              style={{marginTop: '5%'}}
              bgColor="#FFF"
              filterData={filterData}
              data={plantList}
              rightAccessory={<TouchableOpacity onPress={() => closeFilter()}>
                <MaterialIcons name="close" size={24} color="black"/>
              </TouchableOpacity>}
              // disabled={true}
              borderColor="#73B2B8"
              borderNormal="rgba(0,0,0,0.12)"
              labelColor="#73B2B8"
              blockSize={40}
              textColor="rgba(0,0,0,0.87)"
            />
          </View> : null}
        <ScrollView style={{flex: 1}}>
          <TouchableOpacity style={{width: '100%', height: '80%'}} activeOpacity={1} onPress={Keyboard.dismiss}>
            <View style={{flexDirection: 'row', justifyContent: "center", height: constants.windowHeight / 1.1}}>

              <View style={{width: '80%'}}>

                {deviceData.plant_id !== '' ?
                  <View style={{marginTop: '4%'}}>
                    <Text style={{color: 'rgba(0,0,0,0.6)', fontFamily: 'M-M', fontSize: 12}}>{i18n.t("Code")}</Text>
                    <Text style={{color: 'rgba(0,0,0,0.87)', fontFamily: 'M-SB', fontSize: 16}}>{deviceData.code}</Text>
                  </View> :
                  null}
                {deviceData.plant_id !== '' ?
                  <>
                    <View style={{marginTop: '4%'}}>
                      <Text style={{color: 'rgba(0,0,0,0.6)', fontFamily: 'M-M', fontSize: 12}}>{i18n.t("Name")}</Text>
                      <Text
                        style={{color: 'rgba(0,0,0,0.87)', fontFamily: 'M-SB', fontSize: 16}}>{deviceData.label} </Text>
                    </View>
                    <View style={{marginTop: '4%'}}>
                      <Text
                        style={{color: 'rgba(0,0,0,0.6)', fontFamily: 'M-M', fontSize: 12}}>{i18n.t("Location")} </Text>
                      <Text
                        style={{color: 'rgba(0,0,0,0.87)', fontFamily: 'M-SB', fontSize: 16}}>{deviceData.remark}</Text>
                    </View>

                    <View style={{flexDirection: 'row', marginTop: '3%'}}>
                      {deviceData.image.length > 0 ?
                        <View>
                          <Text style={{
                            fontFamily: 'M-SB',
                            color: '#73B2B8',
                            fontSize: 18
                          }}>{i18n.t('Plant')}{i18n.t('Image')}</Text>
                          <FlatList style={{marginTop: '3%'}} horizontal={true} data={deviceData.image}
                                    renderItem={renderImageItem} keyExtractor={item => item.name}/>

                        </View>
                        : null}

                    </View>
                  </>
                  :
                  <>
                    {plant !== '' ?
                      <View>
                        <View style={{marginTop: '4%'}}>
                          <Text
                            style={{color: 'rgba(0,0,0,0.6)', fontFamily: 'M-M', fontSize: 12}}>{i18n.t("Name")}</Text>
                          <Text
                            style={{color: 'rgba(0,0,0,0.87)', fontFamily: 'M-SB', fontSize: 16}}>{plant.label}</Text>
                        </View>
                        <View style={{marginTop: '4%'}}>
                          <Text style={{
                            color: 'rgba(0,0,0,0.6)',
                            fontFamily: 'M-M',
                            fontSize: 12
                          }}>{i18n.t("Location")}</Text>
                          <Text
                            style={{color: 'rgba(0,0,0,0.87)', fontFamily: 'M-SB', fontSize: 16}}>{plant.remark}</Text>
                        </View>
                        {plant.driver.length > 0 ?
                          <View style={{marginTop: '4%'}}>
                            <Text style={{
                              color: 'rgba(0,0,0,0.6)',
                              fontFamily: 'M-M',
                              fontSize: 12
                            }}>{i18n.t("Driver")}</Text>
                            <FlatList horizontal={true} data={plant.driver} renderItem={renderDriverItem}
                                      keyExtractor={item => item.full_name}/>

                          </View>
                          :
                          null
                        }

                        {/* <View style={{marginTop:'4%'}}>
                                                
                                                <Text style={{color:'rgba(0,0,0,0.87)',fontFamily:'M-SB',fontSize:16}}>{plant.driver.full_name?plant.driver.full_name:i18n.t('Unassigned')}</Text>
                                            </View> */}
                        {console.log(plant)}
                        <View style={{flexDirection: 'column', marginTop: '3%'}}>
                          {plant != '' && plant.img.length > 0 ?
                            <View>
                              <Text style={{
                                fontFamily: 'M-SB',
                                color: '#73B2B8',
                                fontSize: 18
                              }}>{i18n.t('Plant')}{i18n.t('Image')}</Text>
                              {/* <Text style={{fontFamily:'M-SB',color:'#73B2B8',fontSize:18}}>{plant.img.length}</Text> */}

                              <FlatList horizontal={true} style={{marginTop: '3%'}} data={plant.img}
                                        renderItem={renderImageItem} keyExtractor={item => item.name}/>

                            </View>
                            :
                            null
                          }

                        </View>
                      </View>
                      :
                      null}
                  </>}


              </View>


            </View>


          </TouchableOpacity>

        </ScrollView>

        <View style={{height: 100, justifyContent: 'center'}}>
          {deviceData.plant_id !== "" ?
            <View style={{}}>
              <TouchableOpacity style={{alignSelf: 'center', padding: 12}} onPress={() => {
                // const newBgColor = new Array(6).fill('#2E333A')
                // newBgColor[3] = '#73B2B8'
                // setBgColor(newBgColor)
                // navigation.navigate('WLNav')
                navigation.openDrawer()
              }}>
                <Text style={{
                  color: '#73B2B8',
                  fontSize: 14,
                  fontFamily: 'M-SB',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>{i18n.t('Pair')}{i18n.t('User')}</Text>
              </TouchableOpacity>
            </View> :
            <TouchableOpacity onPress={() => handlerSubmit()} style={{
              width: '80%',
              alignSelf: 'center',
              backgroundColor: '#73B2B8',
              borderWidth: 0,
              elevation: 2,
              marginBottom: '10%',
              paddingVertical: '3%',
              alignItems: 'center',
              borderRadius: 5,
              marginTop: '5%'
            }}>
              {submit ? <ActivityIndicator size="small" color="white"/> :
                <Text style={[styles.btnContent]}>{i18n.t("LINK")}</Text>}
            </TouchableOpacity>

          }
        </View>
      </Animated.View>
      {expanded ?
        <>
          {deviceData.image.length !== 0 ?
            <ImageView
              images={deviceData.image.map(item => {
                return {uri: item}
              })}
              imageIndex={selectedImnage !== -1 ? selectedImnage : 0}
              visible={isVisible}
              onRequestClose={() => setIsVisible(false)}
            />
            : null}
        </> :
        // null
        <>
          {plant !== "" && plant.img.length !== 0 ?
            <ImageView
              images={plant.img.map(item => {
                return {uri: item.img}
              })}
              imageIndex={selectedImnage !== -1 ? selectedImnage : 0}
              visible={isVisible}
              onRequestClose={() => setIsVisible(false)}
            />
            : null}

        </>

      }
      {/* {plant.img.length!==0 && deviceData.image.length !==0 ?
                 <ImageView
                    images={plant!==''?plant.img.map(item=> {return {uri:item.img}}):deviceData.image.map(item=> {return {uri:item}})}
                    imageIndex={selectedImnage!==-1?selectedImnage:0}
                    visible={isVisible}
                    onRequestClose={() => setIsVisible(false)}
                />                  
               :null} */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modal}>
          <View style={{flex: 1}}>
            <TouchableOpacity style={{flex: 0.75}} activeOpacity={1} onPress={() => setModalVisible(false)}>
            </TouchableOpacity>
            <View style={{
              flex: 0.25,
              width: '100%',
              backgroundColor: '#2E333A',
              paddingHorizontal: 20 * constants.widthRatio
            }}>
              <TouchableOpacity style={styles.imageLibBtn} onPress={() => {
                navigation.navigate('Image', {photo: fileList, max: maxImage - fileList.length})
                setModalVisible(false)
              }}>
                <MaterialIcons name="insert-photo" size={30} color="white"/>
                <Text style={styles.imageBtnDes}>{i18n.t('UploadFromAlbum')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => takePicture()}>
                <MaterialIcons name="camera-alt" size={30} color="white"/>
                <Text style={styles.imageBtnDes}>{i18n.t('Camera')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
      <Modal animationType="slide"
             transparent={true}
             visible={login}
             onRequestClose={() => {
               setLogin(!login);
               setEmail('')
               setPassword('')
               setPwOpen(false)
             }}>
        <View style={styles.modal}>
          <View style={{flex: 1}}>

            <TouchableOpacity style={{flex: 0.35}} activeOpacity={1} onPress={() => {
              setEmail('')
              setPassword('')
              setPwOpen(false)
              setLogin(false)
            }}>
            </TouchableOpacity>
            <View style={{
              height: 250,
              width: '80%',
              backgroundColor: '#fff',
              borderRadius: 10,
              justifyContent: 'center',
              alignSelf: 'center',
              elevation: 20,
              paddingHorizontal: 20 * constants.widthRatio
            }}>
              <Text style={{
                fontFamily: 'M-SB',
                fontSize: 12,
                alignSelf: 'center',
                opacity: 0.6,
                color: '#000000'
              }}>{i18n.t('verify')}</Text>
              <InputComponent onChangeText={nextValue => setEmail(nextValue)}
                              value={email}
                              header={i18n.t("Email")}
                              style={{marginTop: '5%', width: '100%'}}
                              bgColor="#FFF"
                              borderColor="#73B2B8"
                              borderNormal="rgba(0,0,0,0.12)"
                              labelColor="#73B2B8"
                              blockSize={40}
                              textColor="rgba(0,0,0,0.87)"
              />
              <InputComponent onChangeText={nextValue => setPassword(nextValue)}
                              value={password}
                              secureTextEntry={pwOpen}
                              header={i18n.t("Password")}
                              style={{marginTop: '5%', width: '100%'}}
                              bgColor="#FFF"
                              borderColor="#73B2B8"
                              borderNormal="rgba(0,0,0,0.12)"
                              labelColor="#73B2B8"
                              blockSize={40}
                              rightAccessory={
                                <TouchableOpacity onPress={() => showProp()}>
                                  <Ionicons name={eyeIcon} size={25} color="grey"/>
                                </TouchableOpacity>}
                              textColor="rgba(0,0,0,0.87)"
              />
              <TouchableOpacity onPress={() => handleLogin()} style={[styles.submitBtn, {
                backgroundColor: '#73B2B8',
                alignItems: 'center',
                marginVertical: '5%',
                elevation: 10
              }]}>
                {submit ? <ActivityIndicator size="small" color="white"/> :
                  <Text style={[styles.btnContent, {paddingVertical: '2.5%'}]}>{i18n.t("Login")}</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{flex: 0.5}} activeOpacity={1} onPress={() => {
              setEmail('')
              setPassword('')
              setPwOpen(false)
              setLogin(false)
            }}></TouchableOpacity>

          </View>
        </View>
      </Modal>


    </View>

  )


}


const styles = StyleSheet.create({
  header: {
    fontFamily: 'M-SB',
    fontSize: 14,
    color: 'white'
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  footer: {
    fontFamily: 'M-SBL',
    fontSize: 14,
    color: '#73B2B8'
  },
  alertText: {
    fontFamily: 'M-SB',
    color: 'white',
    fontSize: 15
  },
  button: {
    marginHorizontal: '10%',
    backgroundColor: '#73B2B8',
    borderWidth: 0,
    elevation: 2
  },
  dot: {
    backgroundColor: '#98D4D4',
    height: 8,
    width: 8,
    borderRadius: 8,
    marginHorizontal: '2%'
  },
  image: {
    width: 75 * constants.widthRatio,
    height: 75 * constants.HeightRatio,
    marginBottom: 10 * constants.HeightRatio,
    borderRadius: 5,
    flex: 0.5,
    aspectRatio: 1
  },
  deleteBtn: {
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    zIndex: 5,
    position: 'absolute',
    elevation: 20
  },
  btnContent: {
    fontFamily: 'M-SB',
    color: 'white',
    fontSize: 14,
    letterSpacing: 5
  },
  imageBtnDes: {
    color: '#FFFFFF',
    fontFamily: 'M-M',
    fontSize: 14,
    marginLeft: 30 * constants.widthRatio,
    alignSelf: 'center'
  },
  imageLibBtn: {
    flexDirection: 'row',
    marginVertical: 20 * constants.HeightRatio
  },
  icon: {
    width: 25,
    height: 25
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  submitBtn: {
    paddingHorizontal: '20%',
    paddingVertical: '3%',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 0,
  },

})