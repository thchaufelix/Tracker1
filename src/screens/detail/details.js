import React, { useContext, useEffect } from 'react'
import { View,Text, StyleSheet, Modal,NativeModules,TouchableOpacity } from 'react-native'
import * as Device from 'expo-device';
import i18n from 'i18n-js';
import { AccountContext } from '../../Context/authContext';
import { AccountContext2 } from '../../Context/authContext2';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios'
import * as constants from '../../global/constants'
import * as WebBrowser from 'expo-web-browser';
import { NotiContext } from '../../Context/notContext';

const {IBeaconPlaygroundModule} = NativeModules;


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





export default function DetailScreen({navigation}){
    
   const { deviceData,reloadStaffList, token,setDeviceData } = useContext(AccountContext2)
   const { config } = useContext(NotiContext)
   const authToken = 'Token ' + token
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
                            if(PlantData.paired_staff.length>0){
                                setOnCarList(PlantData.paired_staff)
                                setSelectedData([...PlantData.paired_staff])
                            }else{
                            }
                          

                        })
                        // navigation.navigate(AppRoute.RTC,{screen:AppRoute.RTC})
        
                    }else{
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
 

    return(
        <View style={{backgroundColor:'#2E333A',flex:1}}>
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
            <View style={{flex:0.05,backgroundColor:'#2E333A'}}>
               
            </View>
            <View style={{flex:0.85,backgroundColor:'#2E333A'}}>
                <View style={[styles.dataBox,styles.upperBox]}>
                    <Text style={[styles.header]}>IMEI</Text>
                    <Text style={[styles.data]}>{deviceData.imei}</Text>
                </View>
                <View style={[styles.dataBox]}>
                    <Text style={[styles.header]}>{i18n.t('Series')}</Text>
                    <Text style={[styles.data]}>{deviceData.series}</Text>
                </View>
                <View style={[styles.dataBox]}>
                    <Text style={[styles.header]}>{i18n.t('Paired')}{i18n.t('Plant')}</Text>
                    <Text style={[styles.data]}>{deviceData.label?deviceData.label:''}{deviceData.code?'('+deviceData.code+')':''}</Text>
                </View>
                <View style={[styles.dataBox,styles.lowerBox]}>
                    <Text style={[styles.header]}>{i18n.t('LastUpated')}</Text>
                    <Text style={[styles.data]}>{deviceData.last_updated}</Text>
                </View>
                <View style={[styles.dataBox,styles.lowerBox]}>
                    <Text style={[styles.header]}>{i18n.t('Version')}</Text>
                    <Text style={[styles.data]}>{constants.systemVersion}</Text>
                </View>
                {/* <View style={{marginTop:'10%'}}>
                    <TouchableOpacity onPress={()=>handleUpgradePressed()} style={[styles.submitBtn,{backgroundColor:'#73B2B8',width:'80%',alignSelf:'center'}]}>
                        <Text style={[styles.data,{textAlign:'center',alignSelf:'center'}]}>UPGRADE</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
           
        </View>
    )
}

const styles = StyleSheet.create({
    header:{
        fontFamily:'M-M',
        fontSize:14,
        color:'#FFF',
        width:'40%'
    },
    data:{
        fontFamily:'M-R',
        fontSize:14,
        color:'#FFF',
        width:'60%'
    },
    dataBox:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginHorizontal:'2%',
        backgroundColor:'#212731',
        paddingHorizontal:'5%',
        paddingVertical:'5%',
    },
    upperBox:{
        marginTop:'2%',
        borderTopRightRadius:10,
        borderTopLeftRadius:10
    },
    lowerBox:{
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10
    },
   
})