import React,{ useContext , useState, useMemo } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator';
import * as constants from '../../global/constants'
import i18n from 'i18n-js'
import { MediaType } from 'expo-media-library';
import { AssetsSelector } from 'expo-images-picker';
import { Ionicons } from '@expo/vector-icons';


export default function ImageScreen({navigation,route}){
    const array = [...route.params.photo]
    const maxImage = constants.maxImage
    const ForceInset = {
      top: 'never',
      bottom: 'never',
    };

    const processImageAsync = async (image) => {
      const uri = image.uri
      const file = await ImageManipulator.manipulateAsync(
        uri,
        [{resize: { width: image.width }}],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      return file;
    }   

    const processImageArray = async (imageArray) => {
      const newArray = await Promise.all(imageArray.map(async(item) => {
        const pPhoto = await processImageAsync(item); 
        pPhoto['filename'] = item.uri.split('/').slice(-1)[0]
        pPhoto['type'] = 'image/jpeg'
        
        // array.push({image:pPhoto,uri:pPhoto.uri,remark:''})
        return {image:pPhoto,uri:pPhoto.uri}
      }))
      return newArray
    }

    const onSuccess = async (data: any) => {
      const newArray = await processImageArray(data)
      const finalArray = [...array, ...newArray]
      // setFileList(finalArray)
      // setPickerOpen(false)
      

        navigation.navigate('Link',{photo:finalArray,token: route.params.token})
        // navigation.goBack()
        // console.log(navigation.state.params)
        
      };
    
      const widgetErrors = useMemo(
        () => ({
          errorTextColor: 'black',
          errorMessages: {
            hasErrorWithPermissions: 'Please Allow media gallery permissions.',
            hasErrorWithLoading: 'There was error while loading images.',
            hasErrorWithResizing: 'There was error while loading images.',
            hasNoAssets: 'No images found.',
          },
        }),
        []
      );
    
      const widgetSettings = useMemo(
        () => ({
          getImageMetaData: false, // true might perform slower results
          initialLoad: 100,
          assetsType: [MediaType.photo],
          minSelection: 1,    
          maxSelection: maxImage-array.length,
          portraitCols: 4,
          landscapeCols: 4,
        }),
        []
      );
    
    const widgetResize = useMemo(
      () => ({
        base64: false,
        saveTo: 'jpeg',
      }),
      []
    );
  
    const _textStyle = {
      color: 'white',
    };
  
    const _buttonStyle = {
      backgroundColor: 'black',
      borderRadius: 5,
    };
  
    const widgetNavigator = useMemo(
      () => ({
        Texts: {
          finish: i18n.t('finish'),
          back: i18n.t('back'),
          selected: i18n.t('selected'),
        },
        midTextColor: 'black',
        minSelection: 1,
        buttonTextStyle: _textStyle,
        buttonStyle: _buttonStyle,
        onBack: () => navigation.goBack(),
        onSuccess: (e: any) => onSuccess(e),
      }),
      []
    );
  
    const widgetStyles = useMemo(
      () => ({
        margin: 2,
        bgColor: 'white',
        spinnerColor: 'blue',
        widgetWidth: 99,
        videoIcon: {
          Component: Ionicons,
          iconName: 'ios-videocam',
          color: 'tomato',
          size: 20,
        },
        selectedIcon: {
          Component: Ionicons,
          iconName: 'ios-checkmark-circle-outline',
          color: 'white',
          bg: '#0eb14970',
          size: 26,
        },
      }),
      []
    );
    // console.log(array)
    // console.log(navigation.state.params.photo)
    // const [ fileList, setFileList ] = useState(navigation.state.params.photo)
    // const updateHandler = (count, onSubmit) => {
    //     navigation.setParams({
    //       headerTitle: i18n.t('SelectedImage',{count}),
    //       headerRight: array,
    //     });
    //   };
    
  

    // const imagesCallback = (callback) => {
    //     navigation.setParams({ loading: true });
    //     callback.then(async (photos) => {
    //         // console.log(photos)
            
    //       for(let photo of photos) {
    //         const pPhoto = await processImageAsync(photo.uri);
    //         console.log(pPhoto)
    //         // console.log(Platform)
    //         // if (Platform.OS === 'android'){
    //         //   const base64 = await FileSystem.readAsStringAsync(photo.uri, { encoding: 'base64'  })
    //         //   array.push({
    //         //     width: pPhoto.width,
    //         //     height: pPhoto.height,
    //         //     uri: pPhoto.uri,
    //         //     name: photo.filename,
    //         //     type: 'image/jpg',
    //         //     base64
    //         //   })
    //         // } else{
    //          await array.push({
    //             image:{
    //               width: pPhoto.width,
    //               height: pPhoto.height,
    //               uri: pPhoto.uri,
    //               name: photo.filename,
    //               type: 'image/jpg'
    //             },
    //             uri:pPhoto.uri,
    //             remark:'',
    //           })
    //         // }
            
    //       }
    //     // setFileList([...fileList,...cPhotos])
    //     })
    //     .catch((e) => console.log(e))
    //     .finally(() => {
    //       navigation.setParams({ loading: false })
          
    //     });
    // };

    // const renderSelectedComponent = (number) => {
    //     return(
    //         <View style={styles.countBadge}>
    //             <Text style={styles.countBadgeText}>{number}</Text>
    //         </View>
    //     )
    // }

    // const emptyStayComponent = <Text style={styles.emptyStay}>{i18n.t('NoImage')}</Text>;
    return(
        <View style={styles.container}>
          <AssetsSelector
            Settings={widgetSettings}
            Errors={widgetErrors}
            Styles={widgetStyles}
            Navigator={widgetNavigator}
            Resize={widgetResize} 
          />
        </View>
        // <ImageBrowser
        //     max={navigation.state.params.max}
        //     onChange={updateHandler}
        //     callback={(callback) =>imagesCallback(callback)}
        //     renderSelectedComponent={renderSelectedComponent}
        //     emptyStayComponent={emptyStayComponent}
        //     />
    )
}

const styles = StyleSheet.create({
    flex: {
      flex: 1
    },
    container: {
      flex: 1,
      marginTop:'15%'
    },
    emptyStay:{
      textAlign: 'center',
    },
    countBadge: {
      paddingHorizontal: 8.6*constants.widthRatio,
      paddingVertical: 5*constants.HeightRatio,
      borderRadius: 50,
      position: 'absolute',
      right: 3*constants.widthRatio,
      bottom: 3*constants.HeightRatio,
      justifyContent: 'center',
      backgroundColor: '#0580FF'
    },
    countBadgeText: {
      fontWeight: 'bold',
      alignSelf: 'center',
      padding: 'auto',
      color: '#ffffff'
    }
  });