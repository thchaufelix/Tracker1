import React, {useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "@ui-kitten/components";
import i18n from "i18n-js";
import CustomButton from "../../component/CustomButton";


const RouteActionControl = ({currentState, callback, disable}) => {

  const onPressHandler = (action) => {
    callback(action)
  }

  return (
    <View style={styles.container}>

      {currentState !== "start" ?
        <CustomButton callback={() => onPressHandler("start")}
                      disable={disable}
                      style={[styles.startBnColor, styles.BnStyle]}
        >
          <Text style={{color: "#eee"}}>{i18n.t("actionStart")}</Text>
        </CustomButton> : null}

      {currentState === "start" ?
        <CustomButton callback={() => onPressHandler("stop")}
                      disable={disable}
                      style={[styles.endBnColor, styles.BnStyle]}
        >
          <Text style={{color: "#eee"}}>{i18n.t("actionEnd")}</Text>
        </CustomButton> : null}

    </View>
  )
}

export default RouteActionControl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 80,
    backgroundColor: "transparent",

    position: "absolute",
    bottom: 30,

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
  },

  BnStyle:{
    width: 80,
    height: 80,
    borderRadius: 40
  },
  startBnColor: {
    borderColor: 'rgba(52,168,83, 0.8)',
    backgroundColor: 'rgba(52,168,83, 0.6)',
  },
  endBnColor: {
    borderColor: 'rgba(234,67,53, 0.8)',
    backgroundColor: 'rgba(234,67,53, 0.6)',
  },

});