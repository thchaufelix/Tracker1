import {Marker} from "react-native-maps";
import React, {useEffect, useState} from "react";


const CurrentLocation = ({coordinates, color="#33ff11"}) => {

  const [position, setPosition] = useState(null)

  useEffect(() => {
    setPosition(
      {
        latitude: coordinates.lat,
        longitude: coordinates.lng
      }
    )
  }, [coordinates])

  if (position === null) return null;

  return (
    <>
      <Marker key={"currentLocation"} coordinate={position} pinColor={color}>
      </Marker>
    </>
  )
}

export default CurrentLocation;