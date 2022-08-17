import React, {useContext, useEffect, useState} from "react";
import {View, StyleSheet, Dimensions} from 'react-native'
import {Text} from "@ui-kitten/components";
import MapView, {Circle, Marker, Polyline} from "react-native-maps";
import i18n from "i18n-js";
import {MaterialIcons} from "@expo/vector-icons";
import {AccountContext} from "../../Context/authContext";
import {apiUri, domain, plantRouteTaskAPI} from "../../global/constants";
import useAxios from "axios-hooks";
import RouteView from "./RouteView";
import InstructionOverlay from "./InstructionOverlay";
import CurrentLocation from "./CurrentLocation";
import LoadingView from "../../global/LoadingView";
import RouteActionControl from "./RouteActionControl";
import SwitchRouteControl from "./SwitchRouteControl";
import CustomButton from "../../component/CustomButton";
import DescriptionOverlay from "./DescriptionOverlay";
import {getClosestArray, getClosestIndexLatLng} from "./HelperFunction";


const Header = ({navigation}) => {

  const toggleDrawer = () => navigation.openDrawer();
  return (
    <View style={styles.mapRouteContainer}>
      <MaterialIcons onPress={toggleDrawer} name="menu" size={24} color="white" style={{marginLeft: 15}}/>
      <View style={{width: "100%", alignItems: "center"}}>
        <Text style={{marginRight: 70}}> {i18n.t("MapRoute")}</Text>
      </View>
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
  const [locationTick, setLocationTick] = useState(-1);
  const [currentLocation, setCurrentLocation] = useState({lat: 0, lng: 0, index: -1, closetCoord: 0});
  const [vehicleState, setVehicleState] = useState("stop")

  // Basic Params
  const {token, deviceData} = useContext(AccountContext);
  const runningRegionDelta = {
    latitudeDelta: 0.012,
    longitudeDelta: 0.012
  }

  // Control Setting
  const [availableRouting, setAvailableRouting] = useState([]);
  const [offTrack, setOffTrack] = useState(Array(10).fill(false));

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
      setLocationTick(0)
    } else {
      onReachHandler(APICall)
      setLocationTick(-999)
    }
  }

  // Last Instruction Reach
  const onReachHandler = (APICall = true) => {
    if (vehicleState !== "stop") {
      setVehicleState("stop")
      if (APICall) {
        executePostState({url: apiUri + plantRouteTaskAPI + `/${routeData.id}/finish`}).then(response => {
          updateTaskData(apiUri + plantRouteTaskAPI, "GET")
        }).catch(error => console.log("Finish Call Fail " + apiUri + plantRouteTaskAPI + `/${routeData.id}/finish`))
      } else {
        updateTaskData(apiUri + plantRouteTaskAPI, "GET")
      }
    }
  }


  const getCurrentLocation = () => {
    return {
      lat: GPSData[locationTick].lat + (Math.random() - 0.5) / 4000,
      lng: GPSData[locationTick].lng + (Math.random() - 0.5) / 4000,
    }
  }

  // Update GPS Location Function
  useEffect(() => {
    if (locationTick >= 0 && locationTick < GPSData.length) {
      const currentLocationFake = getCurrentLocation()

      // Get The Closest Route coordinate
      const closest = getClosestIndexLatLng(GPSData, currentLocationFake)
      setCurrentLocation({...currentLocationFake, ...{closetCoord: closest.index, distance: closest.distance}})

      // Push Record to Offtrack Queue
      setOffTrack(prevState => {
        prevState.shift()
        return [...prevState, closest.distance > 20]
      })

      // GPS Refresh Rate 0.1s delay
      setTimeout(() => {
        setLocationTick(prevState => prevState + 2 > GPSData.length ? GPSData.length - 1 : prevState + 2)
      }, 100);
    }
  }, [locationTick])


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
      <Header navigation={navigation}/>
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
                            offTrack={offTrack.filter(Boolean).length > 6}
        />
        <SwitchRouteControl availableRoute={availableRouting}
                            currentState={vehicleState}
                            callback={setRouteData}
        />
        <RouteActionControl currentState={vehicleState}
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
  }
});