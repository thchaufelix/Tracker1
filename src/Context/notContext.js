import React, {createContext, useState, useEffect, useMemo} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as constants from '../global/constants'
import axios from 'axios'
import * as Device from 'expo-device';
import {
  NativeModules,
} from 'react-native';
import NotifService from "../../PushNotificationConfig/NotifService";

const {IBeaconPlaygroundModule} = NativeModules;

export const NotiContext = createContext()


const uploadFCMToken = async (FCMToken, imei) => {
  let payload = new FormData()
  payload.append("fcm_token", FCMToken.token)
  payload.append("type", "tracker")
  // payload.append("os", FCMToken.os)
  console.log("requesting fcm token")
  // payload.append("os", FCMToken.os)
  return axios({
    method: 'patch', //you can set what request you want to be
    url: constants.deviceApi + '/updatetrackerfcmtoken',
    data: payload,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Fcm-Imei': imei
    }
  })
    .then((response) => response.data
      , (error) => error);

}

const getNewConfig = (token, imei, allData = false, setLoadConFig, deviceData, handleData, fcmConfiguration, overwrite = {}) => {
  // console.log("get new config")
  // console.log(imei, token)
  axios({
    method: 'get', //you can set what request you want to be
    params: {
      full: allData ? 1 : 0,
    },
    url: constants.deviceApi + '/getconfig',
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Token ' + token,
      'Fcm-Imei': imei
    }
  })
    .then((response) => {
        // console.log('hi')
        console.log(response)
        const newDeviceData = {...deviceData}
        newDeviceData.imei = imei
        newDeviceData.pj = response.data.project_id
        // console.log(response.data.project_id)
        handleData(newDeviceData)
        // fcmConfiguration({config: JSON.stringify(response.data)})
        IBeaconPlaygroundModule.updateConfig(JSON.stringify({...response.data, ...overwrite}))
        console.log('loading')
        setTimeout(() => {
          setLoadConFig(true)
        }, 4 * 1000);
      },
      (error) => {
        console.log(error)
      });
}

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('BeaconConfig')
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    // error reading value
  }
}


const NotiContextProvider = (props) => {
  const [token, setToken] = useState(null)
  const [notification, setNotification] = useState(null);
  const [fcm_token, setFCM_Token] = useState('')
  const [loadConfig, setLoadConFig] = useState(false)
  const [config, setConfig] = useState(null)


  const getNewConfig2 = (_token = null, _imei = null,) => {
    getNewConfig(
      _token ? _token : token,
      _imei ? _imei : deviceData.imei,
      true, setLoadConFig,
      deviceData,
      handleData,
      fcmConfiguration,
      {"as": "0"}
    )
  }

  const [deviceData, setDeviceData] = useState({
    imei: '',
    series: Device.brand + ' ' + Device.modelName,
    code: "",
    label: "",
    plant_id: '',
    remark: '',
    last_updated: '',
    tracker_id: '',
    driver: [],
    image: [],
    wl: [],
    pj: ''

  })


  useEffect(() => {
    if (deviceData.pj === '') {
      setLoadConFig(false)
    }
  }, [deviceData.pj])

  const handleData = (input) => {
    storeData('@device_data', input)
    setDeviceData(input)
  }

  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // saving error
      console.log(e)
    }
  }

  const logFunc = (callback) => console.log(callback)

  const onRegister = (fcm_token) => {
    setFCM_Token(fcm_token)

    IBeaconPlaygroundModule.getDeviceImei((imei) => {
      console.log(fcm_token, imei)
      uploadFCMToken(fcm_token, imei).then((response) => {
        console.log('token ' + response)
        if (response.token) {
          storeData('@token', response.token)
          setToken(response.token)
          console.log(response.token)
          getNewConfig2(response.token, imei)
        }

      })
    })
  }

  const fcmConfiguration = (iNotification) => {
    if ("config" in iNotification.data) {
      IBeaconPlaygroundModule.makeToast("updating new config")
      if (iNotification.data.config === "new update") {
        getNewConfig2()
      } else {
        // console.log(iNotification.data.config)
        setConfig(JSON.parse(iNotification.data.config))
        IBeaconPlaygroundModule.updateConfig(iNotification.data.config)
      }

    } else {
      // console.log(iNotification)
      notification.localNotif(iNotification);
    }

  }

  const onNotification = (iNotification) => {
    // console.log('Notification received', iNotification)

    if (!iNotification.action) {
      fcmConfiguration(iNotification);
      // notification.localNotif(iNotification);
    }
  }


  useEffect(() => {
    // IBeaconPlaygroundModule.checkPermission()

    setNotification(
      new NotifService(
        (token) => onRegister(token),
        (iNotification) => onNotification(iNotification))
    );
  }, [])

  useEffect(() => {
    if (notification != null) {
      notification.checkPermission(logFunc)
      if (!fcm_token) {
        notification.requestPermissions()
      }
    }
  }, [notification])


  return (
    <NotiContext.Provider value={{loadConfig, config, setLoadConFig}}>
      {props.children}
    </NotiContext.Provider>
  )
}


export default NotiContextProvider