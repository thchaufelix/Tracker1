import React , { useContext, useState, useEffect } from 'react'
import { View, TouchableOpacity,Text, Image,Keyboard,Platform} from 'react-native'
import { Toolbar } from '../component/toolbar';
import { Icon } from '@ui-kitten/components';
import { SafeAreaLayout, SaveAreaInset } from '../component/safearea';
import { MaterialIcons,FontAwesome5 } from '@expo/vector-icons';
import i18n from 'i18n-js'
import { Button, Card, Modal } from '@ui-kitten/components';
import * as SecureStore from 'expo-secure-store'
import * as Localization from 'expo-localization';
import * as constants from '../global/constants'
import { AccountContext2 } from '../Context/authContext2';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BackIcon = (style)  => (
  <Icon {...style} name='ios-arrow-back' pack='ionicon'/>
);

export default function Account({navigation}){
  const doman = constants.domain
  const { userData, fa2Login, setFA2Login } = useContext(AccountContext2)

  const [visible, setVisible] = useState(false);
  // const [projectView, setProjectView] = useState(false);
  const title = () => (
    <Text style={{color:'#FFFFFF',fontFamily: 'M-M',fontSize:21}}>
        {i18n.t('Setting')}
    </Text>
  )
  const handleSignOut = () => {
    navigation.navigate('SignIn')
  }
  const handle2FALogin = async () => {
    
    
    if (!fa2Login){
        await SecureStore.setItemAsync('fa2', 'granted');
        setFA2Login(!fa2Login)
    }else{
        setFA2Login(!fa2Login)
        await SecureStore.deleteItemAsync('fa2')
    }

    
    
   

}

  const storeData = async (key,value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // saving error
      console.log(e)
    }
  }


  const changeLang = async (input) => {
        Localization.locale = input
        i18n.locale = Localization.locale;
        await storeData('@lang', input);
        navigation.replace('Home')
    // MainPage.reload();
    // navigation.replace('MainPage')
}
  return(
      <View style={{flex:1}}>
           <SafeAreaLayout insets={SaveAreaInset.TOP} style={{backgroundColor:'#2E333A',flex:0.5,justifyContent:'flex-end'}}>
                <Toolbar title={title} style={{backgroundColor:'#2E333A'}} leftIcon={BackIcon}
                leftAction={()=>navigation.goBack()}/>
                
            </SafeAreaLayout>
            <View style={{height:150,width:150,backgroundColor:'#ABB7C3',borderRadius:75,justifyContent:'center',alignItems:'center',alignSelf:'center',marginVertical:'5%'}}>
              <Text style={{fontFamily:'R-M',fontSize:50,color:'#FFF'}}>{userData.full_name[0]}</Text>
            </View>
            {/* <Image   style={{alignSelf:'center',width:100,height:100,marginVertical:'4%'}} source={require('../../assets/images/user.png')} /> */}
            <TouchableOpacity activeOpacity={1} onPress={()=>Keyboard.dismiss()} style={{marginHorizontal:'5%',borderRadius:10,backgroundColor:'#FFFFFF',shadowColor:'#7C7C7C', 
            shadowOffset:{width:1,height:1},shadowOpacity:0.5,elevation:5,shadowRadius:1}}>
              <View style={{flexDirection:'column'}}>
                <View style={{flexDirection:'row',borderBottomColor:'grey',borderBottomWidth:0.5,paddingVertical:'5%'}}>
                    <MaterialIcons style={{paddingHorizontal:'5%'}} name="person" size={30} color="grey" />
                    <Text style={{alignSelf:'center',fontFamily:'M-M',color:'grey',fontSize:18,width:'80%'}}>{userData.full_name}</Text>
                </View>
                <View style={{flexDirection:'row',borderBottomColor:'grey',borderBottomWidth:0.5,paddingVertical:'5%'}}>
                    <MaterialIcons style={{paddingHorizontal:'5%'}} name="email" size={30} color="grey" />
                    <Text style={{alignSelf:'center',fontFamily:'M-M',color:'grey',fontSize:18,width:'80%'}}>{userData.email}</Text>
                </View>
                <View style={{flexDirection:'row',borderBottomColor:'grey',borderBottomWidth:0.5,paddingVertical:'5%'}}>
                    <MaterialIcons style={{paddingHorizontal:'5%'}} name="lock" size={30} color="grey" />
                    <Text style={{alignSelf:'center',fontFamily:'M-M',color:'grey',fontSize:18,width:'80%'}}>{userData.user_title}</Text>
                </View>
                <View style={{borderBottomColor:'grey',borderBottomWidth:0.5,paddingVertical:'5%'}}>
                  <TouchableOpacity style={{flexDirection:'row',}} onPress={()=>setVisible(true)}>
                      <MaterialIcons style={{paddingHorizontal:'5%'}} name="language" size={30} color="grey" />
                      <Text style={{alignSelf:'center',fontFamily:'M-M',color:'grey',fontSize:18,width:'80%'}}>{Localization.locale==='en'?'English':'繁中'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{paddingVertical:'5%',borderBottomColor:'grey'}}>
                  <TouchableOpacity onPress={()=>handle2FALogin()} style={{flexDirection:'row',}}>
                    <MaterialIcons style={{paddingHorizontal:'5%'}} name={Platform.OS==='android'?"fingerprint":'face'} size={30} color="grey" />
                    <Text style={{alignSelf:'center',fontFamily:'M-M',color:'grey',fontSize:18,width:'80%'}}>{fa2Login?i18n.t('Enable'):i18n.t('Disable')}</Text>
                  </TouchableOpacity> 
                   
                </View>
                
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>handleSignOut()} style={{backgroundColor:'#73B2B8',marginHorizontal:'5%',paddingVertical:'3%',marginVertical:'5%',borderRadius:10,elevation:3}}>
                <Text style={{alignSelf:'center',fontFamily:'M-SB',fontSize:16,color:'#FFFFFF'}}>{i18n.t('Logout')}</Text>
            </TouchableOpacity>
            <Modal
                visible={visible}
                backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}}
                onBackdropPress={() => setVisible(false)}>
                <Card disabled={true}>
                  <Text style={{fontSize:16,fontFamily:'M-M',alignSelf:'center'}}>{i18n.t('SelectLang')}</Text>
                  <TouchableOpacity activeOpacity={Localization.locale==='en'?1:0}  onPress={()=>Localization.locale==='en'?null:changeLang('en')}>
                    <Text style={{alignSelf:'center',marginVertical:'10%',fontSize:16,fontFamily:'M-M',color:Localization.locale==='en'?'grey':'black'}}>English</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={Localization.locale==='zh'?1:0} onPress={()=>Localization.locale==='zh'?null:changeLang('zh')}>
                    <Text style={{alignSelf:'center',fontSize:16,fontFamily:'M-M',color:Localization.locale==='zh'?'grey':'black'}}>繁體中文</Text>
                  </TouchableOpacity>
                </Card>
            </Modal>
           
         
              
      </View>
   
  )
}