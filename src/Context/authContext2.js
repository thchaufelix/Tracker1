import React, {Component, createContext} from "react";
import AccountContextProvider from "./authContext";
import * as constants from "../global/constants";
import * as Device from "expo-device";
import {NativeEventEmitter, NativeModules} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const {IBeaconPlaygroundModule} = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(NativeModules.IBeaconModule);

export const ConfigContext = createContext(undefined, undefined)

const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // saving error
      console.log(e)
    }
  }

class AccountContextProvider2 extends Component {

  state = {
    token: null,
    firstLogin: true,
    staffList: [],
    secondList: [...Array(constants.scanInterval).keys()],
    bData: {},
    onCarList: [],
    versionData: {},

    deviceData: {
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

    }
  }

  onScannerDataListener = null;

  getToken = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@token')
      if (this.state.deviceData.imei === '') {
        await this.getDeviceData()
        return jsonValue != null ? JSON.parse(jsonValue) : null
      } else {
        return jsonValue != null ? JSON.parse(jsonValue) : null
      }
    } catch (e) {
    }
  }

  getDeviceData = async () => {
    try {
      const deviceData = await AsyncStorage.getItem('@device_data')
      const newDeviceData = JSON.parse(deviceData)
      console.log(newDeviceData)
      if (newDeviceData.tracker_id && newDeviceData.plant_id && newDeviceData.tracker_id !== '' && newDeviceData.plant_id !== '') {
        this.setState({firstLogin: false})
      }
      this.setState({deviceData: newDeviceData})

    } catch (e) {
      console.log(e)
    }
  }

  handleDebugMsg = (msg) => {
    const data = JSON.parse(msg)
    console.log("update once")

    this.setState({bData: data})
    if ((new Date().getMinutes() + new Date().getHours() * 60) % constants.scanPeriod === 0 && this.state.secondList.includes(new Date().getSeconds())) {
      IBeaconPlaygroundModule.startScanning();
    }

  }

  handleData = (input) => {
    this.setState({deviceData: input})
    storeData('@device_data', input)
  }

  checkAccount =  () => {
    this.getToken().then(async (jsonValue) => {
      this.setState({token: jsonValue})
      console.log(jsonValue[0])
      const authToken = 'Token ' + jsonValue
      this.reloadStaffList(authToken)
      console.log(this.state.deviceData, constants.deviceApi)
      const newDeviceData = {...this.state.deviceData}

      axios.get(constants.deviceApi, {
        params: {
          paired_staff__isnull: true,
          imei: this.state.deviceData.imei
        }, headers: {
          Authorization: authToken,
          "Fcm-Imei": this.state.deviceData.imei
        },
      }).then((DeviceData) => {
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
            this.setState({firstLogin: false})
          }
          axios.get(constants.deviceApi + '/' + DeviceData.data[0].id + '/getwhiteliststaff', {
            headers: {
              Authorization: authToken,
              "Fcm-Imei": this.state.deviceData.imei
            },
          }).then((wlData) => {
            console.log('wl')
            if (wlData.length > 0) {
              newDeviceData.wl = wlData.data.map(item => item.id)
            }
          })
          this.setState({deviceData: newDeviceData})
          storeData('@device_data', newDeviceData)
        }


      })
    })
  }

  reloadStaffList = (token) => {
    console.log('reloading')
    console.log(this.state.deviceData.imei)
    axios.get(constants.staffApi, {
      params: {
        paired_watch__isnull: false,
      },
      headers: {
        Authorization: token,
        "Fcm-Imei": this.state.deviceData.imei
      },
    }).then((response) => {
      const newStaffList = response.data.map(item => ({
        id: item.id,
        major: parseInt(item.paired_watch.major),
        minor: parseInt(item.paired_watch.minor),
        uuid: item.paired_watch.uuid,
        full_name: item.user.full_name,
        name_eng: item.user.name_eng,
        name_cht: item.user.name_cht,
      }))
      this.setState({staffList: newStaffList})
      console.log(newStaffList)
    }).catch(function (error) {
      console.log(error)
    })

  }


  componentDidMount() {
    this.onScannerDataListener = bleManagerEmitter.addListener('scanner_data', this.handleDebugMsg);
  }

  componentWillUnmount() {
    // if (this.state.timerID) clearInterval(this.state.timerID);
    this.onScannerDataListener.remove()
    IBeaconPlaygroundModule.stopScanning();
  }

  render() {
    return (
      <ConfigContext.Provider value={{
        ...this.state,
        getDeviceData: this.getDeviceData,
        checkAccount: this.checkAccount,
        handleData: this.handleData,
        reloadStaffList: this.reloadStaffList,
        storeData: storeData
      }}>
        {this.props.children}
      </ConfigContext.Provider>
    )
  }
}

export default AccountContextProvider2
