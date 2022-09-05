import React, {useContext, useEffect, useState} from "react";
import {NativeEventEmitter, NativeModules, Pressable, StyleSheet, View} from 'react-native'
import {Text} from "@ui-kitten/components";
import MapView from "react-native-maps";
import i18n from "i18n-js";
import {MaterialIcons} from "@expo/vector-icons";
import {AccountContext2} from "../../Context/authContext2";
import {apiUri, plantRouteTaskAPI} from "../../global/constants";
import useAxios from "axios-hooks";
import RouteView from "./RouteView";
import InstructionOverlay from "./InstructionOverlay";
import CurrentLocation from "./CurrentLocation";
import LoadingView from "../../global/LoadingView";
import RouteActionControl from "./RouteActionControl";
import SwitchRouteControl from "./SwitchRouteControl";
import CustomButton from "../../component/CustomButton";
import DescriptionOverlay from "./DescriptionOverlay";
import {getClosestIndexLatLng} from "./HelperFunction";
// import * as Location from 'expo-location';
import * as geolib from "geolib";
import useLocation from "../../hook/useLocation";


const {IBeaconPlaygroundModule} = NativeModules;
const locationEmitter = new NativeEventEmitter(NativeModules.IBeaconPlaygroundModule);

const Header = ({navigation, callback}) => {

  const toggleDrawer = () => navigation.openDrawer();
  return (
    <View style={styles.mapRouteContainer}>
      <MaterialIcons onPress={toggleDrawer} name="menu" size={24} color="white" style={{marginLeft: 15}}/>
      <View style={{alignItems: "center"}}>
        <Text style={{marginRight: 0}}> {i18n.t("MapRoute")}</Text>
      </View>
      <Pressable onPress={callback}
                 style={({pressed}) => [{opacity: pressed ? 0.6 : 1}]}
      >
        <MaterialIcons name="refresh" size={24} color="white" style={{marginRight: 15}}/>
      </Pressable>

    </View>
  )
}

const getLatLngProfile = (coordinates) => {
  const allLat = coordinates.map(coord => coord.lat)
  const allLng = coordinates.map(coord => coord.lng)

  const maxLat = Math.max(...allLat)
  const minLat = Math.min(...allLat)
  const maxLng = Math.max(...allLng)
  const minLng = Math.min(...allLng)

  return {
    latitude: (maxLat + minLat) / 2,
    longitude: (maxLng + minLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.35,
    longitudeDelta: (maxLng - minLng) * 1.35,
  }
}


export default function MapRoute({navigation}) {

  // GPS Location Control
  // const [locationTick, setLocationTick] = useState(-1);
  const [currentLocation, setCurrentLocation] = useState({lat: 0, lng: 0, index: -1, closetCoord: 0});
  const [vehicleState, setVehicleState] = useState("stop")

  // Basic Params
  const {token, deviceData} = useContext(AccountContext2);
  const runningRegionDelta = {
    latitudeDelta: 0.012,
    longitudeDelta: 0.012
  }

  const currentGPS = useLocation()

  // Control Setting
  const [availableRouting, setAvailableRouting] = useState([]);

  const offTrackWarningThreshold = 3
  const offTrackThreshold = 9
  const offTrackDistance = 25

  // const [fixedQueue:offTrack, updateQueue] = useFixedQueue(12 ,false)
  const [offTrack, setOffTrack] = useState(Array(12).fill(false));


  // Display Data
  const [GPSData, setGPSData] = useState([]);
  const [routeData, setRouteData] = useState(null);

  // Map Setup
  const [startWayPoint, setStartWayPoint] = useState({latitude: 22.377510, longitude: 114.112639,});
  const [endWayPoint, setEndWayPoint] = useState({latitude: 22.377510, longitude: 114.112639,});
  const [latLngDelta, setLatLngDelta] = useState({
    latitude: 22.377510,
    longitude: 114.112639,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6
  });

  // API Hock
  const [{data, loading, error}, executeGetLatest] = useAxios({
    headers: {
      Authorization: "Token " + token,
      "Fcm-Imei": deviceData.imei
    },
    params: {project: deviceData.pj}
  }, {manual: true});

  const [{data: _, loading: __, error: errorState}, executePostState] = useAxios({
    method: "PATCH",
    headers: {
      Authorization: "Token " + token,
      "Fcm-Imei": deviceData.imei
    },
    params: {project: deviceData.pj}
  }, {manual: true});

  //
  const updateTaskData = async (url, method, signal: {}) => {
    try {
      await executeGetLatest({url: url, method: method, signal: signal}).then(response => {
        setAvailableRouting(response.data)
        if (response.data.length === 0) {
          setRouteData(null)
        } else {
          setRouteData(response.data[0])
        }
      })
    } catch (e) {
      console.log("ERROR", url)
    }

  }

  useEffect(() => {
    if (routeData !== null) {
      const waypoints = routeData.site_plant_route.route[0].waypoints
      const firstWayPoint = waypoints[0]
      const lastWayPoint = waypoints[waypoints.length - 1]

      const startWayPt = {latitude: firstWayPoint.latLng.lat, longitude: firstWayPoint.latLng.lng}
      const endWayPt = {latitude: lastWayPoint.latLng.lat, longitude: lastWayPoint.latLng.lng}

      setStartWayPoint(startWayPt)
      setEndWayPoint(endWayPt)

      const coordinates = routeData.site_plant_route.route[0].coordinates
      setGPSData([...coordinates, ...Array(10).fill(coordinates[coordinates.length - 1])])

      const latLng = getLatLngProfile(coordinates)
      setLatLngDelta(prev => {
        return {...prev, ...latLng}
      })

      if (routeData.processing) {
        actionHandler("start", false)
      }
    }
  }, [routeData])

  useEffect(() => {
    updateTaskData(apiUri + plantRouteTaskAPI, "GET")
  }, [])

  // Start, Stop Button Control
  const actionHandler = (action, APICall = true) => {
    setVehicleState(action)
    if (action === "start") {
      if (APICall) {
        executePostState({url: apiUri + plantRouteTaskAPI + `/${routeData.id}/start`}).catch(error => console.log("Start Call Fail"))
      }
      // setLocationTick(0)
    } else {
      onReachHandler(APICall)
      // setLocationTick(-999)
    }
  }

  // Last Instruction Reach
  const onReachHandler = (APICall = true) => {
    if (vehicleState !== "stop") {
      setVehicleState("stop")
      setOffTrack(prevState => Array(prevState.length))
      if (APICall) {
        executePostState({url: apiUri + plantRouteTaskAPI + `/${routeData.id}/finish`}).then(response => {
          updateTaskData(apiUri + plantRouteTaskAPI, "GET")
        }).catch(error => console.log("Finish Call Fail " + apiUri + plantRouteTaskAPI + `/${routeData.id}/finish`))
      } else {
        updateTaskData(apiUri + plantRouteTaskAPI, "GET")
      }
    }
  }


  const get_min_distance = (currentPosition, closest) => {
    const prev_pt = GPSData[closest.index - 1]
    const next_pt = GPSData[closest.index + 1]
    const closest_pt = GPSData[closest.index]

    if (prev_pt === undefined) return closest.distance
    if (next_pt === undefined) return closest.distance

    let A = geolib.getDistanceFromLine(
      {latitude: currentPosition.lat, longitude: currentPosition.lng},
      {latitude: closest_pt.lat, longitude: closest_pt.lng},
      {latitude: next_pt.lat, longitude: next_pt.lng},
    );

    let B = geolib.getDistanceFromLine(
      {latitude: currentPosition.lat, longitude: currentPosition.lng},
      {latitude: closest_pt.lat, longitude: closest_pt.lng},
      {latitude: prev_pt.lat, longitude: prev_pt.lng},
    );

    if (isNaN(A)) {
      A = 9999
    }
    if (isNaN(B)) {
      B = 9999
    }

    return Math.min(A, B, closest.distance)
  }

  useEffect(() => {
    if (currentGPS !== null) {
      const currentPosition = {
        lat: currentGPS.latitude,
        lng: currentGPS.longitude
      }

      if (vehicleState === "start") {

        const closest = getClosestIndexLatLng(GPSData, currentPosition)
        const min_distance = get_min_distance(currentPosition, closest)

        console.log(min_distance, offTrackDistance, offTrack.filter(Boolean).length)

        setCurrentLocation({...currentPosition, ...{closetCoord: closest.index, distance: closest.distance}})
        setOffTrack(prevState => {
          const currentState = Math.round(min_distance) > offTrackDistance
          prevState.shift()
          const newState = [...prevState, currentState]

          if (!newState.slice(-3).some((item) => item)){
            return Array(12).fill(false)
          }
          return newState
        })

      } else {
        setCurrentLocation({...currentPosition, ...{closetCoord: -1, distance: 0}})
      }
    }

  }, [currentGPS])

  const getGPSString = () => `${currentGPS.longitude},${currentGPS.latitude},${currentGPS.speed},${currentGPS.altitude},${currentGPS.heading},${currentGPS.accuracy}`

  const makeUDPRequest = (payload) => {
    const _payload = JSON.stringify(payload)
    IBeaconPlaygroundModule.makeUDPRequest(_payload)
  }

  const makeOffTrackWarning = (wn = 100) => {
    makeUDPRequest({
      "tm": Math.round(currentGPS.timestamp / 1000),
      "wn": wn,
      "gp": getGPSString()
    })
  }

  useEffect(() => {
    if (currentGPS !== null) {

      if (offTrack.filter(Boolean).length > offTrackThreshold) {
        makeOffTrackWarning(101)
      } else if (offTrack.filter(Boolean).length > offTrackWarningThreshold) {
        makeOffTrackWarning(100)
      } else {
        makeUDPRequest({
          "tm": Math.round(currentGPS.timestamp / 1000),
          "gp": getGPSString()
        })
      }
    }
  }, [offTrack])

  // Update GPS Location Function
  // useEffect(() => {
  //   if (locationTick >= 0 && locationTick < GPSData.length) {
  //     const currentLocationFake = getCurrentLocation()
  //     if (currentLocationFake === null) {
  //       return
  //     }
  //
  //     // Get The Closest Route coordinate
  //     const closest = getClosestIndexLatLng(GPSData, currentLocationFake)
  //     setCurrentLocation({...currentLocationFake, ...{closetCoord: closest.index, distance: closest.distance}})
  //
  //     // Push Record to Offtrack Queue
  //     setOffTrack(prevState => {
  //       prevState.shift()
  //       return [...prevState, closest.distance > 20]
  //     })
  //
  //     // GPS Refresh Rate 0.1s delay
  //     setTimeout(() => {
  //       setLocationTick(prevState => prevState + 2 > GPSData.length ? GPSData.length - 1 : prevState + 2)
  //       // setLocationTick(prevState => prevState + 1)
  //     }, 1000);
  //   }
  // }, [locationTick])


  // Get Data Loading Screen
  if (loading && routeData === null) return <LoadingView message={"Getting Data ..."} color={"white"}/>

  // No Data Screen
  if (routeData === null) return (
    <LoadingView message={error ? error.message : i18n.t("noDataMessage")} color={"white"}>
      <CustomButton callback={() => updateTaskData(apiUri + plantRouteTaskAPI, "GET")}
                    style={{backgroundColor: "#2E333A", borderColor: "#2E333A", height: 50}}
      >
        <Text color={{color: "white"}}>Refresh</Text>
      </CustomButton>
    </LoadingView>
  )

  // Loaded Screen
  return (
    <View style={styles.container}>
      <Header navigation={navigation}
              callback={() => {
                IBeaconPlaygroundModule.makeToast("Route Map Refreshed")
                updateTaskData(apiUri + plantRouteTaskAPI, "GET")
              }}
      />
      <View style={{alignItems: 'center', justifyContent: "center", height: "92%", width: "98%", marginBottom: 3}}>
        <MapView style={styles.map}
                 region={vehicleState === "start" ?
                   {
                     ...{latitude: currentLocation.lat, longitude: currentLocation.lng},
                     ...runningRegionDelta
                   } :
                   latLngDelta}
                 showsPointsOfInterest={false}
        >
          <RouteView coordinates={routeData.site_plant_route.route[0].coordinates}
                     startWayPoint={startWayPoint}
                     endWayPoint={endWayPoint}
          />

          <CurrentLocation coordinates={currentLocation}
                           color={"#FBBC05"}
          />
        </MapView>

        <DescriptionOverlay show={vehicleState !== "start"}
                            refreshCondition={[routeData.id]}
                            message={routeData.site_plant_route.description}
        />

        <InstructionOverlay instructions={routeData.site_plant_route.route[0].instructions}
                            currentLocation={currentLocation}
                            currentState={vehicleState}
                            GPSData={GPSData}
                            onReachHandler={onReachHandler}
                            offTrack={offTrack.filter(Boolean).length > offTrackThreshold}
                            offTrackWarning={offTrack.filter(Boolean).length > offTrackWarningThreshold}
        />
        <SwitchRouteControl availableRoute={availableRouting}
                            currentState={vehicleState}
                            callback={setRouteData}
        />
        <RouteActionControl currentState={vehicleState}
                            disable={currentGPS === null}
                            callback={actionHandler}
        />
      </View>


    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#333",
    alignItems: 'center',
    justifyContent: "center"
  },
  text: {
    margin: 2,
    color: "black"
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapRouteContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#2E333A",

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between"
  },
  BnStyle: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  startBnColor: {
    borderColor: 'rgba(52,168,83, 0.8)',
    backgroundColor: 'rgba(52,168,83, 0.6)',
  },
});