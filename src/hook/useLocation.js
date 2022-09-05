import {useEffect, useState} from "react";
import {NativeEventEmitter, NativeModules} from "react-native";

const {IBeaconPlaygroundModule} = NativeModules;
const locationEmitter = new NativeEventEmitter(NativeModules.IBeaconPlaygroundModule);


export default function useLocation() {

  const [currentLocation, setCurrentLocation] = useState(null)


  const locationDataHandler = (data) => {
    setCurrentLocation(JSON.parse(data))
  }

  useEffect(() => {
    IBeaconPlaygroundModule.initLocationCallback()
    const locationDataListener = locationEmitter.addListener('location_data', locationDataHandler);

    return () => {
      locationDataListener.remove()
      IBeaconPlaygroundModule.stopLocationCallback();
    }
  }, [])


  return currentLocation
}