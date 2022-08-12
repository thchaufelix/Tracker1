import React from "react";
import {Pressable, StyleSheet} from "react-native";

const CustomButton = ({children, callback, disable, style={}, hidden=false}) => (
  <Pressable onPress={callback}
             disabled={disable || hidden}
             style={({pressed}) => [
               styles.cardContainer,
               style,
               ...(disable ? [styles.disable] : []),
               ...(pressed ? [styles.pressed] : []),
               ...(hidden ? [styles.hidden] : []),
             ]}>
    {children}
  </Pressable>
)

export default CustomButton;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,

    padding: 4,
    width: "100%",
    height: "100%",

    alignItems: 'center',
    justifyContent: "center",
  },

  disable: {
    borderColor: 'rgba(66,66,66, 0.8)',
    backgroundColor: 'rgba(66,66,66, 0.6)',
  },
  pressed: {
    opacity: 0.6
  },
  hidden:{
    opacity:0
  }
})
