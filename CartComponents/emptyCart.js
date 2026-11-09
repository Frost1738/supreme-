import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyCart({ onBrowsePress }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="cart-outline" size={80} color="#C5A059" />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Looks like you haven't added anything yet
      </Text>
      <TouchableOpacity style={styles.shopButton} onPress={onBrowsePress}>
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f6f2",
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#C5A059",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8a8595",
    textAlign: "center",
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: "#C5A059",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
