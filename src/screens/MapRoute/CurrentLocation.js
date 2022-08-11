import {Marker} from "react-native-maps";
import React, {useEffect, useState} from "react";


const CurrentLocation = ({coordinates}) => {

  // useEffect(() => {
  //   setRoute(
  //     coordinates.map(coord => {
  //       return {
  //         latitude: coord.lat,
  //         longitude: coord.lng
  //       }
  //     })
  //   )}, [coordinates])

  return (
    <>
      <Marker key={"currentLocation"} coordinate={coordinates}>
      </Marker>
    </>
  )
}

export default CurrentLocation;