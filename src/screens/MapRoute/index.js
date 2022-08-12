import React, {useContext, useEffect, useState} from "react";
import {View, StyleSheet, Dimensions} from 'react-native'
import {Text} from "@ui-kitten/components";
import MapView, {Marker, Polyline} from "react-native-maps";
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


export default function MapRoute({navigation}) {

  // GPS Location Control
  const [locationTick, setLocationTick] = useState(-1);
  const [currentLocation, setCurrentLocation] = useState({lat: 0, lng: 0, index: -1});
  const [vehicleState, setVehicleState] = useState("stop")

  // Basic Params
  const {token, deviceData} = useContext(AccountContext);

  // Control Setting
  const [mapLoading, setMapLoading] = useState(true);
  const [availableRouting, setAvailableRouting] = useState([]);

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
    method: "GET",
    headers: {
      Authorization: "Token " + token,
      "Fcm-Imei": deviceData.imei
    },
    params: {project: deviceData.pj}
  }, {manual: true});

  const updateTaskData = (url) => {
    executeGetLatest({url: url}).then(response => {
      setAvailableRouting(response.data)
      console.log(response.data[0])
      loadRoute(response.data[0])
    })
  }

  const loadRoute = (routeData) => {
    setRouteData(routeData)

    const waypoints = routeData.site_plant_route.route[0].waypoints
    const firstWayPoint = waypoints[0]
    const lastWayPoint = waypoints[waypoints.length - 1]

    const startWayPt = {latitude: firstWayPoint.latLng.lat, longitude: firstWayPoint.latLng.lng}
    const endWayPt = {latitude: lastWayPoint.latLng.lat, longitude: lastWayPoint.latLng.lng}

    setStartWayPoint(startWayPt)
    setEndWayPoint(endWayPt)

    const coordinates = routeData.site_plant_route.route[0].coordinates
    const allLat = coordinates.map(coord => coord.lat)
    const allLng = coordinates.map(coord => coord.lng)

    setGPSData(coordinates)

    const maxLat = Math.max(...allLat)
    const minLat = Math.min(...allLat)
    const maxLng = Math.max(...allLng)
    const minLng = Math.min(...allLng)

    const latLng = {
      latitude: (maxLat + minLat) / 2,
      longitude: (maxLng + minLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.35,
      longitudeDelta: (maxLng - minLng) * 1.35,
    }

    setLatLngDelta(prev => {
      return {...prev, ...latLng}
    })
  }

  useEffect(() => {
    updateTaskData(apiUri + plantRouteTaskAPI)

    setMapLoading(false)
  }, [])


  const actionHandler = (action) => {
    setVehicleState(action)
    if (action === "start") {
      setLocationTick(0)
    } else {
      setLocationTick(-999)
    }
  }

  const onReachHandler = () => {
    console.log("finish end")
    setVehicleState("stop")
  }

  // Update GPS Location Function
  useEffect(() => {
    if (locationTick >= 0 && locationTick < GPSData.length) {
      setCurrentLocation(GPSData[locationTick])

      setTimeout(() => {
        setLocationTick(prevState => prevState + 2 > GPSData.length ? GPSData.length - 1 : prevState + 2)
      }, 100);
    }
  }, [locationTick])


  if (loading) return <LoadingView message={"Getting Data ..."} color={"white"}/>
  if (mapLoading) return <LoadingView message={"Map Loading ..."} color={"white"}/>
  if (routeData === null) return <LoadingView message={error ? error.message : "No Data"} color={"white"}/>

  return (
    <View style={styles.container}>
      <Header navigation={navigation}/>
      <View style={{alignItems: 'center', justifyContent: "center", height: "92%", width: "98%", marginBottom: 3}}>
        <MapView style={styles.map}
                 region={latLngDelta}
                 showsPointsOfInterest={false}
        >

          <RouteView coordinates={routeData.site_plant_route.route[0].coordinates}
                     startWayPoint={startWayPoint}
                     endWayPoint={endWayPoint}
          />
          <CurrentLocation coordinates={currentLocation}/>

        </MapView>

        <InstructionOverlay instructions={routeData.site_plant_route.route[0].instructions}
                            currentLocation={currentLocation}
                            GPSData={GPSData}
                            onReachHandler={onReachHandler}
        />
        <SwitchRouteControl availableRoute={availableRouting}
                            currentState={vehicleState}
                            callback={loadRoute}
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
    zIndex: 2,

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between"
  }
});