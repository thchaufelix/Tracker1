import React, {useContext, useEffect, useState} from "react";
import {View, StyleSheet, Dimensions} from 'react-native'
import {Text} from "@ui-kitten/components";
import MapView, {Marker, Polyline} from "react-native-maps";
import i18n from "i18n-js";
import {MaterialIcons} from "@expo/vector-icons";
import {AccountContext} from "../../Context/authContext";
import {apiUri, domain, plantRouteTaskAPI} from "../../global/constants";
import useAxios from "axios-hooks";

const initialRegion = {
  latitude: 22.377510,
  longitude: 114.112639,
  latitudeDelta: 0.6,
  longitudeDelta: 0.6,
}


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

const RouteView = ({data}) => {
  return (
    <>
      {data.route[0].waypoints.map((pt, index) =>
        <RenderMarker index={"marker_" + index}
                      latLng={{
                        latitude: pt.latLng.lat,
                        longitude: pt.latLng.lng
                      }}
        />)}

      <Polyline coordinates={data.route[0].coordinates.map(coord => {
        return {
          latitude: coord.lat,
          longitude: coord.lng
        }
      })}
                strokeWidth={1}
                strokeColor={'rgba(255,0,0,0.7)'}
      />
    </>
  )
}

const RenderMarker = ({latLng, index}) => {
  return <Marker coordinate={latLng}
                 key={index}
  />
}


export default function MapRoute({navigation}) {

  const {token, deviceData} = useContext(AccountContext)
  const [routeData, setRouteData] = useState([]);

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
      console.log(response.data)
    })
  }


  if (loading) return (<View style={styles.container}>
      <Text style={{color: "black"}}>Now Loading</Text>
    </View>)

  if (routeData.length === 0) return (<View style={styles.container}>
      <Text style={{color: "black"}}>No Data</Text>
    </View>)

  return (
    <View style={styles.container}>
      <Header navigation={navigation}/>
      <View style={{alignItems: 'center', justifyContent: "center", height: "92%", width: "98%"}}>
        <MapView style={styles.map}
                 initialRegion={initialRegion}
                 showsPointsOfInterest={false}
        >

          <RouteView data={routeData[0].site_plant_route}/>

        </MapView>
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