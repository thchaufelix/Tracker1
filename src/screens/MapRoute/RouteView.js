import {Marker, Polyline} from "react-native-maps";
import React, {useEffect, useState} from "react";


const RouteView = ({data, startWayPoint, endWayPoint}) => {
  const [route, setRoute] = useState([])

  console.log("rendering")

  useEffect(() => {
    setRoute(
      data.route[0].coordinates.map(coord => {
        return {
          latitude: coord.lat,
          longitude: coord.lng
        }
      })
    )}, [data])

  return (
    <>
      <Marker key={"wayPointStart"} coordinate={startWayPoint}>
      </Marker>

      <Marker key={"wayPointEnd"} coordinate={endWayPoint}>
      </Marker>

      <Polyline coordinates={route}
                strokeWidth={3}
                strokeColor={'rgba(234,67,54,1)'}
      />
    </>
  )
}

export default RouteView;