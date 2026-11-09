import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function FeaturedHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Popular Sets</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    paddingTop: 30,
    marginBottom: 30,

    paddingHorizontal: 30,
  },
  text: {
    fontFamily: "Agbalumo_400Regular",
    fontSize: 20,
    color: "#D7CEB2",
    marginRight: 10,
  },
});
