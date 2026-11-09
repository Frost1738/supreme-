// components/FontLoader.js
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useCustomFonts } from "./useCustomFonts";

export default function FontLoader({ children }) {
  const fontsLoaded = useCustomFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={styles.loadingText}>Just A Sec...</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F6F2",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#C5A059",
    fontFamily: "AlanSans_600SemiBold",
  },
});
