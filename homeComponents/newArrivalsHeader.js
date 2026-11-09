import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function NewArrivalsHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("browse");
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.heading}>New arrivals</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("browse");
        }}
      >
        <Text style={styles.link}>see more</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 150,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    color: "#C2A878",
    fontFamily: "Amethysta_400Regular",
    fontSize: 22,
  },
  link: {
    color: "#FFEFBD",
    fontFamily: "AlanSans_600SemiBold",
    fontSize: 15,
  },
});
