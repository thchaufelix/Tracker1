import React, {useEffect, useState} from "react";
import {Pressable, StyleSheet, View} from "react-native";
import {Text} from "@ui-kitten/components";
import i18n from "i18n-js";


const CustomButton = ({children, callback, disable, style={}}) => (
  <Pressable onPress={callback}
             disabled={disable}
             style={({pressed}) => [
               styles.cardContainer,
               style,
               ...(disable ? [styles.disable] : []),
               ...(pressed ? [styles.pressed] : []),
             ]}>
    {children}
  </Pressable>
)


const RouteActionControl = ({callback}) => {
  const [state, setState] = useState("stop");

  const onPressHandler = (action) => {
    setState(action)
    callback(action)
  }

  return (
    <View style={styles.container}>
      <CustomButton disable={state === "start"}
                    callback={() => onPressHandler("start")}
                    style={styles.startBnColor}
                    >
        <Text style={{color: "#eee"}}>{i18n.t("actionStart")}</Text>
      </CustomButton>

      <CustomButton disable={state !== "start"}
                    callback={() => onPressHandler("stop")}
                    style={styles.endBnColor}
                    >
        <Text style={{color: "#eee"}}>{i18n.t("actionEnd")}</Text>
      </CustomButton>
    </View>
  )
}

export default RouteActionControl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "80%",
    backgroundColor: "transparent",

    position: "absolute",
    bottom: 30,

    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
  },
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,

    padding: 4,
    width: 120,
    height: 60,

    alignItems: 'center',
    justifyContent: "center",
  },

  startBnColor:{
    borderColor: 'rgba(52,168,83, 0.8)',
    backgroundColor: 'rgba(52,168,83, 0.6)',
  },
  endBnColor:{
    borderColor: 'rgba(234,67,53, 0.8)',
    backgroundColor: 'rgba(234,67,53, 0.6)',
  },

  disable: {
    borderColor: 'rgba(66,66,66, 0.8)',
    backgroundColor: 'rgba(66,66,66, 0.6)',
  },
  pressed: {
    opacity: 0.6
  }

});