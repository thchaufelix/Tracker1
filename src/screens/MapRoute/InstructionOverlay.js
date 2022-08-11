import React, {useEffect, useState} from "react";
import {View, StyleSheet} from "react-native";
import {Text} from "@ui-kitten/components";
import i18n from "i18n-js";

const InstructionOverlay = ({instructions}) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.textColor}>{instructions[0].text}</Text>
        <View style={{flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 6}}>
          <Text
            style={styles.textColor}>{i18n.t("routeDistance")}: {instructions[0].distance} {i18n.t("routeDistanceUnit")}</Text>
          <Text style={styles.textColor}>{i18n.t("routeModifier")}: {instructions[0].modifier}</Text>
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
  }

});