import React, {createContext, useState, useEffect, useMemo, useContext, useRef} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as constants from '../global/constants'
import axios from 'axios'
import * as Device from 'expo-device';
import {NativeModules, NativeEventEmitter, AppState} from 'react-native';

const {IBeaconPlaygroundModule} = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(NativeModules.IBeaconModule);


export const AccountContext = createContext()

const AccountContextProvider = (props) => {
  const [token, setToken] = useState(null)
  // const [ timeID, setTimeID ] = useState(null)
  const [firstLogin, setFirstLogin] = useState(true)
  const [staffList, setStaffList] = useState([])
  const secondList = [...Array(constants.scanInterval).keys()]
  // const [ motionData, setMotionData ] = useState('')
  const [bData, setBData] = useState({})
  // const bData = useRef({})
  const [onCarList, setOnCarList] = useState([])
  const [versionData, setVersionData] = useState({})
  // const notification = new NotifService((token)=>onRegister(token),(iNotification)=>onNotification(iNotification))
  const [bgColor, setBgColor] = React.useState(new Array(6).fill('#2E333A'))

  useEffect(() => {
    getDeviceData()
    const onScannerDataListener = bleManagerEmitter.addListener('scanner_data', handleDebugMsg);

    return (() => {

      onScannerDataListener.remove()
      IBeaconPlaygroundModule.stopScanning();
    })
  }, [])

  const getToken = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@token')
      if (deviceData.imei === '') {
        getDeviceData()
        return jsonValue != null ? JSON.parse(jsonValue) : null

      } else {
        return jsonValue != null ? JSON.parse(jsonValue) : null

      }
    } catch (e) {
    }
  }


  const handleDebugMsg = (msg) => {
    const data = JSON.parse(msg)
    // setBData(data)
    if ((new Date().getMinutes() + new Date().getHours() * 60) % constants.scanPeriod === 0 && secondList.includes(new Date().getSeconds())) {
      IBeaconPlaygroundModule.startScanning();
    }

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

  const getDeviceData = async () => {
    try {
      const deviceData = await AsyncStorage.getItem('@device_data')

      // setDeviceData(JSON.parse(deviceData))
      const newDeviceData = JSON.parse(deviceData)
      console.log(newDeviceData)
      if (newDeviceData.tracker_id && newDeviceData.plant_id && newDeviceData.tracker_id !== '' && newDeviceData.plant_id !== '') {
        setFirstLogin(false)
      }
      setDeviceData(newDeviceData)

    } catch (e) {
      console.log(e)
    }
  }


  const checkAccount = async () => {
    getToken().then(async (jsonValue) => {
      setToken(jsonValue)
      console.log(jsonValue[0])
      const authToken = 'Token ' + jsonValue
      reloadStaffList(authToken)
      console.log(deviceData, constants.deviceApi)
      const newDeviceData = {...deviceData}
      await axios.get(constants.deviceApi, {
        params: {
          paired_staff__isnull: true,
          imei: deviceData.imei
        }, headers: {
          Authorization: authToken,
          "Fcm-Imei": deviceData.imei
        },
      }).then(async function (DeviceData) {
        console.log('devicedata')
        if (DeviceData.data.length > 0) {
          newDeviceData.tracker_id = DeviceData.data[0].id
          if (DeviceData.data[0].paired_plant.length > 0) {
            const plantData = DeviceData.data[0].paired_plant[0]
            newDeviceData.plant_id = plantData.id
            newDeviceData.label = plantData.label
            newDeviceData.code = plantData.code
            newDeviceData.remark = plantData.remark
            newDeviceData.image = plantData.img.map(item => item.img)
            newDeviceData.last_updated = plantData.updated_at
            setFirstLogin(false)
          }
          await axios.get(constants.deviceApi + '/' + DeviceData.data[0].id + '/getwhiteliststaff', {
            headers: {
              Authorization: authToken,
              "Fcm-Imei": deviceData.imei
            },
          }).then(async function (wlData) {
            console.log('wl')
            if (wlData.length > 0) {
              newDeviceData.wl = wlData.data.map(item => item.id)
            }
          })
          setDeviceData(newDeviceData)
          storeData('@device_data', newDeviceData)
        }


      })
    })


  }

  const reloadStaffList = async (token) => {
    console.log('reloading')
    console.log(deviceData.imei)
    await axios.get(constants.staffApi, {
      params: {
        paired_watch__isnull: false,
      },
      headers: {
        Authorization: token,
        "Fcm-Imei": deviceData.imei
      },
    }).then(async function (response) {
      const newStaffList = response.data.map(item => ({
        id: item.id,
        major: parseInt(item.paired_watch.major),
        minor: parseInt(item.paired_watch.minor),
        uuid: item.paired_watch.uuid,
        full_name: item.user.full_name,
        name_eng: item.user.name_eng,
        name_cht: item.user.name_cht,
      }))
      setStaffList(newStaffList)
      console.log(newStaffList)


    }).catch(function (error) {
      console.log(error)
    })

  }

  return (
    <AccountContext.Provider value={useMemo(() =>
      ({
        checkAccount,
        token,
        firstLogin,
        setFirstLogin,
        deviceData,
        handleData,
        staffList,
        reloadStaffList,
        storeData,
        bData,
        onCarList,
        setOnCarList,
        versionData,
        setVersionData,
        setDeviceData,
        // loadConfig,
        getDeviceData,
        bgColor,
        setBgColor,
      }), [
      checkAccount,
      token,
      firstLogin,
      setFirstLogin,
      deviceData,
      handleData,
      staffList,
      reloadStaffList,
      storeData,
      bData,
      onCarList,
      setOnCarList,
      versionData,
      setVersionData,
      setDeviceData,
      // loadConfig,
      bgColor,
      setBgColor,
    ])}

    >
      {props.children}
    </AccountContext.Provider>
  )
}
export default AccountContextProvider