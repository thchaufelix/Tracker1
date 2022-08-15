import {Marker, Polyline} from "react-native-maps";
import React, {useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "@ui-kitten/components";
import i18n from "i18n-js";
import CustomButton from "../../component/CustomButton";


const DescriptionOverlay = ({show, message}) => {

  const doNothing = () => {

  }

  return (
    <>
      {show ?
        <View style={styles.container}>
          <CustomButton disable={true}
                        callback={doNothing}
                        style={styles.bn}
          >
            <Text style={{color: "#eee"}}>{message}</Text>
          </CustomButton>
        </View> : null}
    </>

  )
}

export default DescriptionOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "95%",
    backgroundColor: "transparent",

    position: "absolute",
    bottom: "40%",

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
  },

  bn: {
    width: "80%",
    borderColor: 'rgba(150,150,150, 0.8)',
    backgroundColor: 'rgba(150,150,150, 0.6)',
  }


});