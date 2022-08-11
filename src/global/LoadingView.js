import React from "react";
import {Text} from "@ui-kitten/components";
import {StyleSheet, View} from "react-native";


export default function LoadingView({message, color="black"}) {

  return (
    <View style={styles.container}>
      <Text style={{color: color}}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#333",
    alignItems: 'center',
    justifyContent: "center"
  },
})