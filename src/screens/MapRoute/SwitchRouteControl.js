import {Marker, Polyline} from "react-native-maps";
import React, {useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "@ui-kitten/components";
import i18n from "i18n-js";
import CustomButton from "../../component/CustomButton";


const SwitchRouteControl = ({currentState, availableRoute, callback}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelectHandler = (select) => {
    let newIndex = selectedIndex;
    if (select === "<-") {
      newIndex = selectedIndex - 1
    }
    if (select === "->") {
      newIndex = selectedIndex + 1
    }

    newIndex = Math.min(Math.max(newIndex, 0), availableRoute.length - 1)
    callback(availableRoute[newIndex])
    setSelectedIndex(newIndex)
  }

  return (
    <View style={styles.container}>
      <CustomButton disable={selectedIndex === 0}
                    hidden={currentState === "start"}
                    callback={() => onSelectHandler("<-")}
                    style={styles.bn}
      >
        <Text style={{color: "#eee"}}>{"<-"}</Text>
      </CustomButton>

      <CustomButton disable={selectedIndex + 1 >= availableRoute.length}
                    hidden={currentState === "start"}
                    callback={() => onSelectHandler("->")}
                    style={styles.bn}
      >
        <Text style={{color: "#eee"}}>{"->"}</Text>
      </CustomButton>
    </View>
  )
}

export default SwitchRouteControl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "95%",
    backgroundColor: "transparent",

    position: "absolute",
    bottom: 40,

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
  },
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,

    padding: 4,

    alignItems: 'center',
    justifyContent: "center",
  },

  bn: {
    width: 105,
    height: 60,
    borderColor: 'rgba(52,168,83, 0.8)',
    backgroundColor: 'rgba(52,168,83, 0.6)',
  }


});