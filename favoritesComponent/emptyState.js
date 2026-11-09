import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

export default function EmptySavedState({ onBrowsePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="heart-outline" size={80} color="#5E5768" />
      </View>
      <Text style={styles.title}>No saved items yet</Text>
      <Text style={styles.subtitle}>
        Items you save will appear here. Start exploring our collection!
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={onBrowsePress}>
        <Text style={styles.browseButtonText}>Browse Furniture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    minHeight: height * 0.6,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0edf2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#8a8595",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: "#5E5768",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
