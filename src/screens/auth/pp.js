import React, {createContext, useState, useEffect, useMemo} from 'react'
import {
  NativeModules,
  NativeEventEmitter,
  AppState,
  Modal,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import i18n from 'i18n-js'

const {IBeaconPlaygroundModule} = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(NativeModules.IBeaconModule);

export function PPBox() {
  const [ppVisible, setPPVisible] = useState(true)
  const handleStart = () => {
    setPPVisible(false)
    IBeaconPlaygroundModule.checkPermission()
    setTimeout(async () => {
      IBeaconPlaygroundModule.initScanning()
      IBeaconPlaygroundModule.initForeground()
    }, 1000);

    setTimeout(async () => {
      IBeaconPlaygroundModule.startForeground();
      // IBeaconPlaygroundModule.startScanning();
    }, 2000);

  }
  return (

    <Modal transparent={true}
           visible={ppVisible}
           onRequestClose={() => {
             setPPVisible(!ppVisible);
           }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>

          <ScrollView style={{width: '90%'}}>
            {/* <Text style={styles.modalText}>{i18n.t('NewV')}</Text> */}
            <Text style={[styles.header, styles.innerM]}>Personal Data Collection Statement</Text>
            <Text style={[styles.data, styles.innerM]}>Cerebro collects personal data:</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.data, styles.innerM, {alignSelf: 'center', marginRight: 5, fontSize: 15}]}>*</Text>
              <Text style={[styles.data, styles.innerM]}>created during use of our services, such as location, app
                usage, and device data</Text>
            </View>
            <Text style={[styles.data, styles.innerM]}>Data created during use of our services. This includes:</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.data, styles.innerM, {marginRight: 5, fontSize: 15}]}>*</Text>
              <Text style={[styles.data, styles.innerM]}>Location data : We collect user precise or approximate location
                data, including to affiliated clients to collect and manage the location of the site equipments, to
                enable plant tracking and safety features. Cerebro collects this data when the Tracker app is running in
                the foreground (app open and on-screen) and/or background (app open but not on-screen) of users' mobile
                device.</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.data, styles.innerM, {marginRight: 5, fontSize: 15}]}>*</Text>
              <Text style={[styles.data, styles.innerM]}>Device data: We may collect data about the devices used to
                access our services, including device series, device IP address or other unique device identifiers,
                operating systems and versions, software, preferred languages, device motion data, and mobile network
                data.</Text>
            </View>
            <Text style={[styles.data, styles.innerM]}> Please refer to Cerebro website on Cerebro Privacy Policy
              Statement:</Text>
            <TouchableWithoutFeedback
              onPress={() => WebBrowser.openBrowserAsync('https://cerebrohk.df.r.appspot.com/privacypolicy')}>
              <Text style={[styles.data, styles.innerM]}>https://cerebrohk.df.r.appspot.com/privacypolicy</Text>
            </TouchableWithoutFeedback>
            <Text style={[styles.header, styles.innerM]}> 收集個人資料聲明</Text>
            <Text style={[styles.data, styles.innerM]}>Cerebro 收集以下個人資料：</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.data, styles.innerM, {alignSelf: 'center', marginRight: 5, fontSize: 15}]}>*</Text>
              <Text style={[styles.data, styles.innerM]}>在使用我們的服務時產生的資料，例如位置、App 使用情況和裝置資料</Text>
            </View>
            <Text style={[styles.data, styles.innerM]}>在使用我們的服務時產生的資料。包括：</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.data, styles.innerM, {marginRight: 5, fontSize: 15}]}>*</Text>
              <Text style={[styles.data, styles.innerM]}>位置資料 ： 我們會收集使用者的精確或概略位置資料，包括用於啟用地盤設備警報系統，啟用地盤設備追蹤及安全功能。Cerebro
                會在 Tracker App 於流動裝置前景 (App 打開並在螢幕上顯示) 及／或背景 (App 打開但沒有在螢幕上顯示) 運作時收集這項資料。</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.data, styles.innerM, {marginRight: 5, fontSize: 15}]}>*</Text>
              <Text style={[styles.data, styles.innerM]}>裝置資料： 我們可收集使用我們服務的裝置的資料，包括硬件型號、裝置 IP
                位址或其他不重覆的裝置識別碼、操作系統與版本、軟件、偏好語言、裝置動態資料及流動網絡數據。</Text>
            </View>
            <Text style={[styles.data, styles.innerM]}> 有關Cerebro的私隱政策聲明，請參閱Cerebro網頁:</Text>
            <TouchableWithoutFeedback
              onPress={() => WebBrowser.openBrowserAsync('https://cerebrohk.df.r.appspot.com/privacypolicy')}>
              <Text style={[styles.data, styles.innerM]}>https://cerebrohk.df.r.appspot.com/privacypolicy</Text>
            </TouchableWithoutFeedback>
            <TouchableOpacity onPress={() => handleStart()} style={{
              backgroundColor: '#73B2B8',
              borderWidth: 0,
              elevation: 2,
              marginBottom: '10%',
              paddingVertical: '3%',
              alignItems: 'center',
              borderRadius: 5
            }}>
              <Text style={styles.btnContent}>{i18n.t('Accept')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

      </View>

    </Modal>)
}

const styles = StyleSheet.create({
  header: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'FO',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "#2E333A",
    borderRadius: 18,
    padding: 25,
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
  data: {
    fontFamily: 'M-R',
    fontSize: 10,
    color: '#FFF',
  },
  innerM: {
    marginBottom: 10
  },
  btnContent: {
    fontFamily: 'M-SB',
    color: 'white',
    fontSize: 14,
    letterSpacing: 5
  },

})