import {Marker, Polyline} from "react-native-maps";
import React, {useEffect, useState} from "react";


const RouteView = ({coordinates, startWayPoint, endWayPoint}) => {
  const [route, setRoute] = useState([])

  useEffect(() => {
    setRoute(coordinates.map(coord => {
        return {
          latitude: coord.lat,
          longitude: coord.lng
        }
      })
    )}, [coordinates])

  return (
    <>
      <Marker key={"wayPointStart"} coordinate={startWayPoint} >
      </Marker>

      <Marker key={"wayPointEnd"} coordinate={endWayPoint} pinColor={'rgba(74,128,245, 1)'}>
      </Marker>

      <Polyline coordinates={route}
                strokeWidth={3}
                strokeColor={'rgba(234,67,54,1)'}
      />
    </>
  )
}

export default RouteView;