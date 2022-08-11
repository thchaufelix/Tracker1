import React, {useEffect, useState} from 'react';
import AccountContextProvider from './src/Context/authContext'
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components'
import AppLoading from 'expo-app-loading';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as eva from '@eva-design/eva'
import {default as theme} from './src/global/theme.json';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {useFonts} from 'expo-font';
import {AppNavigator} from './src/navigator/appNav';
import {AppRoute} from './src/navigator/appRoutes';
import i18n from 'i18n-js';
import {MaterialIconsPack, IoniconsPack, FontAwesome5Pack} from './src/global/iconPack'
import {en, zh} from './src/global/translate';
import * as Localization from 'expo-localization';
import NotiContextProvider from './src/Context/notContext';
import {useKeepAwake} from "expo-keep-awake";
import fonts from './assets/fonts'


const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // saving error
    console.log(e)
  }
}


i18n.fallbacks = true;
i18n.translations = {zh, en};

export default function App() {
  useKeepAwake()

  const [lang, setLang] = useState('en')
  const [isLangLoaded, setIsLangLoaded] = useState(false)
  let [fontsLoaded] = useFonts(fonts);


  useEffect(() => {
    const asyncLangData = async () => {
      try {
        const langData = await AsyncStorage.getItem('@lang')
        // setDeviceData(JSON.parse(deviceData))
        const newLangData = JSON.parse(langData) ? JSON.parse(langData) : 'en'
        setLang(newLangData)
        Localization.locale = newLangData
        i18n.locale = Localization.locale;
        setIsLangLoaded(true)

      } catch (e) {
        console.log(e)
      }
    }


    try {
      asyncLangData()
      // if (Platform.OS === 'android'){
      //   checkUpdate()
      // }


    } catch (e) {
      setLang('en')
      storeData('@lang', 'en')
      Localization.locale = 'en'
      i18n.locale = Localization.locale;
      setIsLangLoaded(true)
    }
  }, [])

  if (!(fontsLoaded && isLangLoaded)) return <AppLoading/>


  return (
    <NotiContextProvider>
      <AccountContextProvider>
        <NavigationContainer>
          <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>

            <IconRegistry icons={[EvaIconsPack, MaterialIconsPack, IoniconsPack, FontAwesome5Pack]}/>
            <AppNavigator initialRouteName={AppRoute.AUTH}/>

          </ApplicationProvider>
        </NavigationContainer>
      </AccountContextProvider>
    </NotiContextProvider>
  )

}