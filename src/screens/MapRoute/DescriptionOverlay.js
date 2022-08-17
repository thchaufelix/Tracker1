import {Marker, Polyline} from "react-native-maps";
import React, {useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Card, Modal, Text} from "@ui-kitten/components";
import i18n from "i18n-js";
import CustomButton from "../../component/CustomButton";


const DescriptionOverlay = ({show, refreshCondition=[], message, callback=null}) => {

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(show), 200)
  }, [show, ...refreshCondition])

  const onPressHandler = () => {
    if (callback != null) {
      callback()
    }
    setVisible(false)
  }

  return (
    <>
      {visible ?
        <View style={styles.container}>
          <CustomButton callback={onPressHandler}
                        style={styles.bn}
          >
            <Text style={{color: "black"}}>{message}</Text>
          </CustomButton>
        </View> : null}
    </>

  )
}

export default DescriptionOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "85%",
    backgroundColor: "transparent",

    position: "absolute",
    bottom: "40%",

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
  },

  bn: {
    padding: 14,
    borderWidth: 4,
    borderColor: 'rgba(234, 67, 53, 0.8)',
    // backgroundColor: 'rgba(251, 188, 5, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  }


});