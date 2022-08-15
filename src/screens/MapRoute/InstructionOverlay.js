import React, {useEffect, useState} from "react";
import {View, StyleSheet} from "react-native";
import {Text} from "@ui-kitten/components";
import i18n from "i18n-js";
import {getClosestArray, haversine_distance} from "./HelperFunction";

const InstructionOverlay = ({instructions, currentLocation, GPSData, onReachHandler, offTrack}) => {

  const [nextCheckPoint, setNextCheckPoint] = useState(0)
  const [distanceToCheckPt, setDistanceToCheckPt] = useState(0)

  const wayPointReachHandler = () => {
    setNextCheckPoint(prevState => {
      if (prevState + 1 >= instructions.length) {
        onReachHandler()
      }
      return prevState + 1
    })
  }

  useEffect(() => {
    if (GPSData) {
      const nextInstruction = instructions[nextCheckPoint];
      const instructionGPSIndex = instructions.map(i => i.index)

      const closestInstructGPSIndex = getClosestArray(instructionGPSIndex, currentLocation.closetCoord)
      const closestInstruction = instructionGPSIndex.indexOf(closestInstructGPSIndex)

      console.log(closestInstructGPSIndex, closestInstruction, nextInstruction.index)

      if (nextInstruction && GPSData[nextInstruction.index]) {
        const current_latLng = [currentLocation.lat, currentLocation.lng]
        const next_latLng = [GPSData[nextInstruction.index].lat, GPSData[nextInstruction.index].lng]

        const distance = parseInt(haversine_distance(current_latLng, next_latLng) * 1000)
        setDistanceToCheckPt(distance)

        if (distance < 10) {
          wayPointReachHandler()
        }
      }
    }
  }, [currentLocation.lat, currentLocation.lng])

  return (
    <View style={styles.container}>
      <View style={[
        styles.cardContainer,
        ...(offTrack ? [styles.offTrack] : []),
      ]}>
        <Text
          style={styles.textColor}>{nextCheckPoint < instructions.length ? instructions[nextCheckPoint].text : ""}</Text>
        <View style={{flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 6}}>
          <Text
            style={styles.textColor}>{i18n.t("routeDistance")}: {distanceToCheckPt} {i18n.t("routeDistanceUnit")}</Text>
          <Text
            style={styles.textColor}>{i18n.t("routeModifier")}: {nextCheckPoint < instructions.length ? instructions[nextCheckPoint].modifier : ""}</Text>
        </View>
      </View>
    </View>
  )
}

export default InstructionOverlay;


const styles = StyleSheet.create({
  container: {
    flex: 1,

    width: "100%",
    position: "absolute",
    top: 15,

    alignItems: 'center',
    justifyContent: "center",

    backgroundColor: "transparent",
  },
  cardContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74,128,245, 1)',

    padding: 8,
    width: "92%",
    backgroundColor: 'rgba(74,128,245, 0.8)',

    alignItems: 'center',
    justifyContent: "center",
  },
  textColor: {
    color: "#eee"
  },
  offTrack: {
    borderColor: 'rgba(251, 188, 5, 1)',
    backgroundColor: 'rgba(251, 188, 5, 0.8)',
  }

});