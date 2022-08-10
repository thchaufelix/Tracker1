import React,{ useState, useEffect, useContext }from 'react'


import * as Permissions from 'expo-permissions'
import mime from "mime";
import { View,Platform,TouchableOpacity, Text,SafeAreaView,StyleSheet,ImageBackground } from 'react-native';
import {Camera} from 'expo-camera'
import { MaterialIcons } from '@expo/vector-icons';
// import PinchGesture from '../shared/pinchableBox'
import { PinchGestureHandler } from 'react-native-gesture-handler';
import ImageView from "react-native-image-viewing";
import * as constants from '../../global/constants'
import i18n from 'i18n-js'


export default function CameraScreen ({navigation,route}) {
    const HIT_SLOP = { top: 16, left: 16, bottom: 16, right: 16 };
    useEffect(()=>{
        __startCamera()
    },[])
    const form = route.params.form
    const [startCamera,setStartCamera] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [capturedImage, setCapturedImage] = useState(null)
    const [flashMode, setFlashMode] = useState('off')
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back)
    const [zoom, setZoom ] = useState(0)
    let Camera1: Camera
   
    const __startCamera = async () => {
        const {status: camera} = await Permissions.askAsync(Permissions.CAMERA);
        if(camera === 'granted'){
            setStartCamera(true)
        
        }else{
            await Permissions.askAsync(Permissions.CAMERA);
        }
    }
    const __takePicture = async () => {
        if (!Camera1) return
        const photo = await Camera1.takePictureAsync()
        // console.log(photo)
        setPreviewVisible(true)
        setCapturedImage(photo)
    
    }
    
    const __handleFlashMode = () => {
        if (flashMode === 'on') {
          setFlashMode('off')
        } else if (flashMode === 'off') {
          setFlashMode('auto')
        } else if (flashMode === 'auto') {
          setFlashMode('on')
        }
    
      }

    // const __switchCamera = () => {
    //     if (cameraType === Camera.Constants.Type.back) {
    //         setCameraType(Camera.Constants.Type.front)
    //     } else {
    //         setCameraType(Camera.Constants.Type.back)
    //     }
    // }
    const onPinchGestureEvent = event => {
        // console.log(event.nativeEvent.scale);
        const zoomRate = 0.005
        if(event.nativeEvent.scale > 1){
            if(zoom + zoomRate > 1){
                setZoom(1)
            }else{
                setZoom(zoom+zoomRate)
            }
        }else if(event.nativeEvent.scale < 1){
            if(zoom - zoomRate < 0){
               setZoom(0)
            }else{
                setZoom(zoom-zoomRate) 
            }
        }
      }

    const CameraPreview = ({photo}: any,savePhoto,retakePicture) => {
        // console.log('sdsfds', photo)
        const footerComponent = () => {
            // console.log(image)
            const __retakePicture = () => {
                setCapturedImage(null)
                setPreviewVisible(false)
                __startCamera()
            }
    
            const __savePhoto = () => {
                if (Platform.OS === 'android'){
                    const uri =  "file:///" + capturedImage.uri.split("file:/").join("");
                    form.change(`image`, { 
                        uri,
                        remark:'',
                        image:{name:uri.split("/").pop(),type:mime.getType(uri),uri:uri}
                    })
                    navigation.goBack()
                }else if (Platform.OS === 'ios'){
                    form.change(`image`, { 
                        uri:capturedImage.uri,
                        remark:'',
                        image:{name:capturedImage.uri.split("/").pop(),type:mime.getType(capturedImage.uri),uri:capturedImage.uri}
                    
                    })
                    navigation.goBack()
                    
                    // navigation.navigate('StockAddNew', {photo:array})
               
              }
            }
            return(
               <View style={styles.footerBox}>
                   <TouchableOpacity style={styles.button} onPress={()=>__retakePicture()}>
                       <Text style={styles.buttonText}>Retake</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.button} onPress={()=>__savePhoto()}>
                       <Text style={styles.buttonText} >UsePhoto</Text>
                   </TouchableOpacity>
               </View>
            )
        }
        const headerComponent = () => {
            return(
                <View></View>
            )
        }
        return (
          <View
            style={{
              backgroundColor: 'transparent',
              flex: 1,
              width: '100%',
              height: '100%'
            }}
          >
             <ImageView
                images={[capturedImage]}
                imageIndex={0}
                onImageIndexChange={(index)=>console.log(index)}
                visible={previewVisible}
                // onRequestClose={() => setIsVisible(false)}
                FooterComponent={footerComponent}
                HeaderComponent={headerComponent}
                />
 
          </View>
        )
      }


    if(startCamera){
        if (previewVisible && capturedImage ){
            return(
                <CameraPreview photo={capturedImage} />
            )
        } else{

        
        return (
             
            <PinchGestureHandler
             onGestureEvent={onPinchGestureEvent}
            >
                {/* {console.log(this.state.room)} */}
            <View style={{flex:1}}>
            <Camera
                style={{flex: 1,width:"100%"}}
                ref={(r) => {
                    Camera1 = r
                }}
                type={cameraType}
                zoom={zoom}
                autoFocus={Camera.Constants.AutoFocus.on}
                flashMode={flashMode}
                >  
                <SafeAreaView style={styles.root}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={()=>navigation.navigate('StockAddNew', {photo:array})}
                        hitSlop={HIT_SLOP}
                    >
                        <MaterialIcons name="chevron-left" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.closeButton,{marginLeft: '10%',}]}
                        onPress={()=>__handleFlashMode()}
                        hitSlop={HIT_SLOP}
                    >
                        <MaterialIcons name={"flash-"+flashMode} size={24} color="white" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={[styles.closeButton,{marginLeft: '15%',}]}
                        onPress={()=>__switchCamera()}
                        hitSlop={HIT_SLOP}
                    >
                        <MaterialIcons name="cached" size={24} color="white" />
                    </TouchableOpacity> */}
                </SafeAreaView>
                    
                    <View
                        style={{
                        position: 'absolute',
                        bottom: '10%',
                        flexDirection: 'row',
                        flex: 1,
                        width: '100%',
                        padding: 20,
                        justifyContent: 'space-between'
                        }}
                    >
                    <View
                        style={{
                        alignSelf: 'center',
                        flex: 1,
                        alignItems: 'center'
                        }}
                    >
                        <TouchableOpacity
                            onPress={__takePicture}
                            style={{
                            width: 70,
                            height: 70,
                            bottom: 0,
                            borderRadius: 50,
                            backgroundColor: '#fff'
                            }}
                        />
                    </View>
                </View>
            </Camera>
            </View>
            </PinchGestureHandler>
                
        
        )
        }
    }
    else{
        return(null)
    }
}


const styles = StyleSheet.create({
    root: {
      flexDirection:'row'
    },
    closeButton: {
      marginLeft: '5%',
      marginTop: '5%',
      width: 45,
      height: 45,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22.5,
      backgroundColor: "#00000077",
    },
    closeText: {
      lineHeight: 25,
      fontSize: 25,
      paddingTop: 2,
      textAlign: "center",
      color: "#FFF",
      includeFontPadding: false,
    },
    buttonText:{
        fontFamily:'roboto',
        fontSize:20,
        color:'#FFFFFF',
    },
    button:{
        // paddingHorizontal:'20%',
        paddingVertical:'5%',
        paddingHorizontal:'15%'
    },
    footerBox:{
        flexDirection:'row',
       width:'100%',
       height:constants.windowHeight/10,
       shadowColor:'#7C7C7C',
       shadowRadius:5,
       justifyContent:'center',
       shadowOffset:{width:1,height:1},
       shadowOpacity:0.5,
       backgroundColor: 'rgba(52, 52, 52, 0.2)',
    },
  });