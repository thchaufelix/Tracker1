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

  const {token, deviceData} = useContext(AccountContext)
  const [routeData, setRouteData] = useState([]);
  const [startWayPoint, setStartWayPoint] = useState({});
  const [endWayPoint, setEndWayPoint] = useState({});

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
  }, [])

  const refreshMap = () => {
    executeGetLatest().then(response => {
      setRouteData(response.data)

      if (response.data) {
        const waypoints = response.data[0].site_plant_route.route[0].waypoints
        setStartWayPoint({
          latitude: waypoints[0].latLng.lat,
          longitude: waypoints[0].latLng.lng
        })
        setEndWayPoint({
          latitude: waypoints[waypoints.length - 1].latLng.lat,
          longitude: waypoints[waypoints.length - 1].latLng.lng
        })
      }

    })
  }


  if (loading) return (<View style={styles.container}>
    <Text>Now Loading</Text>
  </View>)

  if (routeData.length === 0) return (<View style={styles.container}>
    <Text style={{color: "black"}}>No Data</Text>
  </View>)

  return (
    <View style={styles.container}>
      <Header navigation={navigation}/>
      <View style={{alignItems: 'center', justifyContent: "center", height: "92%", width: "98%", marginBottom: 3}}>
        <MapView style={styles.map}
                 initialRegion={{
                   latitude: (startWayPoint.latitude + endWayPoint.latitude) /2,
                   longitude: (startWayPoint.longitude + endWayPoint.longitude) /2,
                   latitudeDelta: 0.22,
                   longitudeDelta: 0.22,
                 }}
                 showsPointsOfInterest={false}
        >

          <RouteView data={routeData[0].site_plant_route}
                     startWayPoint={startWayPoint}
                     endWayPoint={endWayPoint}
          />

        </MapView>
        <InstructionOverlay instructions={routeData[0].site_plant_route.route[0].instructions} />
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