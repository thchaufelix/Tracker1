import React from "react";
import {Pressable, StyleSheet} from "react-native";

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

export default CustomButton;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,

    padding: 4,
    width: 120,
    height: 60,

    alignItems: 'center',
    justifyContent: "center",
  },

  disable: {
    borderColor: 'rgba(66,66,66, 0.8)',
    backgroundColor: 'rgba(66,66,66, 0.6)',
  },
  pressed: {
    opacity: 0.6
  }
})
