import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/Fontisto";

export default function CartHeader({ itemCount, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Fontisto name="shopping-bag-1" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Cart</Text>
      <View style={styles.itemCount}>
        <Text style={styles.itemCountText}>{itemCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,

    paddingBottom: 16,
    backgroundColor: "#f8f6f2",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e2e8",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  itemCount: {
    backgroundColor: "#C5A059",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  itemCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
