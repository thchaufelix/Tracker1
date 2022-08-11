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

  const {token, deviceData} = useContext(AccountContext);
  const [mapLoading, setMapLoading] = useState(true);

  const [routeData, setRouteData] = useState([]);

  const [startWayPoint, setStartWayPoint] = useState({latitude: 22.377510, longitude: 114.112639,});
  const [endWayPoint, setEndWayPoint] = useState({latitude: 22.377510, longitude: 114.112639,});
  const [latLngDelta, setLatLngDelta] = useState({
    latitude: 22.377510,
    longitude: 114.112639,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6
  });

  const [{data, loading, error}, executeGetLatest] = useAxios({
    method: "GET",
    url: apiUri + plantRouteTaskAPI,
    headers: {
      Authorization: "Token " + token,
      "Fcm-Imei": deviceData.imei
    },
    params: {project: deviceData.pj}
  }, {manual: true})

  useEffect(() => {
    refreshMap()
    setMapLoading(false)
  }, [])

  const refreshMap = () => {
    setMapLoading(true);
    executeGetLatest().then(response => {
      const routeData = response.data[0].site_plant_route
      setRouteData(routeData.route[0])

      const waypoints = routeData.route[0].waypoints
      const firstWayPoint = waypoints[0]
      const lastWayPoint = waypoints[waypoints.length - 1]

      const startWayPt = {latitude: firstWayPoint.latLng.lat, longitude: firstWayPoint.latLng.lng}
      const endWayPt = {latitude: lastWayPoint.latLng.lat, longitude: lastWayPoint.latLng.lng}

      setStartWayPoint(startWayPt)
      setEndWayPoint(endWayPt)

      const coordinates = routeData.route[0].coordinates
      const allLat = coordinates.map(coord => coord.lat)
      const allLng = coordinates.map(coord => coord.lng)

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


    })
  }


  if (loading) return (<View style={styles.container}>
    <Text>Getting Data ...</Text>
  </View>)

  if (mapLoading) return (<View style={styles.container}>
    <Text>Map Loading ...</Text>
  </View>)

  if (routeData.length === 0) return (<View style={styles.container}>
    <Text style={{color: "black"}}>No Data</Text>
  </View>)

  return (
    <View style={styles.container}>
      <Header navigation={navigation}/>
      <View style={{alignItems: 'center', justifyContent: "center", height: "92%", width: "98%", marginBottom: 3}}>
        <MapView style={styles.map}
                 initialRegion={latLngDelta}
                 showsPointsOfInterest={false}
        >

          <RouteView coordinates={routeData.coordinates}
                     startWayPoint={startWayPoint}
                     endWayPoint={endWayPoint}
          />

        </MapView>
        <InstructionOverlay instructions={routeData.instructions}/>
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